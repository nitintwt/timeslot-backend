import {Router} from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.route("/register").post(registerUser)
authRouter.route("/login").post(loginUser)
authRouter.route("/logout").post(logoutUser)
authRouter.route("/refresh-token").post(refreshAccessToken)

export default authRouter