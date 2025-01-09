import { Router } from "express";
import { getAllCustomersData, getCustomerData, getUserDetails, setUsername, totalNumberOfMeetingsOfLast28Days, totalRevenueofLast28Days } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.route("/getUserDetails").get(getUserDetails)
userRouter.route("/setUsername").post(setUsername)
userRouter.route("/totalNumberOfMeetingsOfLast28Days").get(totalNumberOfMeetingsOfLast28Days)
userRouter.route("/totalRevenueOfLast28Days").get(totalRevenueofLast28Days)
userRouter.route("/getCustomerData").get(getCustomerData)
userRouter.route("/getAllCustomersData").get(getAllCustomersData)

export default userRouter