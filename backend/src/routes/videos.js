import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video files
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Temporary storage for video metadata
const videos = new Map();

// Upload video file
router.post('/upload', authenticateToken, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description } = req.body;
    const userId = req.user.userId;

    const videoId = 'video_' + Date.now();
    const video = {
      id: videoId,
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      url: `/api/videos/stream/${videoId}`,
      thumbnail: `/api/videos/thumbnail/${videoId}`,
      duration: null, // Will be filled by video processing
      type: 'upload'
    };

    videos.set(videoId, video);

    res.json({
      message: 'Video uploaded successfully',
      video
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add video from URL (Google Drive, Dropbox, etc.)
router.post('/add-url', authenticateToken, (req, res) => {
  try {
    const { url, title, description } = req.body;
    const userId = req.user.userId;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Validate and process URL
    const processedUrl = processVideoUrl(url);
    if (!processedUrl.isValid) {
      return res.status(400).json({ error: 'Invalid or unsupported video URL' });
    }

    const videoId = 'video_' + Date.now();
    const video = {
      id: videoId,
      title: title || 'External Video',
      description: description || '',
      originalUrl: url,
      streamUrl: processedUrl.streamUrl,
      addedBy: userId,
      addedAt: new Date().toISOString(),
      type: processedUrl.type, // 'drive', 'dropbox', 'youtube', 'direct'
      provider: processedUrl.provider,
      thumbnail: processedUrl.thumbnail
    };

    videos.set(videoId, video);

    res.json({
      message: 'Video added successfully',
      video
    });

  } catch (error) {
    console.error('Add video URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video details
router.get('/:videoId', authenticateToken, (req, res) => {
  try {
    const { videoId } = req.params;
    const video = videos.get(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video });

  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stream video file
router.get('/stream/:videoId', (req, res) => {
  try {
    const { videoId } = req.params;
    const video = videos.get(videoId);

    if (!video || video.type !== 'upload') {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoPath = path.join(process.cwd(), 'uploads', 'videos', video.filename);
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range) {
      // Parse range header and send partial content
      // This is a simplified version - in production, use a proper streaming solution
      res.sendFile(videoPath);
    } else {
      res.sendFile(videoPath);
    }

  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video thumbnail
router.get('/thumbnail/:videoId', (req, res) => {
  try {
    const { videoId } = req.params;
    const video = videos.get(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // In production, generate actual thumbnails using FFmpeg
    // For now, return a placeholder
    res.redirect('https://via.placeholder.com/320x180/333/fff?text=Video+Thumbnail');

  } catch (error) {
    console.error('Get thumbnail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's videos
router.get('/user/my-videos', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userVideos = [];

    for (const video of videos.values()) {
      if (video.uploadedBy === userId || video.addedBy === userId) {
        userVideos.push(video);
      }
    }

    // Sort by upload/add date (newest first)
    userVideos.sort((a, b) => {
      const dateA = new Date(a.uploadedAt || a.addedAt);
      const dateB = new Date(b.uploadedAt || b.addedAt);
      return dateB - dateA;
    });

    res.json({ videos: userVideos });

  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete video
router.delete('/:videoId', authenticateToken, (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.userId;
    const video = videos.get(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user owns the video
    if (video.uploadedBy !== userId && video.addedBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }

    // Delete video file if it's an upload
    if (video.type === 'upload' && video.filename) {
      // In production, properly delete the file
      // fs.unlink(path.join(process.cwd(), 'uploads', 'videos', video.filename))
    }

    videos.delete(videoId);

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to process video URLs
function processVideoUrl(url) {
  const result = {
    isValid: false,
    streamUrl: null,
    type: null,
    provider: null,
    thumbnail: null
  };

  try {
    const urlObj = new URL(url);
    
    // Google Drive
    if (urlObj.hostname.includes('drive.google.com')) {
      const fileId = extractGoogleDriveFileId(url);
      if (fileId) {
        result.isValid = true;
        result.streamUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        result.type = 'drive';
        result.provider = 'Google Drive';
        result.thumbnail = `https://drive.google.com/thumbnail?id=${fileId}`;
      }
    }
    
    // Dropbox
    else if (urlObj.hostname.includes('dropbox.com')) {
      // Convert Dropbox share URL to direct link
      const directUrl = url.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      result.isValid = true;
      result.streamUrl = directUrl;
      result.type = 'dropbox';
      result.provider = 'Dropbox';
    }
    
    // Direct video files
    else if (url.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
      result.isValid = true;
      result.streamUrl = url;
      result.type = 'direct';
      result.provider = 'Direct Link';
    }

  } catch (error) {
    console.error('Error processing video URL:', error);
  }

  return result;
}

function extractGoogleDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/open\?id=([a-zA-Z0-9-_]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export default router;
