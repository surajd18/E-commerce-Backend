import { ApiError } from "../utils/APIError.";
import { ApiResponse } from "../utils/APIResponse";
import asyncHandler from "../utils/asynchandler";
import { User } from "../models/user.model";


const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, lastName, email, mobile, password } = req.body;

        if ([fullName, lastName, email, mobile, password].some((field) => {
            field?.trim() == ""
        })
        ) {
            throw new ApiError(400, "All fields are required!!");
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { mobile },]
        });

        if (existingUser) {
            throw new ApiError(409, "User is already exists!")
        }

        const user = await User.create({
            fullName: fullName,
            lastName: lastName,
            email: email,
            mobile: mobile,
            password: password
        });

        if (!user) {
            throw new ApiError(500, "User is not created!")
        }
        return res.status(201).json(new ApiResponse(201, { user }, "User created successfully!!"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error")
    }
})

export { registerUser };