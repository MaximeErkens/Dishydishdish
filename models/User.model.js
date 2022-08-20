const { Schema, model, default: mongoose } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  restaurantsList: [
    {
      type: mongoose.Types.ObjectId,
      ref: "restaurant",
    },
  ],
});

const User = model("user", userSchema);

module.exports = User;
