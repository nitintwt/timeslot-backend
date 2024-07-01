import { Router } from "express";
import { googleAuth , googleLogin, scheduleEvent} from "../controllers/google.controller.js";


const googleRouter = Router()

googleRouter.route("/OAuth").get(googleAuth)
googleRouter.route("/redirect").get(googleLogin)
googleRouter.route("/scheduleEvent").post(scheduleEvent)

export default googleRouter