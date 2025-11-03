import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    active:{
        type: Boolean,
        default: false
    },
    expiresOn:{
        type: Date,
    },
    maxPGsAllowed:{
        type: Number,
        default: 2
    }  
},{timestamps: true})

const Subscription = mongoose.model("Subscription", subscriptionSchema)

export default Subscription
