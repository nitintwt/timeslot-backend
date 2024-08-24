import { Router } from "express";
import { cancelSlotBooking, createSlot, deleteSlot, getAvailableSlots, getCancelledSlots, getPastSlots, getSlotData, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post( createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post( cancelSlotBooking)
slotRouter.route('/upcomingSlots').get(getUpcomingSlots)
slotRouter.route('/pastSlots').get(getPastSlots)
slotRouter.route('/cancelledSlots').get(getCancelledSlots)
slotRouter.route('/getSlotData').get(getSlotData)
slotRouter.route("/availableSlots").get( getAvailableSlots)
slotRouter.route("/deleteSlot").delete( deleteSlot)

export default slotRouter