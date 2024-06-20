import {Slot} from '../models/slot.model.js'
import { z} from 'zod'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';




const createSlot = asyncHandler( async(req , res)=>{
  const slots = req.body

  if (slots.length === 0) {
    throw new ApiError(400, "No slots provided");
  }

  const creator = slots[0]?.creator

  // Check if the creator exists
  const user = await User.findOne({creator})
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // an empty array to hold slots created in future
  const createdSlots = []

 /* slots?.forEach(async (slotData)=>{
    try {
      // create a new slot instance using the slotData
      const slot = new Slot(slotData)
      // save the newly created slot into db
      await slot.save()

      // push the saved slot to the createdSlots array
      createdSlots.push(slot)

      // push the saved slot id to the user's slots array
      user.slots.push(slot._id);
    } catch (error) {
      throw new ApiError(404, error , "error while saving slots in db");
    }
  })*/

    for (const slotData of slots) {
      try {
        // Convert 'false' string to boolean false
        slotData.paid = slotData.paid === 'false' ? false : Boolean(slotData.paid);
  
        // Create new Slot instance
        const slot = new Slot(slotData);
  
        // Save slot to database
        await slot.save();
  
        // Push saved slot to createdSlots array
        createdSlots.push(slot);
  
        // Push ObjectId of slot to user's slots array
        user.slots.push(slot._id);
      } catch (error) {
        console.error(`Error creating slot: ${error.message}`);
        // Handle error
      }
    }


  await user.save();

  return res.status(201).json(
    new ApiResponse( 200 , createdSlots , "Slot created Successfully")
  )
})

export {createSlot} 