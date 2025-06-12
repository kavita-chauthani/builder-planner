import express from "express";
import {
  getDrawingByIdController,
  getDrawingController,
  newDrawingController,
} from "../controllers/DrawingController.js";
const router = express.Router();

router.post("/", newDrawingController);
router.get("/", getDrawingController);
router.get("/:id", getDrawingByIdController);

export default router;
