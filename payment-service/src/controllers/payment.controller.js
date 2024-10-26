import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import createRazorpayInstance from '../config/razorpay.config.js'
import crypto from 'crypto'

const razorpayInstance = createRazorpayInstance()

const createOrder = asyncHandler (async (req , res)=>{
  const {subscriptionId}= req.body
  // fetch amount of the order( monthly or yearly subscription amount) using id 
  const amount = 100

  // create an order with razorpay
  const options = {
    amount : amount * 100,
    currency: "INR",
    receipt: 'receipt_order_1',
    name: "TimeSlot",
    description: "subscribtion"
  }

  try {
     razorpayInstance.orders.create(options, (err, order)=>{
      if(err){
        throw new ApiError(500 , err , "Something went wrong.")
      }
      return res.status(200).json(
        new ApiResponse(200 , order , "Successfully created your order" )
      )
    } )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong.")
  }
})


const verifyPayment = asyncHandler (async ( req , res)=>{
  const {orderId , paymentId , signature}= req.body

  //create hmac object 
  const hmac = crypto.createHmac("sha256" , process.env.RAZORPAY_KEY_SECRET)

  hmac.update(orderId + "|" + paymentId)
  const generatedSignature = hmac.digest("hex")

  if (generatedSignature === signature){
    return res.status(200).json(
      new ApiResponse(200 , null , "Payment Verified")
    )
  } else{
    return res.status(400).json(
      new ApiResponse(400 , null , "Payment not verified")
    )
  }
})

export {createOrder , verifyPayment}