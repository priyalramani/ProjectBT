const express = require("express");
const connectDB = require("./config/mongoDb");
const Routes = require("./Routes/Routes");


app = express();
app.use(express.json());
connectDB()

app.use("/routes", Routes);


module.exports = app;