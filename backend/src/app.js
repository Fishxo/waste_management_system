
//app.js for handling middleware and routes 
const express = require("express");
//importing the route folder for routing
const routes = require("./routes");

const cors = require('cors');

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//checking the route
app.get("/", (req,res) =>{
    res.json({message: "waste management api is running"});
});

//api routes
app.use("/api", routes)
module.exports = app;