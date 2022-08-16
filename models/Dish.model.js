const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const dishSchema = new Schema({
  dishName: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
});

const Dish = model("Dish", dishSchema);

module.exports = Dish;
