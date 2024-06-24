import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req , res)=>{
  const {fullName , email}= req.body

  // checking if user already exist or not
  const existedUser = await User.findOne({email})

  if(existedUser){
    return res.status(201).json(
      new ApiResponse(200 , existedUser , "User Already exists")
    )
  }

  // saving in db
  const user = await User.create({
    fullName,
    email
  })

  // checking if user data got registered in db or not
  const createdUser = await User.findById(user?._id)

  if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered Successfully")
  )
})

const getUserDetails = asyncHandler (async (req , res)=>{
  const {email}= req.query
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Server error"));
  }
})

export {registerUser , getUserDetails}

