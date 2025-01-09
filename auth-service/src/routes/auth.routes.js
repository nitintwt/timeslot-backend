import {Router} from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/auth.controller.js'
import verifyAuth from '../middlewares/auth.middleware.js'

const authRouter = Router()

authRouter.route("/register").post(registerUser)
authRouter.route("/login").post(loginUser)
authRouter.route("/logout").post( verifyAuth ,logoutUser)
authRouter.route("/refresh-token").post( verifyAuth ,refreshAccessToken)

export default authRouter