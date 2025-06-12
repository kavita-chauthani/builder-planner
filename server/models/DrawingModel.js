import mongoose from "mongoose";
const shapeSchema = new mongoose.Schema({
  name: {
    id:String,
    type: String,
    x:Number,
    y:Number,
    width:Number,
    height:Number,
  points:[Number],
  },
});

const drawingSchema = new mongoose.Schema({
  name: String,
  shapes: [shapeSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Drawing", drawingSchema);
