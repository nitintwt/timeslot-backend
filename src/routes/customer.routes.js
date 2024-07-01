import { Router } from "express";
import { bookSlot, getCustomersData, sendEmail } from "../controllers/customer.controller.js";

const customerRouter = Router()

customerRouter.route("/bookSlot").post(bookSlot)
customerRouter.route("/sendmail").post(sendEmail)
customerRouter.route("/customerData").get(getCustomersData)

export default customerRouter