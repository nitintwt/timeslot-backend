import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyUser = asyncHandler(async (req, res, next) => {
  const userDbId = req.cookies.userDbId

  if (!userDbId) {
    return res.status(401).json(
      new ApiError(401, null, "Unauthorized request: No user ID found. Please Login")
    )
  }
  next()
})
