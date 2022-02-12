const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nanoid = require("nanoid");

const { SECRET_KEY } = process.env;

// const { joiRegisterSchema, joiLoginSchema } = require("../../model/user");
const { User } = require("../models/");
const authentication = require("../middlewares/authentication");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    // const { error } = joiRegisterSchema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({
    //     message: error.message,
    //   });
    // }

    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "Email in use",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      balance: 0,
      token,
    });
    res.status(201).json({
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        balance: newUser.balance,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // const { error } = joiLoginSchema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({
    //     message: error.message,
    //   });
    // }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Email or password is wrong",
      });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({
        message: "Email or password is wrong",
      });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", authentication, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/current", authentication, async (req, res) => {
  const { name, email, balance } = req.user;
  res.json({ user: { name, email, balance } });
});

module.exports = router;
