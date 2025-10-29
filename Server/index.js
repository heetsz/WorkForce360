import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import authRouter from "./routes/auth-route.js";
import employeeRouter from "./routes/employee-route.js";
import attendanceRouter from "./routes/attendance-route.js";
import performanceRouter from "./routes/performance-route.js";
import mailRouter from "./routes/mail-route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
}));
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api', employeeRouter);
app.use('/api', attendanceRouter);
app.use('/api', performanceRouter);
app.use('/api', mailRouter);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
      console.log(`Server running`);
      await db();
});