import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import nodemailer from 'nodemailer'
import {Queue} from "bullmq"
import dotenv from 'dotenv'

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

const bookSlot = asyncHandler(async(req , res)=>{
  const {email , name , reason ,  slotId , slotCreator}= req.body
  
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
      new ApiResponse(201 , saveCustomerData , "Slot Booked Successfully")
    )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong while booking slots")
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