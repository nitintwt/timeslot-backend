import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import { Customer } from "../models/customer.model.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {z} from "zod"
import mongoose from "mongoose";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(10, "Username must be at most 10 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  userDbId: z.string().refine((id) => mongoose.isValidObjectId(id), {
    message: "Invalid user ID",
  }),
})

const getUserDetails = asyncHandler (async (req , res)=>{
  const {userDbId}= req.query

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
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
      console.error("User details error" , error)
      return res.status(500).json(
        {message:"Something went wrong while fetching user details"}
      )
    }
  
})

const setUsername = asyncHandler(async (req, res) => {
  const parseResult = usernameSchema.safeParse(req.body)

  if (!parseResult.success) {
    return res.status(400).json(
      {message: parseResult.error.issues[0].message }
    )
  }

  const { username, userDbId } = parseResult.data

  try {
    const user = await User.findById(userDbId)
    if (!user) {
      return res.status(404).json({message:"User not found"})
    }

    const existingUsername = await User.findOne({ userName: username })
    if (existingUsername) {
      return res.status(409).json(new ApiResponse(409, "Username already exists"));
    }

    user.userName = username
    await user.save()

    return res.status(200).json(new ApiResponse(200, "Username registered successfully"));
  } catch (error) {
    console.error("Username creation error" , error)
    return res.status(500).json(
      {message : " Something went wrong while submitting your username. Try again."}
    )
  }
})

// todo:- use redis to cache data
const totalNumberOfMeetingsOfLast28Days = asyncHandler (async (req , res)=>{
  const {userDbId}= req.query

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
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
    console.error("Last 28 days data error" , error)
    return res.status(500).json(
      {message:"Something went wrong while fetching last 28 days meetings data"}
    )
  }
})

// todo :- use redis to cache data
const totalRevenueofLast28Days = asyncHandler (async (req , res)=>{
  const { userDbId}= req.query

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
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
    console.error("Last 28 days data error" , error)
    return res.status(500).json(
      {message:"Something went wrong while fetching last 28 days revenue"}
    )
  } 
})

const getCustomerData = asyncHandler(async (req , res)=>{
  const slotId= req.query.slotId

  if(!mongoose.isValidObjectId(slotId)){
    throw new ApiError(401, "Invalid user id")
  }

  try {
    const customer = await Customer.findOne({slot:slotId})
    return res.status(200).json(
      new ApiResponse(200, customer , "Customer data fetched successfully")
    )
  } catch (error) {
    console.error("Customer data error" , error)
    return res.status(500).json(
      {message:"Something went wrong while fetching customer data"}
    )
  }
})

const getAllCustomersData = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  const user = await User.findById(userDbId)

  try {
    const customers = await Customer.find({slotCreator:user.userName})

    return res.status(200).json(
      new ApiResponse(200 , customers , "All customers fetched successfully")
    )
  } catch (error) {
    console.error("Customer data error" , error)
    return res.status(500).json(
      {message:"Something went wrong while fetching customers data"}
    )
  }
})

export { getUserDetails , setUsername , totalNumberOfMeetingsOfLast28Days , totalRevenueofLast28Days , getCustomerData , getAllCustomersData}