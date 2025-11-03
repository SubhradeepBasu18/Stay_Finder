import express from "express";
import cors from "cors";
import {configDotenv} from "dotenv";
import cookieParser from "cookie-parser";
configDotenv({quiet: true})

import userRoutes from "./routes/users.route.js"
import pgRoutes from "./routes/pgs.route.js"

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}))
app.use(express.json());
// app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser());


app.use('/api/users', userRoutes)
app.use('/api/pg', pgRoutes)

export default app;