import { google } from "googleapis";
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {v4 as uuid} from 'uuid'
import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import axios from 'axios'
import crypto from 'crypto'
import dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config({
  path:'./.env'
})

/* THE FLOW OF GOOGLE CALENDER INTEGRATION :-
   I have made an project in google developer console , and from this i have got some keys.
   The user will hit the calender integration component , first he will be directed to autheticate using OAuth , and then he will be asked to give my project , TimeSlot permission to edit there google calender.
   After the user gave permission , he will be redirected to our product page with an authorization code attached.
   we use this authorization code to request an access token from google OAuth
   And with each event post request we send this access token with event details like start time , end time , attendes , meet link.
*/

/*
  I am declaring oauth2Client in each scope , and not declaring it globally because global variable can cause issue when multiple requests are 
  handled concurrently. When multiple requests are being processed simultaneously, a shared global oauth2Client might have its state overwritten by concurrent requests, leading to unpredictable behavior.
  Creating a new instance of oauth2Client per request ensures that each request is isolated, with its own state and credentials, avoiding unwanted issues.
*/

//const key = Buffer.from(process.env.CRYPTO_KEY, 'hex'); // 32 bytes for aes-256-cbc
//const iv = Buffer.from(process.env.CRYPTO_IV, 'hex'); // 16 bytes for aes-256-cbc


const googleAuth = asyncHandler (async (req , res)=>{
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

  const scopes = ['https://www.googleapis.com/auth/calendar']

  const url = oauth2Client.generateAuthUrl({
    access_type:"offline",
    scope:scopes
  })

  res.redirect(url)
})

const googleLogin= asyncHandler(async (req , res)=>{
   const code = req.query.code  
   const userDbId= req.body.userDbId

   if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }

   const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

   try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // convert tokens to a JSON string before encryption
    /*const tokenString = JSON.stringify(tokens)

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(tokenString, 'utf-8', 'hex')
    encrypted += cipher.final('hex')*/

    const user = await User.findByIdAndUpdate(userDbId ,{
      tokens: JSON.stringify(tokens)
    })

    if(!user){
      return res.status(404).json(
        {message:"User not found"}
      )
    }

    return res.status(200)
    .json(new ApiResponse (200 , tokens, 'Login successfull!!'))
   } catch (error) {
    console.error("Google login error" , error)
    return res.status(500).json(
      {message:"Something went wrong. Try login again"}
    )
   }
})

const refreshToken = asyncHandler (async (req , res)=>{
  const userDbId = req.query.userDbId

  if (!mongoose.isValidObjectId(userDbId)){
    return res.status(400).json(
      {message:"Invalid user ID"}
    )
   }
  
  try {
    const user = await User.findById(userDbId)
    const tokens = JSON.parse(user.tokens)
    const { refresh_token } = tokens
    const newAccessToken = await axios.post('https://www.googleapis.com/oauth2/v4/token', null , {
      params:{
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      }
    })

    const {access_token , expires_in} = newAccessToken.data

    tokens.access_token = access_token;
    tokens.expiry_date = expires_in;
    user.tokens = JSON.stringify(tokens);
    await user.save()
    return res.status(200).json(
      new ApiResponse (200 , "Token refreshed successfully")
    )
  } catch (error) {
    console.error("refresh token error" , error)
    return res.status(500).json(
      {message: "Something went wrong while refreshing OAuth token"}
    )
  }
})

const scheduleEvent = asyncHandler (async ( req , res)=>{
  const { userName , client , clientEmail , date , timeSlot , meetReason}= req.body

  const user = await User.findOne({userName: userName})
  const slot = await Slot.findById(timeSlot)
  /*const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(user?.tokens, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  console.log("decrypted" , decrypted)*/

  const tokens = JSON.parse(user?.tokens)
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )
   oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({
    version: "v3",
    auth:process.env.GOOGLE_CALENDER_API_KEY
  })

  try {
    const calenderEvent = await calendar.events.insert({
      calendarId:"primary",
      auth:oauth2Client,
      conferenceDataVersion:1,
      requestBody:{
        summary:`Google meet of ${user.fullName} and ${client}`,
        description:`Reason of meet as described by ${client}:- ${meetReason}`,
        start:{
          dateTime: `${date}T${slot.startTime}:00+05:30`,
          timeZone:'Asia/Kolkata',
        },
        end:{
          dateTime: `${date}T${slot.endTime}:00+05:30`,
          timeZone:"Asia/Kolkata"
        },
        conferenceData:{
          createRequest: {
            requestId: uuid(),
          }
        },
        attendees:[
          { email: user.email },
          { email: clientEmail }
        ]
      }
    })
    const meetLink = calenderEvent.data.hangoutLink
    return res.status(200).json(
      new ApiResponse(200 , meetLink , "Meeting scheduled successfully. Check your google calender")
    )
  } catch (error) {
    console.error("Schedule error" , error)
    return res.status(500).json(
      {message: "Something went wrong while scheduling meeting. Please try again"}
    )
  }
})



export {googleAuth , googleLogin , scheduleEvent , refreshToken}