const express = require("express");
const connectDB = require("./config/mongoDb");


app = express();
app.use(express.json());
connectDB()




module.exports = app;