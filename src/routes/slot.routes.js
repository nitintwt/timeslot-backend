import { Router } from "express";
import { createSlot, getSlots } from "../controllers/slot.controller.js";

const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)
slotRouter.route("/getSlots").get(getSlots)

export default slotRouter