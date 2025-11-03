import app from "./app.js";
import connectDB from "./db/index.js";
import { configDotenv } from "dotenv";
configDotenv({quiet: true})

const PORT  = process.env.PORT || 3000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})
.catch((error) => {
    console.log('MongoDB connection error', error)
    process.exit(1)
})