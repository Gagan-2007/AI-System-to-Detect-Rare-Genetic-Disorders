import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// // 
// import { User } from "../models/user.model.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import jwt from "jsonwebtoken";
// 

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshTokens:", error);
    throw new ApiError(
      500,
      `Something went wrong while generating access token: ${error.message}`,
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new ApiError(400, "All fields (email, username, password) are required");
  }

  // Check if user with this email already exists (assuming email should stay unique)
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  try {
    const user = await User.create({
      email,
      password,
      username
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: createdUser },
          "User registered successfully",
        ),
      );
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new ApiError(409, `User with this ${field} already exists (Database Constraint)`);
    }
    throw new ApiError(500, `Registration failed: ${error.message}`);
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email) {
    throw new ApiError(400, " email is required");
  }
  // console.log(email, password);
  

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  
  
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken ",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from the document
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export {registerUser,
  login,
  logoutUser
}

//users.insertOne()