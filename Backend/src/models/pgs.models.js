import mongoose from "mongoose";

const pgSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    address:{
        type: String,
        require: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    occupancy: {
        type: String,
        enum: ['Single', 'Double', 'Triple', 'Multisharing']
    },
    type: {
        type: String,
        enum: ['Male', 'Female', 'Co-ed']
    },
    foodPreference: {
        type: String,
        enum: ['Veg', 'Non-veg', 'Both']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    phone: {
        type: String,
    },
    landmark: {
        type: String,
    },
    price: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        // required: true
    }],
    bookingId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
    }]
    
},{timestamps: true})

pgSchema.index({location: '2dsphere'})

const PG = mongoose.model("PG", pgSchema)

export default PG