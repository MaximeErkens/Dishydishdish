const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");
const RestaurantModel = require("../models/Restaurant.model");
const UserModel = require("../models/User.model");

const restaurantRouter = Router();

restaurantRouter.get("/all", (req, res) => {
  RestaurantModel.find({}).then((restaurants) => {
    res.render("restaurant/all-restaurants", { restaurants });
  });
});

restaurantRouter.get("/add", isLoggedIn, (req, res) => {
  res.render("restaurant/add-restaurant");
});

restaurantRouter.post("/add", isLoggedIn, (req, res) => {
  const { restaurantName, description, city, website } = req.body;

  RestaurantModel.create({
    restaurantName,
    description,
    city,
    website,
  }).then((createdRestaurant) => {
    UserModel.findByIdAndUpdate(
      req.session.user,
      {
        $push: { restaurantsList: createdRestaurant._id },
      },
      {
        new: true,
      }
    )
      .then((updatedUser) => {
        console.log("updatedUser:", updatedUser);
        res.render("restaurant/add-restaurant", { createdRestaurant });
      })
      .catch((err) => {
        console.log("Oeps", err);
        res.redirect("/");
      });
  });
});

module.exports = restaurantRouter;
