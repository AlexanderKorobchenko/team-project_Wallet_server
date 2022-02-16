const express = require('express');
const router = express.Router();
const { BadRequest } = require('http-errors');

const { Transaction, User, Category } = require('../models');
const { joiSchema } = require('../models/transaction');
const authenticate = require('../middlewares/authentication');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const transactions = await Transaction.find({ owner: _id }, '-createdAt -updatedAt -owner');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get('/period', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { year, month } = req.query;
    let categories = null;

    if (!year) {
      year = new Date().getFullYear();
    }
    if (!month) {
      month = (Number(new Date().getMonth()) + 1).toString();
    }

    const transactions = await Transaction.find(
      { owner: _id, year, month },
      '-createdAt -updatedAt',
    );

    const totalIncome = transactions
      .filter(({ isIncome }) => isIncome === true)
      .reduce((acc, element) => {
        return (acc += element.amount);
      }, 0);

    const expenditures = transactions.filter(({ isIncome }) => isIncome === false);
    const totalExpenditures = expenditures.reduce((acc, element) => {
      return (acc += element.amount);
    }, 0);

    const { costs } = await Category.findOne({ language: 'en' }, '-_id -language');
    const categoriesKeys = Object.keys(costs);
    for (key of categoriesKeys) {
      categories = {
        ...categories,
        [key]: expenditures
          .filter(({ category }) => category === key)
          .reduce((acc, element) => {
            return (acc += element.amount);
          }, 0),
      };
    }

    const result = {
      totalExpenditures,
      totalIncome,
      categories,
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const { date, amount, isIncome, comment, category } = req.body;

    const formattedDate = new Date(date);
    const month = (Number(formattedDate.getMonth()) + 1).toString();
    const year = formattedDate.getFullYear();

    const { balance } = await User.findById(_id);
    let currentBalance = 0;
    if (isIncome) {
      currentBalance = balance + amount;
    } else {
      currentBalance = balance - amount;
    }

    await User.findByIdAndUpdate(_id, { balance: currentBalance }, { new: true });

    const newTransaction = await Transaction.create({
      ...req.body,
      owner: _id,
      month,
      year,
      currentBalance,
      comment,
      category,
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    if (error.message.includes('validation failed')) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
