import { Router } from "express";
import { cancelSlotBooking, createSlot, getSlots } from "../controllers/slot.controller.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)
slotRouter.route("/getSlots").get(getSlots)
slotRouter.route("/cancelBooking").post(cancelSlotBooking)

export default slotRouter