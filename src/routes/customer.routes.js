import { Router } from "express";
import { bookSlot } from "../controllers/customer.controller";

const customerRouter = Router()

customerRouter.route("/bookSlot").post(bookSlot)

export default customerRouter