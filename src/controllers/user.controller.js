import { ApiError } from "../utils/APIError.";
import { ApiResponse } from "../utils/APIResponse";
import asyncHandler from "../utils/asynchandler";
import { User } from "../models/user.model";

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = await user.generateAccessToken();
        const refreshtoken = await user.generateRefreshToken();

        user.refreshToken = refreshtoken;

        await user.save({ validateBeforeSave: false });
        return { accesstoken, refreshtoken }

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
}

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

const logInUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(401, "All fields are required!");
        }

        const user = await User.findOne(email);

        if (!user) {
            throw new ApiError(404, "User does not exist!")
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Password is Incorrect!");
        }

        const { accesstoken, refreshToken } = await generateAccessandRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshtoken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(200)
            .cookie("accesstoken", accesstoken, options)
            .cookie("refreshtoken", refreshtoken, options)
            .json(new ApiResponse(200,
                {
                    user: loggedInUser,
                    accesstoken,
                    refreshToken
                }, "User Logged In Successfully!"))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while login!!")
    }
})
export { registerUser, logInUser };