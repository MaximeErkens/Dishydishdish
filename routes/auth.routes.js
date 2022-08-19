const authRouter = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

authRouter.get("/register", isLoggedOut, (req, res) => {
  res.render("auth/register");
});

authRouter.post("/register", isLoggedOut, (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username) {
    return res.status(400).render("auth/register", {
      errorMessage: "Please provide your username.",
      ...req.body,
    });
  }

  if (!email) {
    return res.status(400).render("auth/register", {
      emailError: "Please add an email",
      ...req.body,
    });
  }

  if (!password) {
    return res.status(400).render("auth/register", {
      passwordError: "Please add a password",
      ...req.body,
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/register", {
      errorMessage: "Your password needs to be at least 8 characters long.",
      ...req.body,
    });
  }

  if (!email.includes("@")) {
    return res.status(400).render("auth/register", {
      emailError:
        "Please add, at the very least an @ symbol. We dont ask for THAT much",
      ...req.body,
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).render("auth/register", {
      passwordError:
        "Could you at least pretend like you give a damn?. Could these AT LEAST be the same? For once?... Could you not? We've been through this... It is written... Are you that dumb? You must be... Otherwise you would have done what we ask you to do... So could you, for once in your miserable life, do what youre told? Thank you",
      ...req.body,
    });
  }

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

  // Search the database for a user with the username submitted in the form
  User.findOne({ $or: [{ username }, { email }] }).then((possibleUser) => {
    // If the user is found, send the message username is taken
    if (possibleUser) {
      return res.status(400).render("auth/register", {
        errorMessage: "Username already taken.",
        ...req.body,
      });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          password: hashedPassword,
          email,
        });
      })
      .then((possibleUser) => {
        // Bind the user to the session object
        req.session.user = possibleUser;
        // res.redirect("/");
        res.redirect(`/user/${possibleUser._id}`);
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/register", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/register", {
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
          });
        }
        return res
          .status(500)
          .render("auth/register", { errorMessage: error.message });
      });
  });
});

authRouter.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

authRouter.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your username.",
    });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ username })
    .then((possibleUser) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!possibleUser) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
        });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, possibleUser.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).render("auth/login", {
            errorMessage: "Wrong credentials.",
          });
        }
        req.session.user = possibleUser;
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        // return res.redirect("/");
        res.redirect(`/user/${possibleUser._id}`);
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

authRouter.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

module.exports = authRouter;
