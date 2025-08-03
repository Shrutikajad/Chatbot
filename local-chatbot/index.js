
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRoutes from './src/routes/chat.route.js'
import { connectDB } from './src/config/db.js'


 
dotenv.config()

const app = express();
const port = process.env.Port || 5000;


app.use(cors());
app.use(express.json());

app.use('/api',chatRoutes)

connectDB();

app.listen(port,(req,res)=>{
  console.log(`Server is runing on Port : ${port}`);
})