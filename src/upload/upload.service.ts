import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string = 'edificios'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validar tipo de archivo
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      throw new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `residencial/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }
}