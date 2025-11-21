import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import helmet from 'helmet'
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import mentorRoutes from "./routes/mentorRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"


dotenv.config();

const app = express();
connectDB()

app.use(cors({
  origin: 'http://localhost:3000', // Your Next.js app URL
  credentials: true
}));
app.use(express.json())
app.use(helmet())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get("/",(req,res)=>{
    return res.json({messsage:"Hello , Everything is Working Fine "})
})

export default app;