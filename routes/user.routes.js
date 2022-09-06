const { Router } = require("express");
const UserModel = require("../models/User.model");
const { isValidObjectId } = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");

const userRouter = Router();

userRouter.get("/:userId", isLoggedIn, (req, res) => {
  // check if it is a valid ObjectId
  const isValidId = isValidObjectId(req.params.userId);

  if (!isValidId) {
    return res.redirect("/");
  }

  UserModel.findById(req.params.userId)
    .then((possibleUser) => {
      if (!possibleUser) {
        return res.redirect("/");
      }

      //console.log("possibleUser:", possibleUser);
      res.render("user/personal", {
        user: possibleUser,
        userId: req.params.userId,
      });
    })
    .catch((err) => {
      console.log("err:", err);
      res.status(500).redirect("/");
    });
});

userRouter.get("/", isLoggedIn, (req, res) => {
  UserModel.findById(req.session.user._id) // get id of logged in user from session
    .then((possibleUser) => {
      if (!possibleUser) {
        return res.redirect("/");
      }

      //console.log("possibleUser:", possibleUser);
      res.render("user/personal", {
        user: possibleUser,
        userId: req.session.user._id,
      });
    })
    .catch((err) => {
      console.log("err:", err);
      res.status(500).redirect("/");
    });
  // res.render("user/profile");
});

module.exports = userRouter;
