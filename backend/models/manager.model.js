import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
});

export default mongoose.model("Manager", managerSchema);
