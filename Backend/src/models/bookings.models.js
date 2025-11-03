import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pg:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PG'
    },
    roommatePreference:{
        type: String,
        enum: ['Male', 'Female', 'Others', 'No preference']
    }, 
    status:{
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    }   
},{timestamps: true})

const Booking = mongoose.model("Booking", bookingSchema)

export default Booking
