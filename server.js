'use strict';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import router from './routes/index';
import jwtToken from './auth/auth';

const app = express();
const port = process.env.port || 4040;

// Connecting to the database
const db = mongoose.connect(process.env.DB_ADDRESS || 'mongodb://demo:demo%40123@ds225703.mlab.com:25703/battledb');


// setting body parser middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// API routes with jwt check
app.use('/', jwtToken.authenticate, router);
app.get('*', (req, res) => {
    res.status(404).send('Opps... I think you hit something wrong');
});

// Error Handling
process.on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
});

// Running the server
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})