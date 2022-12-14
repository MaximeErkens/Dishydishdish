const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const restaurantSchema = new Schema({
  restaurantName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
});

const Restaurant = model("Restaurant", restaurantSchema);

module.exports = Restaurant;
