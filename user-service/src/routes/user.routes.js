import { Router } from "express";
import { getAllCustomersData, getCustomerData, getUserDetails, setUsername, totalNumberOfMeetingsOfLast28Days, totalRevenueofLast28Days } from "../controllers/user.controller.js";
import verifyAuth from "../middlewares/auth.middleware.js";
const userRouter = Router()

userRouter.route("/userDetails").get(getUserDetails)
userRouter.route("/setUsername").post(setUsername)
userRouter.route("/totalNumberOfMeetingsOfLast28Days").get(totalNumberOfMeetingsOfLast28Days)
userRouter.route("/totalRevenueOfLast28Days").get(totalRevenueofLast28Days)
userRouter.route("/customerData").get(getCustomerData)
userRouter.route("/allCustomersData").get(getAllCustomersData)

export default userRouter