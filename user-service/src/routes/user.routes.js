import { Router } from "express";
import { getAllCustomersData, getCustomerData, getUserDetails, setUsername, totalNumberOfMeetingsOfLast28Days, totalRevenueofLast28Days } from "../controllers/user.controller.js";
import verifyAuth from "../middlewares/auth.middleware.js";
const userRouter = Router()

userRouter.route("/userDetails").get(verifyAuth , getUserDetails)
userRouter.route("/setUsername").post( verifyAuth ,setUsername)
userRouter.route("/totalNumberOfMeetingsOfLast28Days").get( verifyAuth ,totalNumberOfMeetingsOfLast28Days)
userRouter.route("/totalRevenueOfLast28Days").get(verifyAuth , totalRevenueofLast28Days)
userRouter.route("/customerData").get(verifyAuth ,getCustomerData)
userRouter.route("/allCustomersData").get(verifyAuth ,getAllCustomersData)

export default userRouter