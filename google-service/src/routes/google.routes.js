import { Router } from "express";
import { googleAuth , googleLogin, refreshToken, scheduleEvent} from "../controllers/google.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";


const googleRouter = Router()

googleRouter.route("/OAuth").get(googleAuth)
googleRouter.route("/redirect").post(googleLogin)
googleRouter.route("/scheduleEvent").post(scheduleEvent)
googleRouter.route("/refreshToken").post(refreshToken)

export default googleRouter