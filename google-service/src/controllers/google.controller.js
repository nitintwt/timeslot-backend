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

   const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
   )

   const options = {
    httpOnly : true,
    secure: true,
  }

   try {
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);
    return res.status(200)
    .cookie("tokens", tokens , options)
    .json(new ApiResponse (200 , tokens, 'Login successfull!!'))
   } catch (error) {
    throw new ApiError(500 , error , "Something went wrong. Try login again")
   }
})

const scheduleEvent = asyncHandler (async ( req , res)=>{
  const { userName , client , clientEmail , date , timeSlot , meetReason}= req.body
  const tokens= {"access_token":"ya29.a0AXooCgvjzoSxKyqRN2ToSxPJ9kFkv4a6xh4pCQX1_om6lufaxvl1JWUAsi66QDX9ybEaae6MUopRKEDvltnNxmpCsQrQzW3WsMlKEnUSWD8dE7jXi4enn3k01z_rt9HA2r96f_pEoVb4KwOlYDVevIxWcyU-mCs6aGAJaCgYKAXwSARMSFQHGX2MiYlNe70x3S-Rz27-ltz6eRQ0171","refresh_token":"1//0g9SGCLgMl7T5CgYIARAAGBASNwF-L9IrYhBAh4iei9fVjj2RWVmILevUuWt9VhAs1GEwW0dtz48LOV5JPW3ijEKn4oIEb9w4UC4","scope":"https://www.googleapis.com/auth/calendar","token_type":"Bearer","expiry_date":1720716619857}

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

  const user = await User.findOne({userName: userName})
  const slot = await Slot.findById(timeSlot)

  try {
    const calenderEvent = await calendar.events.insert({
      calendarId:"primary",
      auth:oauth2Client,
      conferenceDataVersion:1,
      requestBody:{
        summary:`Google meet of ${user.fullName} and ${client}`,
        description:`Reason of meet as described by ${client}:- ${meetReason}`,
        start:{
          dateTime: `${formatDate(date)}T${slot.startTime}:00+05:30`,
          timeZone:'Asia/Kolkata',
          
        },
        end:{
          dateTime: `${formatDate(date)}T${slot.endTime}:00+05:30`,
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