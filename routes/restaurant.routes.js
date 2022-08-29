const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const RestaurantModel = require("../models/Restaurant.model");
const UserModel = require("../models/User.model");

const restaurantRouter = Router();

restaurantRouter.get("/all", isLoggedIn, (req, res) => {
  return UserModel.findById(req.session.user._id)
    .populate("restaurantsList")
    .then((user) => {
      const { restaurantsList } = user;

      res.render("restaurant/all-restaurants", {
        restaurants: restaurantsList,
        isOwner: true,
      });
    });
  // RestaurantModel.find({}).then((restaurants) => {
  //   res.render("restaurant/all-restaurants", { restaurants });
  // });
});

restaurantRouter.get("/public", async (req, res) => {
  if (req.query.username) {
    const user = await UserModel.findOne({
      username: req.query.username,
    }).populate("restaurantsList");

    if (!user) {
      return res.redirect("/restaurant/public");
    }

    console.log(user);

    return res.render("restaurant/all-restaurants", {
      restaurants: user.restaurantsList,
      username: req.query.username,
      profilePic: user.profilePic,
      hasOwner: true,
    });
  }

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

restaurantRouter.get("/:_id/update", isLoggedIn, (req, res) => {
  RestaurantModel.findById(req.params._id).then((restaurant) => {
    res.render("restaurant/update-restaurant", { restaurant });
  });
});

restaurantRouter.post("/:_id/update", isLoggedIn, (req, res) => {
  const {
    restaurantName = "",
    description = "",
    city = "",
    website = "",
  } = req.body;

  RestaurantModel.findByIdAndUpdate(req.params._id, {
    restaurantName,
    description,
    city,
    website,
  })
    .then(() => {
      return res.redirect("/restaurant/all");
    })
    .catch((err) => {
      console.log("Oops, something went wrong with updating the restaurant");
      res.render("restaurant/update-restaurant");
    });
});

restaurantRouter.post("/:_id/delete", isLoggedIn, (req, res) => {
  RestaurantModel.findByIdAndDelete(req.params._id)
    .then(() => {
      res.redirect("/restaurant/all");
    })
    .catch((err) => {
      console.log(
        `Oopsie there went something wrong with deleting the restaurant ${err}`
      );
      res.render("restaurant/all-restaurants");
    });
});

module.exports = restaurantRouter;
