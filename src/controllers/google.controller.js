import { google } from "googleapis";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {v4 as uuid} from 'uuid'

/*
  I am declaring oauth2Client in each scope , and not declaring it globally because global variable can cause issue when multiple requests are 
  handled concurrently. When multiple requests are being processed simultaneously, a shared global oauth2Client might have its state overwritten by concurrent requests, leading to unpredictable behavior.
  Creating a new instance of oauth2Client per request ensures that each request is isolated, with its own state and credentials, avoiding unwanted issues.
*/

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
   const tokenCode = req.query.code

   const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

   try {
    const {tokens} = await oauth2Client.getToken(tokenCode)
    oauth2Client.setCredentials(tokens);
    return res.status(200).json(
      new ApiResponse (200 , 'Login successfull!!')
    )
   } catch (error) {
    throw new ApiError(500 , error , "Something went wrong. Try login again")
   }
})

const scheduleEvent = asyncHandler (async ( req , res)=>{
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

  const calendar = google.calendar({
    version: "v3",
    auth:process.env.GOOGLE_CALENDER_API_KEY
  })

  try {
    await calendar.events.insert({
      calendarId:"Primary",
      auth:oauth2Client,
      conferenceDataVersion:1,
      requestBody:{
        summary:"Test kar raha hu",
        description:"bola na test kar raha hu",
        start:{
          dateTime:hdhhd, // put client meet time here
          timeZone:'Asia/Kolkata'
        },
        end:{
          dateTime:jjdhd, // put client meet time here
          timeZone:"Asia/Kolkata"
        },
        conferenceData:{
          createRequest: {
            requestId: uuid(),
          }
        },
        attendees:[{
          email:""
        }]
      }
    })
    return res.status(200).json(
      new ApiResponse(200 , "Meeting scheduled successfully. Check your google calender")
    )
  } catch (error) {
    throw new ApiError ( 500 , error , "Something went wrong while scheduling meeting. Please try again")
  }
})



export {googleAuth , googleLogin , scheduleEvent}