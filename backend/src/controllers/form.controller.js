import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GeneticData } from "../models/formData.js";

const saveGeneticData = asyncHandler(async (req, res) => {
    const { 
        gene, 
        mutation, 
        mutation_present, 
        age, 
        hemoglobin_level, 
        rbc_count, 
        symptoms 
    } = req.body;

    // Validation
    if ([gene, mutation].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Gene and mutation are required");
    }

    if ([mutation_present, age, hemoglobin_level, rbc_count].some((field) => field === undefined || field === null)) {
        throw new ApiError(400, "All numerical fields are required");
    }

    // Step 1: Save data to MongoDB as 'pending'
    const geneticEntry = await GeneticData.create({
        gene,
        mutation,
        mutation_present,
        age,
        hemoglobin_level,
        rbc_count,
        symptoms: symptoms || {},
        predictionStatus: "pending"
    });

    if (!geneticEntry) {
        throw new ApiError(500, "Something went wrong while saving genetic data");
    }

    // Step 2: Trigger ML model asynchronously (DO NOT WAIT)
    // We send development/local ML server the record ID so it can call us back
    fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: geneticEntry._id, // Renamed to match your ML model's expectation
            gene,
            mutation,
            mutation_present,
            age,
            hemoglobin_level,
            rbc_count,
            symptoms: symptoms || {}
        }),
    }).catch(err => console.error("Async ML trigger failed:", err.message));

    // Step 3: Respond to user immediately
    return res.status(201).json(
        new ApiResponse(201, geneticEntry, "Genetic data saved. Prediction is being processed in the background.")
    );
});

// New Controller: Handle prediction results from the ML Model
const updatePrediction = asyncHandler(async (req, res) => {
    const { user_id, prediction } = req.body;

    if (!user_id || !prediction) {
        throw new ApiError(400, "user_id and prediction result are required");
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(400, "Invalid Genetic Record ID (user_id)");
    }

    const geneticEntry = await GeneticData.findByIdAndUpdate(
        user_id,
        {
            $set: {
                prediction: prediction,
                predictionStatus: "completed"
            }
        },
        { new: true }
    );

    if (!geneticEntry) {
        throw new ApiError(404, `Genetic record with ID ${user_id} not found. Please ensure you are sending the correct '_id' from the save step.`);
    }

    return res.status(200).json(
        new ApiResponse(200, geneticEntry, "Prediction updated successfully")
    );
});

// New Controller: Fetch prediction data for the frontend
const getGeneticData = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "A valid Genetic Record ID is required");
    }

    const geneticEntry = await GeneticData.findById(id);

    if (!geneticEntry) {
        throw new ApiError(404, "Genetic record not found");
    }

    return res.status(200).json({
        prediction: geneticEntry.prediction || "Processing..."
    });
});

export { saveGeneticData, updatePrediction, getGeneticData };
