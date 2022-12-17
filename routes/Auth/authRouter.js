const express = require('express');
const authController = require('../../controllers/authController');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/changepassword', authController.changePassworduser);
router.get('/logout', authController.logoutUser);
module.exports = router;

/* 
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.SECRET;
const Utilizador = require("../../models/Utilizador");

//Validation of user inputs
const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  nomePerfil: Joi.string().min(3).required(),
  email: Joi.string().min(3).required().email(),
  password: Joi.string().min(6).required(),
  //role: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(3).required().email(),
  password: Joi.string().min(6).required(),
});

//Signup user
router.post("/register", async (req, res) => {
  const emailExist = await Utilizador.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("Email already exists.");
  }
  //Hash the password.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Add user to DB
  const novoUtilizador = new Utilizador({
    nomePerfil: req.body.nomePerfil,
    email: req.body.email,
    password: hashedPassword,
    //role: req.body.role,
  });

  try {
    const { error } = await registerSchema.validateAsync(req.body);

    //throwback the error if exists.
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    } else {
      //new user was added
      const saveUtilizador = await novoUtilizador.save();
      res.status(200).send("User created.");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//login user
router.post("/login", async (req, res) => {
  //Check if user email exists
  const user = await Utilizador.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email not found.");

  //check if user password matches
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect password.");

  try {
    //validation of user input
    const { error } = await loginSchema.validateAsync(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    else {
      //res.send("Success!");
      //Sending back the token
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

      res.header("auth-token", token).send(token);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
 */