const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./db');
app.use(bodyParser.json());


const port = process.env.PORT || 4000

// Connect to the database
connectDB();

const {jwtAuthMiddleware} = require("./jwt");

const userRoute = require('./routes/userRoute.js');
const candidateRoute = require('./routes/candidateRoute.js');
 //middleware use
app.use("/user",userRoute)
app.use("/candidate",candidateRoute)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});
