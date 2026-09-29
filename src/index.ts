import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Estate API",
    });
});

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Estate API is healthy",
    });
});



app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});


const APP_PORT = Number(process.env.APP_PORT) || 5003;

app.listen(APP_PORT, "0.0.0.0", () => {
    console.log(`Estate App API running on port ${APP_PORT}`);
});