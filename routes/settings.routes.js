const { Router } = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const UserModel = require("../models/User.model");
const bcrypt = require("bcrypt");
const {
  Types: { ObjectId },
} = require("mongoose");
const bcrypting = require("../utils/bcrypting");
const { z } = require("zod");

const settingsRouter = Router();

async function checkIfUserExists(req, res, next) {
  const user = await UserModel.findById(req.session.user);

  if (!user) {
    return res.redirect("/");
  }

  req.user = user;

  next();
}

// ------------------------- THIS HAPPENS IN EVERY ROUTE OF THIS ROUTER ----------------------------------- //
settingsRouter.use(isLoggedIn);
settingsRouter.use(checkIfUserExists);

settingsRouter.get("/", (req, res) => {
  res.render("settings/home");
});

settingsRouter.get("/update-user", async (req, res) => {
  res.render("settings/update-user", { user: req.user });
});

settingsRouter.post("/update-user", async (req, res) => {
  const { username = "", email = "" } = req.body;
  console.log(username, email);
  if (username.length < 4) {
    console.log("HI");
    return res.status(400).render("settings/update-user", {
      usernameError: "Please choose something with more than 4 characters",
      ...req.body,
    });
  }

  if (!email.includes("@")) {
    return res.status(400).render("settings/update-user", {
      emailError:
        "Please add, at the very least an @ symbol. We dont ask for THAT much",
      ...req.body,
    });
  }
  const aSingleUser = await UserModel.findOne({
    $or: [{ username }, { email }],
    _id: { $ne: ObjectId(req.session.user._id) },
  });
  console.log(aSingleUser);

  if (!aSingleUser) {
    await UserModel.findByIdAndUpdate(req.session.user._id, {
      username,
      email,
    });
    return res.redirect("/");
  }

  UserModel.find({
    _id: {
      $nin: [ObjectId(req.session.user._id)],
      $or: [{ username }, { email }],
    },
  });

  // No can do. you cannot update your username or email, because one of these is already taken

  res.status(400).render("settings/update-user", {
    errorMessage:
      "One of those is taken, please rewrite either the username or email",
  });
});

settingsRouter.get("/update-password", async (req, res) => {
  res.render("settings/update-password", { user: req.user });
});

settingsRouter.post("/update-password", async (req, res) => {
  const { user } = req;

  const {
    currentPassword = "",
    newPassword = "",
    newPasswordAgain = "",
  } = req.body;

  if (
    !currentPassword ||
    newPassword.length < 8 ||
    newPasswordAgain.length < 8 ||
    newPassword !== newPasswordAgain
  ) {
    //
    return res.status(400).render("settings/update-password", {
      user,
      errorMessage: "Fill every input correctly",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).render("settings/update-password", {
      user,
      errorMessage: "Please write a new password",
    });
  }

  const isSamePassword = bcrypt.compareSync(currentPassword, user.password);

  if (!isSamePassword) {
    return res.status(400).render("settings/update-password", {
      user,
      errorMessage: "That is not your password",
    });
  }

  const hashedPassword = bcrypting(newPassword);

  await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

  res.redirect("/");
});

module.exports = settingsRouter;
