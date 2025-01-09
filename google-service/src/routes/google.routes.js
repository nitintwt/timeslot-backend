import { Router } from "express";
import { googleAuth , googleLogin, refreshToken, scheduleEvent} from "../controllers/google.controller.js";
import verifyAuth from "../middlewares/auth.middleware.js";

const googleRouter = Router()

googleRouter.route("/OAuth").get(googleAuth)
googleRouter.route("/redirect").post( verifyAuth ,googleLogin)
googleRouter.route("/scheduleEvent").post( verifyAuth ,scheduleEvent)
googleRouter.route("/refreshToken").post(verifyAuth ,refreshToken)

export default googleRouter