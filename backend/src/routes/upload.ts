import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/avatar', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: { url: fileUrl }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Upload failed' }
    });
  }
});

router.use((error: any, req: any, res: any, next: any) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: { message: 'File size too large (max 5MB)' }
    });
  }
  if (error.message === 'Only image files are allowed (jpeg, jpg, png, gif, webp)') {
    return res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
  res.status(500).json({
    success: false,
    error: { message: error.message || 'Upload failed' }
  });
});

export default router;
