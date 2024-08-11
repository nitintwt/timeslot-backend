import { Router } from "express";
import { getAllCustomersData, getCustomerData, getUserDetails, registerUser, setUsername, totalNumberOfMeetingsOfLast28Days, totalRevenueofLast28Days } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/getUserDetails").get( verifyUser ,getUserDetails)
router.route("/setUsername").post( verifyUser , setUsername)
router.route("/totalNumberOfMeetingsOfLast28Days").get( verifyUser ,totalNumberOfMeetingsOfLast28Days)
router.route("/totalRevenueOfLast28Days").get(verifyUser ,totalRevenueofLast28Days)
router.route("/getCustomerData").get(verifyUser ,getCustomerData)
router.route("/getAllCustomersData").get(verifyUser ,getAllCustomersData)

export default router