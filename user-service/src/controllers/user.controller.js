import { google } from "googleapis";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import { Customer } from "../models/customer.model.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {z} from "zod"
import mongoose from "mongoose";
import { parse } from "dotenv";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  userDbId: z.string().refine((id) => mongoose.isValidObjectId(id), {
    message: "Invalid user ID",
  }),
})

const getUserDetails = asyncHandler (async (req , res)=>{
  const {userDbId}= req.query

  if(!mongoose.isValidObjectId(userDbId)){
    throw new ApiError(401, "Invalid user id")
  }

  //Check if user data is in redis
  /*const cacheUserData= await client.get(userDbId)
  if (cacheUserData){
    return res.status(200).json(new ApiResponse(200, JSON.parse(cacheUserData), "User details fetched successfully"));
  } else {*/
    try {
      const user = await User.findById(userDbId).select(
        "-password -refreshToken"
      )
      if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
      }
      // Cache the user data in redis and set an expiration time of 5 minutes
      /*await client.set(userDbId , JSON.stringify(user))
      await client.expire(userDbId , 300) */
       
      return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
    } catch (error) {
      throw new ApiError(500 , "Something went wrong")
    }
  
})

const setUsername = asyncHandler(async (req, res) => {
  const parseResult = usernameSchema.safeParse(req.body)

  if (!parseResult.success) {
    throw new ApiError(400 , parseResult.error.issues[0].message)
  }

  const { username, userDbId } = parseResult.data

  try {
    const user = await User.findById(userDbId)
    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User not found"))
    }

    const existingUsername = await User.findOne({ userName: username })
    if (existingUsername) {
      return res.status(409).json(new ApiResponse(409, "Username already exists"));
    }

    user.userName = username
    await user.save()

    return res.status(200).json(new ApiResponse(200, "Username registered successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while submitting your username. Try again.")
  }
})

const totalNumberOfMeetingsOfLast28Days = asyncHandler (async (req , res)=>{
  const {userDbId}= req.query

  if(!mongoose.isValidObjectId(userDbId)){
    throw new ApiError(401, "Invalid user id")
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate()-28)

  const formattedStartDate = startDate.toISOString()
  const formattedEndDate = endDate.toISOString()

  try {
    const numberOfSlots = await Slot.find({creator: userDbId , status:'booked' , date: { $gte: formattedStartDate, $lt: formattedEndDate }} )
    const lengthOfSlots = numberOfSlots.length
    return res.status(200).json(
      new ApiResponse(200 , lengthOfSlots, "Fetched number of meeting of last 28 days Successfully ")
    )
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while fetching last 28 days meetings data")
  }
})

const totalRevenueofLast28Days = asyncHandler (async (req , res)=>{
  const { userDbId}= req.query
  if(!mongoose.isValidObjectId(userDbId)){
    throw new ApiError(401, "Invalid user id")
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate()-28)

  const formattedStartDate = startDate.toISOString()
  const formattedEndDate = endDate.toISOString()

  try {
    const numberOfPaidBookedSlots = await Slot.find({creator: userDbId , status:'booked' , date: { $gte: formattedStartDate, $lt: formattedEndDate } , paid:true })
    const totalRevenue = numberOfPaidBookedSlots.reduce( function (acc , currval){
      return acc + currval.price
    }, 0)
    return res.status(200).json(
      new ApiResponse(200 , totalRevenue ,"Fetched last 28 days revenue Successfully ")
    )
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while fetching last 28 days revenue")
  } 
})

const getCustomerData = asyncHandler(async (req , res)=>{
  const slotId= req.query.slotId

  if(!mongoose.isValidObjectId(slotId)){
    throw new ApiError(401, "Invalid user id")
  }

  try {
    const customer = await Customer.findOne({slot:slotId}).populate('slot')
    return res.status(200).json(
      new ApiResponse(200, customer , "Customer data fetched successfully")
    )
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while fetching customer data")
  }
})

const getAllCustomersData = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  if(!mongoose.isValidObjectId(userDbId)){
    throw new ApiError(401, "Invalid user id")
  }

  const user = await User.findById(userDbId)

  try {
    const customers = await Customer.find({slotCreator:user.userName})

    return res.status(200).json(
      new ApiResponse(200 , customers , "All customers fetched successfully")
    )
  } catch (error) {
    throw new ApiError(500 ,"Something went wrong while fetching customers data")
  }
})

export { getUserDetails , setUsername , totalNumberOfMeetingsOfLast28Days , totalRevenueofLast28Days , getCustomerData , getAllCustomersData}