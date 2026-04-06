import { Router } from "express";
import { 
    registerUser, 
    login,
    logoutUser
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(login);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)


export default router

//users.insertOne()