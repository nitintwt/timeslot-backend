import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true
}))

app.use(express.json({limit:'16kb'}))   // setting a limit of json , like how much json data can be sent to backend 
app.use(express.urlencoded({extended: true , limit:"16kb"}))   // setting a limit to url data 
app.use(express.static("public"))  //pubic folder to save files
app.use(cookieParser())  // by this we can access user cookies , and can do CRUD operation on it

//routes
app.use("/api/v1/auth", authRouter)
app.get("/", (req , res)=>{
  return res.status(200).json({message : "going good from auth-service"})
})

export {app}