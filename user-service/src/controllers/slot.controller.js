import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import {Queue, tryCatch} from "bullmq"
import dotenv from 'dotenv'

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
    throw new ApiError(400, "No slots provided");
  }

  const creator = slots?.[0]?.creator

  // Check if the creator exists
  const user = await User.findOne({_id:creator})
  if (!user) {
    throw new ApiError(404, "User not found");
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
      new ApiResponse(201, createdSlots, "Slot created Successfully")
    )
  } catch (error) {
    throw new ApiError(500, error, "Error while saving slots in DB")
  }

})

const getSlots = asyncHandler (async (req , res)=>{
  const {date , userName}= req.query

  const user = await User.findOne({userName:userName})
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // i am getting the local date and time , to get slots correctly
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5);
  
  try {
    const slots = await Slot.find({creator: user._id , date , status:'not booked' , startTime:{$gte:formattedTime}})

    return res.status(201).json(
      new ApiResponse(201 , slots , "Slots fethced successfully")
    )
    
  } catch (error) {
    throw new ApiError(501 ,error ,  "Something went wrong while fetching slots")
  }
})

const getSlotData = asyncHandler (async(req , res)=>{
  const {slotId}= req.query
  try {
    const slot = await Slot.findById(slotId)
    return res.status(200).json(
      new ApiResponse(200 , slot , "Slot data fetched successfully")
    )
  } catch (error) {
    throw new ApiError(501 , error , "Something went wrong while fetching slot data")
  }
})

const cancelSlotBooking = asyncHandler (async (req , res)=>{
  const {slotId , customerEmail , customerName} = req.body

  try {
    await Slot.findByIdAndUpdate(slotId , {$set:{status:'cancelled'}}, {new:true})
    await Customer.findOneAndDelete({customerEmail: customerEmail})
    await cancelationEmailQueue.add(`${customerEmail}`, {customerEmail , customerName , slotId})
    return res.status(200).json(
      new ApiResponse ( 200 , "Booking canceled successfully")
    )
  } catch (error) {
    throw new ApiError ( 500 , error , "Something went wrong while canceling the booking. Please try again")
  }
})

const getUpcomingSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId;
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  // Format the local date to "YYYY-MM-DD"
  const formattedDate = indiaTime.toISOString().split('T')[0];
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5);

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
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(400, error, "Something went wrong while fetching upcoming slots")
    );
  }
})

const getPastSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  // Format the local date to "YYYY-MM-DD"
  const formattedDate = indiaTime.toISOString().split('T')[0];
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5);

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
    throw new ApiError (500 , error , "Something went wrong while fetching past slots data")
  }

})

const getCancelledSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  try {
    const slots = await Slot.find({creator:userDbId , status:"cancelled"})
    return res.status(200).json(
      new ApiResponse(200 , slots , "Cancelled slots fetched successfully")
    )
  } catch (error) {
    throw new ApiError (500 , error , "Something went wrong while fetching cancelled slots")
  }
})

const getAvailableSlots = asyncHandler(async (req, res) => {
  const userDbId = req.query.userDbId;
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  // Format the local date to "YYYY-MM-DD"
  const formattedDate = indiaTime.toISOString().split('T')[0];
  
  // Keep the time part in IST format
  const formattedTime = indiaTime.toTimeString().split(' ')[0].substring(0, 5);
  console.log(formattedDate, formattedTime);
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
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(400, error, "Something went wrong while fetching available slots")
    );
  }
});


const deleteSlot = asyncHandler (async (req , res)=>{
  const slotId = req.query.slotId

  try {
    const slot = await Slot.findByIdAndDelete(slotId)
    return res.status(200).json(
      new ApiResponse(200 , "Slot deleted Successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError (500 , error , "Something went wrong while deleting your slot")
    )
  }
})

export {createSlot , getSlots , cancelSlotBooking , getUpcomingSlots , getPastSlots , getCancelledSlots , getSlotData , getAvailableSlots , deleteSlot} 