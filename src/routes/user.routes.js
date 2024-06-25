import { Router } from "express";
import { getUserDetails, registerUser, setUsername } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/getUserDetails").get(getUserDetails)
router.route("/setUsername").post(setUsername)

export default router