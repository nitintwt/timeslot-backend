import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken= refreshToken
    await user.save()

    return {accessToken , refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler (async (req , res)=>{
  const {name , email , password}= req.body

  const existedUser = await User.findOne({email})
  if(existedUser){
    return res.status(409).json(
      new ApiResponse(409 , "User with email exists")
    )
  }

  const user = await User.create({
    fullName : name,
    email:email,
    password:password
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser){
    return res.status(500).json(
      new ApiResponse (500 , "Something went wrong while registering the user")
    )
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered Successfully")
  )
})

const loginUser = asyncHandler ( async (req , res)=>{
  const { email , password} = req.body

  const user = await User.findOne({email})

  if (!user){
    return res.status(404).json(
      new ApiResponse(404 , "User doesn't exists")
    )
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid){
    return res.status(401).json(
      new ApiResponse(401 , "Password incorrect")
    )
  }
  
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")

  //initially cookies can be modified by any one in frontend , to make it only modified only by server , we have to do  httpOnly true and secure true 
  const options = {
    httpOnly : true,
    secure: true,
  }

  return res.
  status(200)
  .cookie("acessToken", accessToken , options)
  .cookie("refreshToken" , refreshToken , options)
  .json( new ApiResponse(
    200 ,
    {
      user: loggedInUser , accessToken , refreshToken
    },
    "User logged in successfully"
  ))
})

const logoutUser= asyncHandler (async (req , res)=>{
  const userId = req.body.userDbId
  await User.findByIdAndUpdate(userId , {$set:{refreshToken:undefined}}, {new:true})

  const options ={
    httpOnly:false,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("RefreshToken", options)
  .clearCookie("userData")
  .json(
    new ApiResponse(200 , "User logged out successfully")
  )

})

const refreshAccessToken = asyncHandler( async (req , res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken){
    throw new ApiError(401 , "unAuthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user){
      throw new ApiError(401 , "Invalid refresh Token")
    }
  
    if (incomingRefreshToken!== user?.refreshToken){
      throw new ApiError(401 , "Refresh token is expired or used")
    }
  
    const options ={
      httpOnly:true,
      secure: true,
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200).cookie("accessToken",accessToken , options).cookie("refreshToken" , newRefreshToken, options).json(new ApiResponse(200 , {accessToken , refreshToken: newRefreshToken}, "access token refreshed successfully"))
    
  } catch (error) {
      throw new ApiError(401 , "Invalid refresh token")
  }

})

export {registerUser , loginUser , logoutUser , refreshAccessToken}