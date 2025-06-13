import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routers/router";
import { connectDB } from "./config/config";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

const PORT = parseInt(process.env.PORT || "3000", 10);
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
