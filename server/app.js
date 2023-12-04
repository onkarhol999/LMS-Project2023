// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoute from './routes/user.routes.js';
import errorMiddleware from './middlerwares/error.middleware.js';
import courseRoutes from './routes/course.route.js';
import paymentRoutes from './routes/payment.route.js'
// Use CommonJS syntax for importing course.controller.js
//const courseController = require('./controllers/course.controller.js');
const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Replace with the actual origin of your React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
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

