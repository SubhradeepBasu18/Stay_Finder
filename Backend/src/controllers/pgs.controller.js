import PG from "../models/pgs.models.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

import asyncHandler from "express-async-handler";
import apiError from "../utils/apiError"; 
import PG from "../models/pgModel";
import { uploadOnCloudinary } from "../utils/cloudinary";

const savePgDetails = asyncHandler(async (req, res) => {
    const { name, address, location, occupancy, type, foodPreference, phone = '', landmark = '', price } = req.body;

    // Check for required fields in the request body
    if (!name || !address || !location || !occupancy || !type || !foodPreference || !price) {
        throw new apiError(400, "All fields are required");
    }

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    // Handle image file uploads to Cloudinary
    const imageLocalPaths = [];
    for (const file of req.files) {
        const localFilePath = file.path;
        const uploadedImage = await uploadOnCloudinary(localFilePath);

        if (uploadedImage) {
            imageLocalPaths.push(uploadedImage.url); // Save the URL from Cloudinary
        }
    }

    try {
        // Create a new PG record and save it to the database
        const newPg = new PG({
            name,
            address,
            location,
            occupancy,
            type,
            foodPreference,
            phone,
            landmark,
            price,
            images: imageLocalPaths, // Save the uploaded image URLs
        });

        // Save the PG details to the database
        const savedPg = await newPg.save();

        // Respond with success message and saved PG details
        // res.status(201).json({
        //     message: "PG details saved successfully",
        //     data: savedPg,
        // });
        return apiResponse(res, 201, "PG details saved successfully", savedPg);
    } catch (error) {
        console.error(error);
        throw new apiError(500, "Error saving PG details");
    }
});

const fetchPgDetails = asyncHandler(async(req, res) => {
    try {
        
        const pgDetails = await PG.find();
        return apiResponse(res, 200, "PG details fetched successfully", pgDetails);
        
    } catch (error) {
        console.error(error);
        throw new apiError(500, "Error fetching PG details");
    }
});

const updatePgDetails = asyncHandler(async(req, res) => {});

export { savePgDetails, fetchPgDetails, updatePgDetails }