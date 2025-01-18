import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  origin: ["https://www.timeslot.co.in", "https://timeslot.co.in"],
  credentials:true
}))

app.set('trust proxy', true)
app.use(express.json({limit:'16kb'}))   // setting a limit of json , like how much json data can be sent to backend 
app.use(express.urlencoded({extended: true , limit:"16kb"}))   // setting a limit to url data 
app.use(cookieParser())  // for crud operations on user's browser cookies


import googleRouter from './routes/google.routes.js'

app.use("/api/v1/google" , googleRouter)
app.get("/", (req , res)=>{
  return res.status(200).json({ message: "going good" });
})

export {app}