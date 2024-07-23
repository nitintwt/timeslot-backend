import { Router } from "express";
import { bookSlot, sendEmail } from "../controllers/customer.controller.js";

const customerRouter = Router()

customerRouter.route("/bookSlot").post(bookSlot)
customerRouter.route("/sendmail").post(sendEmail)

export default customerRouter