
//we are using es6 here
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import {config} from 'dotenv';
import errorMiddleware from './middlewares/error.middleware.js';
import courseRoutes from './routes/course.route.js'
import paymentRoutes from './routes/payment.routes.js'
config();

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:[process.env.FRONTEND_URL], //diiferent port run
    credential:true
}));

app.use(morgan('dev')); 

app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong');
})
app.use('/api/v1/user',userRoutes);//users se relaated route prefix
app.use('/api/v1/courses',courseRoutes);
app.use('/api/v1/payments',paymentRoutes);

app.all('*',(req,res)=>{  //GENERIC ROUTE LKO ACCESS KARE USE HANDLE KAR SAKE
//handle allunnecessary routes
    res.status(400).send('OPPS: PAGE NOT FOUND');
});

app.use(errorMiddleware);
export default app; 
