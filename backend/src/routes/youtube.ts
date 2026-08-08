import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/youtube/search?q={query}
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("Missing YOUTUBE_API_KEY in backend environment");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: q,
        type: 'video',
        maxResults: 10,
        key: apiKey,
      }
    });

    // Normalize results for frontend
    const results = response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      description: item.snippet.description,
    }));

    res.json(results);
  } catch (error: any) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

export default router;
