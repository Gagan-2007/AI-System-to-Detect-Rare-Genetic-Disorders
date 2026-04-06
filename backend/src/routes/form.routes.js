import { Router } from "express";
import { saveGeneticData, updatePrediction, getGeneticData } from "../controllers/form.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/save").post(saveGeneticData);
router.route("/update-prediction").post(updatePrediction);

// Public route for frontend retrieval (No JWT required)
router.route("/get-result/:id").get(getGeneticData);

export default router;
