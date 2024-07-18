import { Router } from "express";
import { cancelSlotBooking, createSlot, getPastSlots, getSlots, getUpcomingSlots } from "../controllers/slot.controller.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post(cancelSlotBooking)
slotRouter.route('/upcomingSlots').get(getUpcomingSlots)
slotRouter.route('/pastSlots').get(getPastSlots)

export default slotRouter