import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import nodemailer from 'nodemailer'
import {Queue, tryCatch} from "bullmq"
import dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config({
  path:'./.env'
})

const emailQueue = new Queue("booking-email-queue" , {
  connection: {
    host:process.env.AIVEN_HOST,
    port:process.env.AIVEN_PORT,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD ,
  },
})

const emailSchema = z.string().email()
const reasonSchema = z.string().min(51)

const bookSlot = asyncHandler(async(req , res)=>{
  const {email , name , reason ,  slotId , slotCreator}= req.body
  
  try {
    emailSchema.parse(email)
  } catch (error) {
    return res.status(400).json(
      new ApiError(400 , null , "Invalid email address")
    )
  }

  try {
    reasonSchema.parse(reason)
  } catch (error) {
    return res.status(400).json(
      new ApiError(400 , null , "Reason must be more than 50 characters long")
    )
  }

  if ([email , name , reason , slotId , slotCreator].some((field)=> field.trim()==="")){
    throw new ApiError(400  , "All fields are required")
  }
  
  const slot = await Slot.findById(slotId)

  if (!slot) {
    throw new ApiError(404, 'Slot not found');
  }

  try {
    slot.status = 'booked';
    await slot.save();
    const saveCustomerData = await Customer.create({
      customerEmail: email,
      customerName: name,
      slot: slotId,
      reasonForMeet: reason,
      slotCreator: slotCreator
    })

    return res.status(201).json(
      new ApiResponse(201 , "Slot Booked Successfully")
    )
  } catch (error) {
    return res.status(400).json(
      new ApiError(400 , null , error , "Something went wrong while booking your slot")
    )
  }
})

const sendEmail = asyncHandler (async (req, res)=>{
  const {clientEmail , clientName , slotId , meetLink}= req.body
  
  await emailQueue.add(`${clientEmail}`, {clientEmail , clientName , slotId , meetLink})
  
  return res.status(200).json(
    new ApiResponse(200 , "Email sent successfully")
  )

})



export  {bookSlot , sendEmail}