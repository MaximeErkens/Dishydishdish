const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");
const RestaurantModel = require("../models/Restaurant.model");
const UserModel = require("../models/User.model");

const restaurantRouter = Router();

// restaurantRouter.get("/", (req, res) => {
//   RestaurantModel.find({}).then((restaurants) => {
//     res.render("restaurant/all", { restaurants });
//   });
// });

restaurantRouter.get("/add", isLoggedIn, (req, res) => {
  res.render("restaurant/add-restaurant");
});

module.exports = restaurantRouter;
