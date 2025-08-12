import mongoose from "mongoose";

const SimulationSchema = new mongoose.Schema({
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    inputs: { 
        type: Object, 
        required: true 
    },
    results: { 
        type: Object, 
        required: true 
    }  
});

const Simulation = mongoose.model('Simulation', SimulationSchema);

export default Simulation;