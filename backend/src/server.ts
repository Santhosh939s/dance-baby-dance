import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import youtubeRoutes from './routes/youtube';
import oauthRoutes from './routes/oauth';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Dance Baby Dance API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
