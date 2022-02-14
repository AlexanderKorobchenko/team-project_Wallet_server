const express = require('express');
const { BadRequest } = require('http-errors');

const { Category } = require('../models');
const authentication = require('../middlewares/authentication');

const router = express.Router();

router.get('/', authentication, async (req, res, nex) => {
  try {
    const { lang = 'en' } = req.query;

    const categories = await Category.findOne({ language: lang }, '-_id -language');
    if (!categories) {
      return res.status(404).json({
        message: `Language "${lang}" not found. Try other languages.`,
      });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
