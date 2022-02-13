const express = require("express");
const router = express.Router();
const { NotFound, BadRequest } = require("http-errors");
const  authenticate  = require('../middlewares/authentication');

const { Transaction } = require('../models');
const { joiSchema } = require('../models/transaction');

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10} = req.query;
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    let transactions = await Transaction.find(
      { owner: _id},
      "-createdAt -updatedAt",
      {
        skip,
        limit: Number(limit),
      }
    );
    res.json(transactions);
  }
  catch (error) {
    next(error);
  }
});
// router.get("/:id", authenticate, async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const product = await Contact.findById(id);
//     if (!product) {
//       throw new NotFound();
//     }
//     res.json(product);
//   } catch (error) {
//     if (error.message.includes("Cast to ObjectId failed")) {
//       error.status = 404;
//     }
//     next(error);
//   }
// });
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const date = req.body.date;
    const formattedDate = new Date(date);
    const month = (Number(formattedDate.getMonth())+1).toString();
    const year = formattedDate.getFullYear();
    console.log('timing', date, month, year);

    const newTransaction = await Transaction.create({ ...req.body, owner: _id, month, year });
    res.status(201).json(newTransaction);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }

    next(error);
  }
});


// router.delete("/:id", authenticate, async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const deleteTransaction = await Transaction.findByIdAndRemove(id);
//     if (!deleteTransaction) {
//       throw new NotFound();
//     }
//     res.json({ message: "Transaction deleted" });
//   } catch (error) {
//     next(error);
//   }
// });


module.exports = router;
