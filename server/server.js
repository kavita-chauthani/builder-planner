import express from "express";
import connectDB from "./config/db.js";
import colors from "colors";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import drawingRoutes from "./routes/drawingRoute.js";

//configure dotenv
dotenv.config();

//database config
connectDB();

//rest object
const app = express();
app.use(cors());
app.use(express.json());

//rest api
app.use("/api/drawings", drawingRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${process.env.DEV_MODE} ${PORT}`.bgCyan.white);
});
