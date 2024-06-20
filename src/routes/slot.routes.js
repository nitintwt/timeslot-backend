import { Router } from "express";
import { createSlot } from "../controllers/slot.controller.js";


const slotRouter = Router()

slotRouter.route("/createSlot").post(createSlot)

export default slotRouter