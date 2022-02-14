const { Schema, model } = require('mongoose');

const categorySchema = Schema({
  language: String,
  costs: Object,
  income: Object,
});

const Category = model('category', categorySchema);

module.exports = Category;
