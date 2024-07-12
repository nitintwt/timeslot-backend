import { google } from "googleapis";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../../../common/utils/asyncHandler.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { ApiError } from "../../../common/utils/ApiError.js";
import client from "../Client.js";

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
  const {userDbId}= req.query

  // Check if user data is in redis
  const cacheUserData= await client.get(userDbId)
  if (cacheUserData){
    return res.status(200).json(new ApiResponse(200, JSON.parse(cacheUserData), "User details fetched successfully"));
  } else {
    try {
      const user = await User.findById(userDbId)
      if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
      }
      // Cache the user data in redis and set an expiration time of 5 minutes
      await client.set(userDbId , JSON.stringify(user))
      await client.expire(userDbId , 300)  
      return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, null, "Server error"));
    }
  }
})

const setUsername = asyncHandler (async (req , res)=>{
  const { username , userDbId}= req.body

  const user = await User.findById(userDbId)
  if(!user){
    throw new ApiError (404 , "User not found")
  }
  const uniqueUserName = await User.findOne({userName:username})

  if (uniqueUserName){
    return res.status(409).json(
      new ApiResponse(409 , "username already exists")
    )
  } else {
    try {
      user.userName = username
      await user.save()
      return res.status(200).json(
        new ApiResponse(200 , "username registered successfully")
      )
    } catch (error) {
      throw new ApiError (500 , error , "Something went wrong while submitting your username. Try again.")
    }
  }
})

const totalNumberOfMeetingsOfLast28Days = asyncHandler (async (req , res)=>{
  const {userDbId}= req.body

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate()-28)

  try {
    const numberOfSlots = await Slot.find({creator: userDbId , booked:true , date: { $gte: startDate, $lt: endDate }} )
    const lengthOfSlots = numberOfSlots.length
    return res.status(200).json(
      new ApiResponse(200 , lengthOfSlots , "Fetched last 28 days slots Successfully ")
    )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong while fetching last 28 days slots data")
  }
})

const totalRevenueofLast28Days = asyncHandler (async (req , res)=>{
  const { userDbId}= req.body

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate()-28)

  try {
    const numberOfPaidBookedSlots = await Slot.find({creator: userDbId , booked:true , date: { $gte: startDate, $lt: endDate } , paid:true })
    const totalRevenue = numberOfPaidBookedSlots.reduce( function (acc , currval){
      return acc + currval.price
    }, 0)
    return res.status(200).json(
      new ApiResponse(200 , totalRevenue , "Fetched last 28 days revenue Successfully ")
    )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong while fetching last 28 days revenue")
  } 
})


export {registerUser , getUserDetails , setUsername , totalNumberOfMeetingsOfLast28Days , totalRevenueofLast28Days}


