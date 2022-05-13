const express = require("express");
const connectDB = require("./config/mongoDb");
const morgan = require("morgan");
const Routes = require("./Routes/Routes");
const ItemCategories = require("./Routes/ItemCategories");
const Companies = require("./Routes/Companies");
const CounterGroup = require("./Routes/CounterGroup");

app = express();
app.use(express.json());
connectDB()
app.use(morgan("dev"));

app.use("/routes", Routes);
app.use("/itemCategories", ItemCategories);
app.use("/companies", Companies);
app.use("/counterGroup", CounterGroup);


module.exports = app;