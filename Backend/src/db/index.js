import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
import { configDotenv } from "dotenv";
configDotenv({quiet: true})

const connectDB = async() => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('MongoDB connection error', error);
        process.exit(1);
    }
}

export default connectDB