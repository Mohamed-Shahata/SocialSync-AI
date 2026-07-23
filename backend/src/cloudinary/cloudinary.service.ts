import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import 'multer';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadFile(
    file: Express.Multer.File,
    folder = 'posts',
  ): Promise<UploadApiResponse> {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder },
        (error, result) => {
          if (error || !result) {
            return reject(
              error instanceof Error
                ? error
                : new Error(error?.message ?? 'Cloudinary upload failed'),
            );
          }
          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const results = await Promise.all(files.map((f) => this.uploadFile(f)));
    return results.map((r) => r.secure_url);
  }
}
