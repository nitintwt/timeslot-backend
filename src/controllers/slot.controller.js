import {Slot} from '../models/slot.model.js'
import { z} from 'zod'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';


const createSlot = asyncHandler( async(req , res)=>{
  const {slots} = req.body

  if (slots.length === 0) {
    throw new ApiError(400, "No slots provided");
  }

  const creator = slots?.[0]?.creator

  // Check if the creator exists
  const user = await User.findOne({_id:creator})
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // slot.save() will be an array of promises , Promise.all() takes all this arrays and allow all these promises to execute concurrently( all at the same time) and retruns a single promise
  // so here a slot.save() starts its execution without waiting for the previous one to be completed
  try {
    const createdSlots = await Promise.all(slots.map(async (slotData) => {
      const slot = new Slot(slotData)
      await slot.save()
      user.slots.push(slot._id)
      return slot;
    }));

    await user.save()

    return res.status(201).json(
      new ApiResponse(201, createdSlots, "Slot created Successfully")
    )
  } catch (error) {
    throw new ApiError(500, error.message, "Error while saving slots in DB")
  }

})

export {createSlot} 