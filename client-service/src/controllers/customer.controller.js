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
import mongoose from "mongoose";

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

const bookingSchema = z.object({
  email: z.string().email(),
  name: z
    .string()
    .min(3, "Name should be atleast 3 characters long")
    .max(30 , "Name must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain letters"),
  reason: z
    .string()
    .min(10 , "Reason should be atleast 10 characters long")
    .max(100, "Reason must be at most 100 characters long")
    .regex(/^[a-zA-Z0-9_\- ]+$/, "Reason can only contain letters, numbers, underscores, hyphens, and spaces"),
  slotId: z.string().refine((id)=> mongoose.isValidObjectId(id), {message: "Invalid slot ID"}),
  slotCreator: z.string()
})

const emailSchema = z.object({
  clientEmail: z.string().email(),
  clientName: z
    .string()
    .min(3, "Name should be atleast 3 characters long")
    .max(30 , "Name must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain letters"),
  slotId: z.string().refine((id)=> mongoose.isValidObjectId(id), {message: "Invalid slot ID"}),
  meetLink: z.string()
})

const bookSlot = asyncHandler(async(req , res)=>{
  const parseResult = bookingSchema.safeParse(req.body)

  if (!parseResult.success) {
    throw new ApiError(400 , parseResult.error.issues[0].message)
  }

  const {email , name , reason ,  slotId , slotCreator}= parseResult.data
  
  const slot = await Slot.findByIdAndUpdate(
    slotId,
    { status: 'booked' },
    { new: true }
  )

  if (!slot) {
    throw new ApiError(404, 'Slot not found');
  }

  try {
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
    console.error("Error booking slot:", error)
    throw new ApiError(500 ,"Something went wrong while booking your slot")
  }
})

const sendEmail = asyncHandler (async (req, res)=>{
  const parseResult = emailSchema.safeParse(req.body)

  if (!parseResult.success) {
    throw new ApiError(400 , parseResult.error.issues[0].message)
  }
  const {clientEmail , clientName , slotId , meetLink}= parseResult.data

  try {
    await emailQueue.add(`${clientEmail}`, {clientEmail , clientName , slotId , meetLink})

    return res.status(200).json(
      new ApiResponse(200 , "Email sent successfully")
    )
  } catch (error) {
    console.error("Something went wrong while sending email" , error)
  }
})

export  {bookSlot , sendEmail}