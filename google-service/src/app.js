import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,   // // kon se origin pe alow ka rahe hai 
  credentials:true,
}))

app.use(express.json({limit:'16kb'}))   // setting a limit of json , like how much json data can be sent to backend 
app.use(express.urlencoded({extended: true , limit:"16kb"}))   // setting a limit to url data 
app.use(express.static("public"))  //pubic folder to save files
app.use(cookieParser())  // for crud operations on user's browser cookies


import googleRouter from './routes/google.routes.js'

app.use("/api/v1/google" , googleRouter)
app.use("/", (req , res)=>{
  return res.status(200).json({ message: "going good" });
})

export {app}