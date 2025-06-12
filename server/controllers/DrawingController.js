import DrawingModel from "../models/DrawingModel.js";

export const newDrawingController = async (req, res) => {
  const { name, shapes } = req.body;
  try {
    const newDrawing = new DrawingModel({ name, shapes });
    await newDrawing.save();
    res.status(201).send({
      success: true,
      message: "Drawing created successfully ",
      newDrawing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Failed to save drawing",
    });
  }
};

export const getDrawingController = async (req, res) => {
  const drawings = await DrawingModel.find().sort({ createdAt: -1 });
  res.status(201).send({
    success: true,
    message: "All drawing ",
    drawings,
  });
};

export const getDrawingByIdController = async (req, res) => {
  try {
    const drawing = await DrawingModel.findById(req.params.id);
    res.status(201).send({
      success: true,
      message: "Single drawing fetched ",
      drawing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting single product",
    });
  }
};
