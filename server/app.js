// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoute from './routes/user.routes.js';
import errorMiddleware from './middlerwares/error.middleware.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js'
// Use CommonJS syntax for importing course.controller.js
// const courseController = require('./controllers/course.controller.js');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true'); // Set the header to 'true'
    next();
  });
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use('/ping', function (req, res) {
    res.send('/pong');
});

// routes of 3 modules
app.use('/api/v1/user', userRoute);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 not found');
});

app.use(errorMiddleware);

export default app;

