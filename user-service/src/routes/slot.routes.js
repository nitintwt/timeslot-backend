import { Router } from "express";
import { cancelSlotBooking, createSlot, deleteSlot, getAvailableSlots, getCancelledSlots, getPastSlots, getSlotData, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";
import verifyAuth from "../middlewares/auth.middleware.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)
slotRouter.route("/slots").get(getSlots)
slotRouter.route("/slot").delete(deleteSlot)
slotRouter.route("/cancelBooking").post(cancelSlotBooking)
slotRouter.route('/upcomingSlots').get(getUpcomingSlots)
slotRouter.route('/pastSlots').get(getPastSlots)
slotRouter.route('/cancelledSlots').get(getCancelledSlots)
slotRouter.route('/slotData').get(getSlotData)
slotRouter.route("/availableSlots").get(getAvailableSlots)


export default slotRouter