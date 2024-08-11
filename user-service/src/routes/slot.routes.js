import { Router } from "express";
import { cancelSlotBooking, createSlot, deleteSlot, getAvailableSlots, getCancelledSlots, getPastSlots, getSlotData, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post( verifyUser,createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post(verifyUser, cancelSlotBooking)
slotRouter.route('/upcomingSlots').get(verifyUser ,getUpcomingSlots)
slotRouter.route('/pastSlots').get(verifyUser ,getPastSlots)
slotRouter.route('/cancelledSlots').get(verifyUser ,getCancelledSlots)
slotRouter.route('/getSlotData').get(verifyUser ,getSlotData)
slotRouter.route("/availableSlots").get(verifyUser , getAvailableSlots)
slotRouter.route("/deleteSlot").delete(verifyUser , deleteSlot)

export default slotRouter