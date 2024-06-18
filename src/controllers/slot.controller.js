import { asyncHandler } from "../utils/asyncHandler";
import ApiError from '../utils/ApiError.js'
import {Slot} from '../models/slot.model.js'
import ApiResponse from '../utils/ApiResponse.js'


const createSlot = asyncHandler( async(req , res)=>{
  const { startTime , endTime , date , paid , price , creator}= req.body

  // // Check if any required field is empty or not
  if ([startTime , endTime , date , paid , price , creator].some((field)=> field?.trim() ==="")){
    throw new ApiError (400 , "All fields are required")
  }

  // save in db
  const userSlot = await Slot.create({
    startTime,
    endTime,
    date,
    paid,
    price,
    creator
  })

  // Fetch the created slot
  const createdSlot = await Slot.findById(userSlot._id)

  // Check if slot was successfully created
  if(!createdSlot){
    throw new ApiError (500 , "Something went wrong while creating your slots. Please try again")
  }

  return res.status(201).json(
    new ApiResponse( 200 , createdSlot , "Slot created Successfully")
  )
})

export {createSlot} 