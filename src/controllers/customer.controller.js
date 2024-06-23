import { Customer } from "../models/customer.model";
import { Slot } from "../models/slot.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError";

const bookSlot = asyncHandler(async(req , res)=>{
  const {email , name , slotId}= req.body
  
  const slot = await Slot.findById(slotId)

  if (!slot) {
    throw new ApiError(404, 'Slot not found', 'Invalid slot ID');
  }

  try {
    slot.booked = true;
    await slot.save();
    const saveCustomerData = await Customer.create({
      customerEmail: email,
      customerName: name,
      slot: slotId
    })

    return res.status(201).json(
      new ApiResponse(201 , saveCustomerData , "Slot Booked Successfully")
    )
  } catch (error) {
    throw new ApiError(500 , error , "Something went wrong while booking slots")
  }
})

export  {bookSlot}