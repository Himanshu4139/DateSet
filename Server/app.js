const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectDB = require('./db/db');
connectDB();
const cors = require('cors');

const { urlencoded } = require('body-parser');

const userRoutes = require('./routes/user.routes');

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/users', userRoutes);


module.exports = app;