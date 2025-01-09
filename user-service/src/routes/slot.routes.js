import { Router } from "express";
import { cancelSlotBooking, createSlot, deleteSlot, getAvailableSlots, getCancelledSlots, getPastSlots, getSlotData, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";
import verifyAuth from "../middlewares/auth.middleware.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post( verifyAuth ,createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post( verifyAuth , cancelSlotBooking)
slotRouter.route('/upcomingSlots').get( verifyAuth ,getUpcomingSlots)
slotRouter.route('/pastSlots').get( verifyAuth ,getPastSlots)
slotRouter.route('/cancelledSlots').get( verifyAuth ,getCancelledSlots)
slotRouter.route('/getSlotData').get(getSlotData)
slotRouter.route("/availableSlots").get( verifyAuth ,getAvailableSlots)
slotRouter.route("/deleteSlot").delete(verifyAuth , deleteSlot)

export default slotRouter