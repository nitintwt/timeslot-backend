import { asyncHandler } from "../../../common/utils/asyncHandler.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { ApiError } from "../../../common/utils/ApiError.js";
import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";


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
  
  try {
    const slots = await Slot.find({creator: user._id , date , status:'not booked'})

    return res.status(201).json(
      new ApiResponse(201 , slots , "Slots fethced successfully")
    )
    
  } catch (error) {
    throw new ApiError(501 ,error ,  "Something went wrong while fetching slots")
  }
})

const cancelSlotBooking = asyncHandler (async (req , res)=>{
  const {slotId , customerEmail} = req.body

  try {
    await Slot.findByIdAndUpdate(slotId , {$set:{status:'cancelled'}}, {new:true})
    await Customer.findOneAndDelete({customerEmail: customerEmail}, 
      {
        
      }
    )

    /* Todo : Send email to client about slot cancelation. Make a util for sending mails */
    return res.status(200).json(
      new ApiResponse ( 200 , "Booking canceled successfully")
    )
  } catch (error) {
    throw new ApiError ( 500 , error , "Something went wrong while canceling the booking. Please try again")
  }
})

const getUpcomingSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  const startDate = new Date()
  const formattedStartDate = startDate.toISOString()

  console.log(formattedStartDate)

  try {
    const slots = await Slot.find({creator: userDbId , status:'booked' , date:{ $gte:formattedStartDate} })
    return res.status(200).json(
      new ApiResponse(200 , slots , "Upcoming slots fetched successfully")
    )
  } catch (error) {
    throw new ApiError (500 , error , "Something went wrong while fetching upcoming slots data")
  }
})

const getPastSlots = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  const startDate = new Date()
  const formattedStartDate = startDate.toISOString()

  try {
    const slots = await Slot.find({creator: userDbId , status:'completed' , date:{ $lt:formattedStartDate} })
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



export {createSlot , getSlots , cancelSlotBooking , getUpcomingSlots , getPastSlots , getCancelledSlots} 