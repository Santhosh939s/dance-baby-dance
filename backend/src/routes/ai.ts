import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generate', upload.single('audio_file'), async (req, res) => {
  const { mode } = req.query;

  if (mode === 'replay') {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
      const response = await axios.get(`${aiServiceUrl}/replay`);
      return res.json(response.data);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Failed to fetch replay data.' });
    }
  }

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No audio file provided' });
  }

  try {
    // Proxy the file to FastAPI service
    const form = new FormData();
    form.append('audio_file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const response = await axios.post(`${aiServiceUrl}/generate`, form, {
      headers: {
        ...form.getHeaders()
      },
      // Timeout after 5 minutes just in case inference is slow
      timeout: 300000 
    });

    // Cleanup local temp file
    fs.unlinkSync(req.file.path);

    res.json(response.data);
  } catch (error: any) {
    // Cleanup local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('FastAPI Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to communicate with AI Backend'
    });
  }
});

export default router;
