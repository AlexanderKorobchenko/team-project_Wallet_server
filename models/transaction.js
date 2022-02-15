const { Schema, model } = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const transactionSchema = Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    category: {
      type: String,
      required: [true, 'choose the category from the list'],
    },
    comment: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'fill in the amount'],
    },
    currentBalance: {
      type: Number,
      required: [true, "No fuckin' balance, calculate it!!"],
    },
    isIncome: {
      type: Boolean,
      required: [true, 'Indicate whether this is income or expenditure'],
    },
    date: {
      type: Number,
      required: [true, 'date is required']
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

const Transaction = model('transaction', transactionSchema);

const joiSchema = Joi.object({
  owner: Joi.objectId(),
  category: Joi.string().required(),
  comment: Joi.string(),
  amount: Joi.number().required(),
  currentBalance: Joi.number(),
  isIncome: Joi.boolean().required(),
  date: Joi.number(),
  month: Joi.string(),
  year: Joi.string(),
});

module.exports = {
  Transaction,
  joiSchema,
};
