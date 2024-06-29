import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from 'nodemailer'
import { User } from "../models/user.model.js";

const bookSlot = asyncHandler(async(req , res)=>{
  const {email , name , reason ,  slotId}= req.body
  
  const slot = await Slot.findById(slotId)

  if (!slot) {
    throw new ApiError(404, 'Slot not found');
  }

  try {
    slot.booked = true;
    await slot.save();
    const saveCustomerData = await Customer.create({
      customerEmail: email,
      customerName: name,
      slot: slotId,
      reasonForMeet: reason,
    })

    return res.status(201).json(
      new ApiResponse(201 , saveCustomerData , "Slot Booked Successfully")
    )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong while booking slots")
  }
})

const sendEmail = asyncHandler (async (req, res)=>{
  const {clientEmail , clientName , slotId}= req.body

  const slot = await Slot.findById(slotId)

  const user = await User.findById(slot.creator)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  })

  const mailConfigs = {
    from:process.env.EMAIL_USER,
    to: clientEmail,
    Subject : "Testing",
    text: `Hello ${clientName}. This email is regarding your scheduled meeting with ${user.fullName}. The meeting is from ${slot.startTime} to ${slot.endTime} on ${slot.date}. Below we have provided the link to the meeting.`
  }

  transporter.sendMail(mailConfigs , function (error , info){
    if (error){
      throw new ApiError(404, 'Something went wrong while sending email' , error);
    } else {
      return res.status(201).json(
        new ApiResponse (201 , info , "Email sent successfully")
      )
    }
  })

})

const getCustomersData = asyncHandler(async (req , res)=>{
  

})

export  {bookSlot , sendEmail}