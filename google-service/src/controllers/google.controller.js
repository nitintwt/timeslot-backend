import { google } from "googleapis";
import { asyncHandler } from "../../../common/utils/asyncHandler.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { ApiError } from "../../../common/utils/ApiError.js";
import {v4 as uuid} from 'uuid'
import { Customer } from "../models/customer.model.js";
import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";

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
   console.log(code)

   const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

   try {
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);
    const user = await User.findById(userDbId)
    user.tokens = JSON.stringify(tokens)
    await user.save()
    return res.status(200)
    .json(new ApiResponse (200 , tokens, 'Login successfull!!'))
   } catch (error) {
    throw new ApiError(500 , error , "Something went wrong. Try login again")
   }
})

const scheduleEvent = asyncHandler (async ( req , res)=>{
  const { userName , client , clientEmail , date , timeSlot , meetReason}= req.body

  const user = await User.findOne({userName: userName})
  const slot = await Slot.findById(timeSlot)

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

  function formatDate (date){
    const [day , month , year]=date.split("/")
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }

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
    return res.status(200).json(
      new ApiResponse(200 , calenderEvent , "Meeting scheduled successfully. Check your google calender")
    )
  } catch (error) {
    throw new ApiError ( 500 , error , "Something went wrong while scheduling meeting. Please try again")
  }
})



export {googleAuth , googleLogin , scheduleEvent}