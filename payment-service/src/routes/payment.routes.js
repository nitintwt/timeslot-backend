import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = Router()

paymentRouter.route("/order").post(createOrder)
paymentRouter.route("/verify").post(verifyPayment)

export default paymentRouter