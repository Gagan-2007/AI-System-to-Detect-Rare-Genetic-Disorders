import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes.js';
import formRouter from './routes/form.routes.js';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Welcome to AI-System-to-Detect-Rare-Genetic-Disorders");
});

app.use("/api/v1/user", userRouter)
app.use("/api/v1/genetic-data", formRouter)

// global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
});

export { app }

//users.findOne()

//users.insertOne()