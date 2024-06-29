import { Router } from "express";
import { getUserDetails, registerUser, setUsername, totalNumberOfMeetingsOfLast28Days, totalRevenueofLast28Days } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/getUserDetails").get(getUserDetails)
router.route("/setUsername").post(setUsername)
router.route("/totalNumberOfMeetingsOfLast28Days").get(totalNumberOfMeetingsOfLast28Days)
router.route("/totalRevenueOfLast28Days").get(totalRevenueofLast28Days)

export default router