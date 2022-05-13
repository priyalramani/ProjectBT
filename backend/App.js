const express = require("express");
const connectDB = require("./config/mongoDb");
const Routes = require("./Routes/Routes");
const ItemCategories = require("./Routes/ItemCategories");
const Companies = require("./Routes/Companies");


app = express();
app.use(express.json());
connectDB()

app.use("/routes", Routes);
app.use("/itemCategories", ItemCategories);
app.use("/companies", Companies);


module.exports = app;