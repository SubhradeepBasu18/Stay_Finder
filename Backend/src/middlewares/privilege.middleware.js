import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const verifyOwner = asyncHandler(async(req, res, next) => {

    const role = req?.user.role
    if(role !== "Owner"){
        return res
            .status(403)
            .json(
                new apiResponse(
                    403,
                    {},
                    "Access denied: Only owners can register PGs"
                )
            )
    }
    
    next()
})

export { verifyOwner }