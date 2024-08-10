import { Router } from "express";
import { cancelSlotBooking, createSlot, getCancelledSlots, getPastSlots, getSlotData, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post(cancelSlotBooking)
slotRouter.route('/upcomingSlots').get(getUpcomingSlots)
slotRouter.route('/pastSlots').get(getPastSlots)
slotRouter.route('/cancelledSlots').get(getCancelledSlots)
slotRouter.route('/getSlotData').get(getSlotData)

export default slotRouter