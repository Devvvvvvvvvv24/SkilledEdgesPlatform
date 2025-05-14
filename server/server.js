import app from './app.js';
import connectionToDB from './config/dbConnection.js';
//up  and running env file ke ander configuration and usse consider karta haiiii    unke basis pe cheeze execute karta hai
import cloudinary from 'cloudinary';
// import RazorPay from 'razorpay';
import dotenv from "dotenv";
dotenv.config();
const PORT=5014


cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECURE,
});

app.listen(PORT , async ()=>{
    await connectionToDB();
     console.log(`App is runnig at https:localhost: ${PORT}`);
});

