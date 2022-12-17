const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
require("dotenv").config();



const UtilizadorSchema = new mongoose.Schema(
  {
    //_id: mongoose.Schema.Types.ObjectId,
    email: {
      type: String,
      require: [true, "Enter an email address."],
      unique: [true, "That email address is taken."],
      lowercase: true,
      validate: [validator.isEmail, "Enter a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Enter a password."],
    },

    passwordConfirm: {
      type: String,
      required: [false, "Retype your password."],
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    hasAnuncio: {
      type: Boolean,
      default: false,
    },
    idanuncio:{
      type: String,
      default: "",
      }
  },
  { timestamps: true }
);

UtilizadorSchema.pre("save", async function (next) {
  //hash the password, set hash cost to 12
  this.password = await bcrypt.hash(this.password, 12);

  //remove the passwordConfirmed field
  this.passwordConfirm = undefined;
  next();
});



//check password at login
UtilizadorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Utilizador", UtilizadorSchema);
