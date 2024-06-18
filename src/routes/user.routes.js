import { Router } from "express";
import { getUserDetails, registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/getUserDetails").get(getUserDetails)

export default router