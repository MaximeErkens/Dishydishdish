// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");

// ℹ️ Sets the MongoDB URI for our app to have access to it.
// If no env has been set, we dynamically set it to whatever the folder name was upon the creation of the app

//const MONGO_URL = require("../utils/consts");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/Dishydishdish";

mongoose
  .connect(MONGO_URL)
  .then((connection) => {
    console.log(
      `Connected to Mongo! Database name: "${connection.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });
