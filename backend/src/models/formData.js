import mongoose, {Schema} from "mongoose";

const formSchema = new Schema({
    gene: {
        type: String,
        required: true,
        trim: true
    },
    mutation: {
        type: String,
        required: true,
        trim: true
    },
    mutation_present: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    hemoglobin_level: {
        type: Number,
        required: true
    },
    rbc_count: {
        type: Number,
        required: true
    },
    symptoms: {
        type: Map,
        of: Number,
        default: {}
    },
    prediction: {
        type: Schema.Types.Mixed,
        default: null
    },
    predictionStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    }
}, {timestamps: true})

export const GeneticData = mongoose.model("GeneticData", formSchema)
export const Form = GeneticData;