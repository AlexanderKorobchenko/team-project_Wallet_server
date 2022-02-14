const express = require('express');
const router = express.Router();
const { NotFound, BadRequest } = require('http-errors');
const authenticate = require('../middlewares/authentication');

const { Transaction, User } = require('../models');
const { joiSchema } = require('../models/transaction');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const transactions = await Transaction.find({ owner: _id }, '-createdAt -updatedAt');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get('/period', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { year, month } = req.query;
    let transactions = [];
    if (!year) {
      throw new Error('year is obligatory parameter');
    }
    if (!month) {
      transactions = await Transaction.find({ owner: _id, year }, '-createdAt -updatedAt');
    } else {
      transactions = await Transaction.find({ owner: _id, year, month }, '-createdAt -updatedAt');
    }
    res.json(transactions);
  } catch (error) {
    if (error.message.includes('year is obligatory parameter')) {
      error.status = 400;
    }
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
    const { date, amount, isIncome } = req.body;

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
