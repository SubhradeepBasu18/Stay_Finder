import { configDotenv } from 'dotenv'
configDotenv({quiet: true})

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        
        if(!localFilePath){
            console.log('Local path missing');
            return null;
        }

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {resource_type: "auto"}
        )

        console.log('File Uploaded on Cloudinary. File src: '+ response.url);
        fs.unlinkSync(localFilePath)
        return response      

    } catch (error) {
        console.log('Error while uploading');
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        
        const result = await cloudinary.uploader.destroy(publicId)
        console.log('Deleted from Cloudinary. Public ID: ', publicId);
        
    } catch (error) {
        console.log('Error deleting from Cloudinary: ', error);
        return null;
    }
}

export { uploadOnCloudinary,deleteFromCloudinary  }