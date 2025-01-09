import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,   // // kon se origin pe alow ka rahe hai 
  credentials:true,
}))

app.use(express.json({limit:'16kb'}))   // setting a limit of json , like how much json data can be sent to backend 
app.use(express.urlencoded({extended: true , limit:"16kb"}))   // setting a limit to url data 

app.get("/", (req , res)=>{
  return res.status(200).json({ message: "going good from email-service" });
})

export {app}