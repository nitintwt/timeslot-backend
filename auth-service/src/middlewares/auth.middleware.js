import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyAuth = asyncHandler( async (req , res , next)=>{
  console.log("auth middleware" , req.cookies)
  try {
    const token = req.cookies?.accessToken
    console.log("server cookies" , req.cookies)

    if(!token){
      return res.status(401).json(
        {message:"Unauthorized request"}
      )
    }
    const decodedToken = jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if(!user){
      return res.status(401).json(
        {message:"Invalid access token"}
      )
    }
    next()
  } catch (error) {
    return res.status(500).json(
      {message: error.message || "Invalid Access Token"}
    )
  }

})

export default verifyAuth