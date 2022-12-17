const Utilizador = require("./../models/Utilizador");
const AppError = require("./../utils/AppError");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcrypt");

//create token for authenticated user
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createUserToken = async (user, code, req, res) => {
  const token = signToken(user._id);

  //set expiry to 1 month
  let d = new Date();
  d.setDate(d.getDate() + 30);

  //cookie settings
  res.cookie("jwt", token, {
    expires: d,
    httpOnly: false,
    SameSite: "none",
  });

  //remove user password from output
  user.password = undefined;
  res.status(code).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//create new user
exports.registerUser = async (req, res, next) => {
  //pass in request data here to create user from user schema

  //check if mail already exists.
  const emailExist = await Utilizador.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(401).send("O Email já está registado.");
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(401).send("As passwords não coincidem.");
  }

  try {
    const newUser = await Utilizador.create({
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createUserToken(newUser, 200, req, res);
    //if user can't be created, throw an error
  } catch (err) {
    next(err);
  }
};

//log user in
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email & password exist
  if (!email || !password) {
    return res.status(401).send("Introduza um email e password.");
  }

  //check if user & password are correct
  const user = await Utilizador.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).send("Dados de acesso incorretos.");
  }

  createUserToken(user, 200, req, res);
});

//Change user password
exports.changePassworduser = catchAsync(async (req, res, next) => {
  const { password, email, novapassword, novapasswordConfirm } = req.body;

  //check if email & password exist
  if (!novapassword || !password) {
    return res.status(401).send("Introduza a sua password e uma nova password.");
  }
  if (novapassword !== novapasswordConfirm) {
    return res.status(401).send("As passwords não coincidem.");
  }

  const user = await Utilizador.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).send("A sua password atual está incorreta.");
  } else {
    user.password = novapassword;
    user.save();
    res.clearCookie("jwt");
    createUserToken(user, 200, req, res);
  }

});

//check if user is logged in
exports.checkUser = catchAsync(async (req, res, next) => {
  console.log("triggered checkuser");
  let currentUser;
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    currentUser = await Utilizador.findById(decoded.id);
  } else {
    currentUser = null;
  }

  res.status(200).send({ currentUser });
});

//log user out
exports.logoutUser = catchAsync(async (req, res) => {
  console.log("log out triggered.");
  res.clearCookie("jwt");
  res.status(200).redirect("/");
});
