import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request, Response, NextFunction } from "express";
import { createCustomError } from '@/errors/customAPIError';
import { StatusCode } from '@/constants/constants';
import { configDotenv } from 'dotenv';

configDotenv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'services', // folder name in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg'], // allowed formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional transformations
  }
});

// Create multer upload middleware
export const uploadIcon = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
}).single('icon'); 

export const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    if (!imageUrl || imageUrl === "http") return;
    
    // Extract public_id from Cloudinary URL
    const publicId = imageUrl
      .split('/')
      .slice(-1)[0]
      .split('.')[0];
      
    if (publicId) {
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};



export const handleMulterError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(createCustomError('File size is too large. Max size is 2MB', StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    if (error) {
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    next();
  };

  const userDocumentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'user_documents', // folder name in cloudinary for user documents
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'], // allowed formats for user documents
      resource_type: 'auto', // allows for non-image file types
    }
  });
  
  // Create multer upload middleware for user documents
  export const uploadUserDocument = multer({
    storage: userDocumentStorage,
    limits: {
      fileSize: 1024 * 1024 * 10 // 10MB limit for user documents
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Allowed types: JPG, PNG, PDF, DOC, DOCX'));
      }
    }
  }).single('document'); 
  
  export const deleteCloudinaryUserDocument = async (documentUrl: string) => {
    try {
      if (!documentUrl || documentUrl === "http") return;
      
      // Extract public_id from Cloudinary URL
      const publicId = documentUrl
        .split('/')
        .slice(-1)[0]
        .split('.')[0];
        
      if (publicId) {
        await cloudinary.uploader.destroy(`user_documents/${publicId}`);
      }
    } catch (error) {
      console.error('Error deleting document from Cloudinary:', error);
    }
  };
  
  export const handleUserDocumentUploadError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(createCustomError('File size is too large. Max size is 10MB', StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    if (error) {
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    next();
  };
  
  // Middleware to handle the file upload and add the URL to the request body
  export const processUserDocumentUpload = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadUserDocument(req, res, (error) => {
      if (error) {
        return handleUserDocumentUploadError(error, req, res, next);
      }
      
      if (req.file) {
        // Add the Cloudinary URL to the request body
        req.body.documentUrl = req.file.path;
      }
      
      next();
    });
  };

  const courseThumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'course_thumbnails',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 1280, height: 720, crop: 'limit' }]
    }
  });
  
  const courseVideoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'course_videos',
      allowed_formats: ['mp4', 'mov', 'avi'],
      resource_type: 'video'
    }
  });

  export const uploadCourseThumbnail = multer({
    storage: courseThumbnailStorage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image! Please upload an image for the course thumbnail.'));
      }
    }
  }).single('thumbnail');

  export const uploadCourseVideo = multer({
    storage: courseVideoStorage,
    limits: {
      fileSize: 1024 * 1024 * 500 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Not a video! Please upload a video file.'));
      }
    }
  }).single('video');

  export const deleteCourseThumbnail = async (thumbnailUrl: string) => {
    try {
      if (!thumbnailUrl) return;
      
      const publicId = thumbnailUrl
        .split('/')
        .slice(-1)[0]
        .split('.')[0];
        
      if (publicId) {
        await cloudinary.uploader.destroy(`course_thumbnails/${publicId}`);
      }
    } catch (error) {
      console.error('Error deleting course thumbnail from Cloudinary:', error);
    }
  };

  export const deleteCourseVideo = async (videoUrl: string) => {
    try {
      if (!videoUrl) return;
      
      const publicId = videoUrl
        .split('/')
        .slice(-1)[0]
        .split('.')[0];
        
      if (publicId) {
        await cloudinary.uploader.destroy(`course_videos/${publicId}`, { resource_type: 'video' });
      }
    } catch (error) {
      console.error('Error deleting course video from Cloudinary:', error);
    }
  };

  export const processCourseThumbnailUpload = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadCourseThumbnail(req, res, (error) => {
      if (error) {
        return handleMulterError(error, req, res, next);
      }
      
      if (req.file) {
        req.body.thumbnailUrl = req.file.path;
      }
      
      next();
    });
  };

  export const processCourseVideoUpload = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    uploadCourseVideo(req, res, (error) => {
      if (error) {
        return handleMulterError(error, req, res, next);
      }
      
      if (req.file) {
        req.body.videoUrl = req.file.path;
      }
      
      next();
    });
  };