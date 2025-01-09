import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import {Queue, tryCatch} from "bullmq"
import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config({
  path:'./.env'
})

const cancelationEmailQueue = new Queue("cancelation-email-queue" , {
  connection: {
    host:process.env.AIVEN_HOST,
    port:process.env.AIVEN_PORT,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD ,
  },
})

const createSlot = asyncHandler( async(req , res)=>{
  const {slots} = req.body

  if (slots.length === 0) {
    return res.status(404).json(
      {message:"No slots provided"}
    )
  }

  const creator = slots?.[0]?.creator

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  const user = await User.findById(creator)
    if(!user){
      return res.status(404).json(
        {message:"User not found"}
      )
    }

  // slot.save() will be an array of promises , Promise.all() takes all this arrays and allow all these promises to execute concurrently( all at the same time) and retruns a single promise
  // so here a slot.save() starts its execution without waiting for the previous one to be completed
  try {
    const createdSlots = await Promise.all(slots.map(async (slotData) => {
      const slot = new Slot(slotData)
      await slot.save()
      user.slots.push(slot._id)
      return slot;
    }));

    await user.save()

    return res.status(201).json(
      new ApiResponse(201,"Slot created Successfully")
    )
  } catch (error) {
    console.error('Error while creating slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while creating your slots. Try again"}
    )
  }

})

const getSlots = asyncHandler (async (req , res)=>{
  const {date , userName}= req.query

  if (!userName) {
    return res.status(400).json(
      {message: "Username is required"}
    )
  }

  const user = await User.findOne({userName:userName})
  if (!user) {
    return res.status(404).json(
      {message:"User not found"}
    )
  }
  
  const now = new Date()

  // converts the date from UTC to IST timezone
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
 
  /*
  .toTimeString() converts Date object to time string (eg: 19:30:00 GMT+0530 )
  .split(" ")[0] converts the string into array and select the index 0 element  (eg:- 19:30:00)
  .substring(0, 5) takes only the first 5 characters  (eg:- 19:30)
  */
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5)
  
  try {
    const slots = await Slot.find({
      creator: user._id,
      date,
      status: 'not booked',
      startTime: { $gte: formattedTime },
    })    

    return res.status(200).json(
      new ApiResponse(200 , slots , "Slots fethced successfully")
    )
  } catch (error) {
    console.error('Error while fetching slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching slots"}
    )
  }
})

const getSlotData = asyncHandler (async(req , res)=>{
  const {slotId}= req.query
  
   if (!mongoose.isValidObjectId(slotId)){
    return res.status(400).json(
      {message:"Invalid slot ID"}
    )
   }

  try {
    const slot = await Slot.findById(slotId)

    if (!slot) {
      return res.status(404).json(
        {message:"Slot not found"}
      )
    }

    return res.status(200).json(
      new ApiResponse(200 , slot , "Slot data fetched successfully")
    )
  } catch (error) {
    console.error('Error while fetching slot data:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching slot data"}
    )
  }
})

const cancelSlotBooking = asyncHandler (async (req , res)=>{
  const {slotId , customerEmail , customerName} = req.body

    if (!mongoose.isValidObjectId(slotId)){
      return res.status(400).json(
        {message:"Invalid slot ID"}
      )
    }

  try {
    const slot = await Slot.findByIdAndUpdate(slotId, { $set: { status: 'cancelled' } }, { new: true })
    if (!slot) {
      return res.status(404).json(
        {message:"Slot not found"}
      )
    }

    await Customer.findOneAndDelete({customerEmail: customerEmail})
    
    // send email
    await cancelationEmailQueue.add(`${customerEmail}`, {customerEmail , customerName , slotId})

    return res.status(200).json(
      new ApiResponse ( 200 , "Booking cancelled successfully")
    )
  } catch (error) {
    console.error('Error while cancelling booking:', error)
    return res.status(500).json(
      {message:"Something went wrong while cancelling the booking. Please try again"}
    )
  }
})

const getUpcomingSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  const now = new Date()
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  
  // Format the local date to "YYYY-MM-DD"
  /*
  .toISOString() converts "Thu Jan 09 2025 17:30:00 GMT+0530" to "2025-01-09T12:00:00.000Z"
  .spli('T)[0] divide the string whenever encounter "T" and convert into array and select the index 0 element
  */
  const formattedDate = indiaTime.toISOString().split('T')[0]
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5)

  try {
    const slots = await Slot.find({
      creator: userDbId,
      status: "booked",
      $or: [
        {
          date: formattedDate,
          startTime: { $gte: formattedTime },
        },
        {
          date: { $gt: formattedDate },
        },
      ],
    })

    return res.status(200).json(
      new ApiResponse(200, slots, "Upcoming booked slots fetched successfully")
    )
  } catch (error) {
    console.error('Error while fetching upcoming slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching upcoming slots"}
    )
  }
})

const getPastSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  
  // Format the local date to "YYYY-MM-DD"
  const formattedDate = indiaTime.toISOString().split('T')[0]
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5)

  try {
    const slots = await Slot.find({
      creator: userDbId,
      status: "booked",
      $or: [
        {
          date: formattedDate,
          startTime: { $lte: formattedTime },
        },
        {
          date: { $lt: formattedDate },
        },
      ],
    })
    return res.status(200).json(
      new ApiResponse(200 , slots , "Past slots fetched successfully")
    )
  } catch (error) {
    console.error('Error while fetching past slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching past slots data"}
    )
  }

})

const getCancelledSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  try {
    const slots = await Slot.find({creator:userDbId , status:"cancelled"})
    return res.status(200).json(
      new ApiResponse(200 , slots , "Cancelled slots fetched successfully")
    )
  } catch (error) {
    console.error('Error while fetching cancelled slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching cancelled slots"}
    )
  }
})

const getAvailableSlots = asyncHandler(async (req, res) => {
  const userDbId = req.query.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

  const now = new Date()
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  
  // Format the local date to "YYYY-MM-DD"
  const formattedDate = indiaTime.toISOString().split('T')[0]
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5)

  try {
    const slots = await Slot.find({
      creator: userDbId,
      status: "not booked",
      $or: [
        {
          date: formattedDate,
          startTime: { $gte: formattedTime },
        },
        {
          date: { $gt: formattedDate },
        },
      ],
    })

    return res.status(200).json(
      new ApiResponse(200, slots, "Available slots fetched successfully")
    )
  } catch (error) {
    console.error('Error while fetching available slots:', error)
    return res.status(500).json(
      {message:"Something went wrong while fetching available slots"}
    )
  }
})

const deleteSlot = asyncHandler (async (req , res)=>{
  const slotId = req.query.slotId

   if (!mongoose.isValidObjectId(slotId)){
    return res.status(400).json(
      {message:"Invalid slot ID"}
    )
   }

  try {
    const slot = await Slot.findByIdAndDelete(slotId)
    if (!slot) {
      return res.status(404).json({message:"Slot not found"})
    }
    return res.status(200).json(
      new ApiResponse(200 , "Slot deleted Successfully")
    )
  } catch (error) {
    console.error('Error while deleting slot:', error)
    return res.status(500).json(
      {message:"Something went wrong while deleting your slot"}
    )
  }
})

export {createSlot , getSlots , cancelSlotBooking , getUpcomingSlots , getPastSlots , getCancelledSlots , getSlotData , getAvailableSlots , deleteSlot} 