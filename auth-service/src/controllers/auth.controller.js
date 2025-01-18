import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import {z} from "zod"

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5 , "Name must be at least 5 characters long")
    .max(30 , "Name must be at most 30 characters long")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .trim()
    .email("Invalid email format"),
  password: z
    .string()
    .trim()
    .min(8 , "Password must be at least 8 characters long")
    .max(20 , "Password must be at most 20 characters long")
})

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format"),
  password: z
    .string()
    .trim()
    .min(8 , "Password must be at least 8 characters long")
    .max(20 , "Password must be at most 20 characters long")
})

const generateAccessAndRefreshTokens = async (userId)=>{
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken= refreshToken
    await user.save()

    return {accessToken , refreshToken}
}

const registerUser = asyncHandler (async (req , res)=>{
  try {
    const parseResult = registerSchema.safeParse(req.body)

    if (!parseResult.success) {
      return res.status(409).json(
        {message: parseResult.error.issues[0].message }
      )
    }
  
    const {name , email , password}= parseResult.data
  
    const existedUser = await User.findOne({email})
    if(existedUser){
      return res.status(409).json(
        {message: "User with this email already exists"}
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
        {message: "Something went wrong while registering user"}
      )
    }
  

    return res.status(201).json(
      new ApiResponse(200, createdUser , "User registered Successfully")
    )
  } catch (error) {
    console.error("Register error" , error)
    return res.status(500).json(
      {message: error.message}
    )
  }
})

const loginUser = asyncHandler ( async (req , res)=>{
  try {
    const parseResult = loginSchema.safeParse(req.body)

    if (!parseResult.success) {
      return res.status(409).json(
        {message: parseResult.error.issues[0].message }
      )
    }
  
    const {email , password}= parseResult.data
  
    const user = await User.findOne({email})
  
    if (!user){
      return res.status(404).json(
        {message: "User doesn't exist" }
      )
    }
  
    const isPasswordValid = await user.isPasswordCorrect(password)
  
    if (!isPasswordValid){
      return res.status(401).json(
        {message: "Password is incorrect" }
      )
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")
  
    //initially cookies can be modified by any one in frontend , to make it only modified only by server , we have to do  httpOnly true and secure true 
    const options = {
      httpOnly : true,
      secure: false,
      sameSite:"none",
      domain: "*.timeslot.co.in",
      path: "/"
    }

    return res.
    status(200)
    .cookie("accessToken", accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json( new ApiResponse(
      200 ,
      {
        user: loggedInUser
      },
      "User logged in successfully"
    ))
  } catch (error) {
    console.error("Login error" , error)
    return res.status(500).json(
      {message: error.message}
    )
  }
})

const logoutUser= asyncHandler (async (req , res)=>{
  const userId = req.body.userDbId
  try {
    await User.findByIdAndUpdate(userId , {$set:{refreshToken:undefined}}, {new:true})

    const options ={
      httpOnly:true,
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
  } catch (error) {
    console.error("Logout error" , error)
    return res.status(500).json(
      {message:error.message}
    )
  }
})

const refreshAccessToken = asyncHandler( async (req , res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken){
    return res.status(401).json(
      {message: "Unauthorized request"}
    )
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user){
      return res.status(401).json(
        {message: "Invalid refresh token"}
      )
    }
  
    if (incomingRefreshToken!== user?.refreshToken){
      return res.status(401).json(
        {message: "Refresh token is expired or used"}
      )
    }
  
    const options ={
      httpOnly:true,
      secure: true,
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200).cookie("accessToken",accessToken , options).cookie("refreshToken" , newRefreshToken, options).json(new ApiResponse(200 , {accessToken , refreshToken: newRefreshToken}, "access token refreshed successfully"))
    
  } catch (error) {
    return res.status(500).json(
      {message: error.message}
    )
  }

})

export {registerUser , loginUser , logoutUser , refreshAccessToken}