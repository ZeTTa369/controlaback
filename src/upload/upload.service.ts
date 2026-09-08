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
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:eco', fetch_format: 'auto' }
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

  async uploadMultipleImages(
    files: Express.Multer.File[], 
    folder: string = 'departamentos'
  ): Promise<{ url: string; id_publico: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos para subir');
    }

    // Validar formato de cada imagen recibida
    for (const file of files) {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        throw new BadRequestException(`El archivo ${file.originalname} no es una imagen válida (JPG, PNG, WEBP)`);
      }
    }

    const uploadPromises = files.map(file => 
      new Promise<{ url: string; id_publico: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `residencial/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, crop: 'limit', quality: 'auto:eco', fetch_format: 'auto' }
            ],
          },
          (error, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              id_publico: result.public_id,
            });
          },
        );

        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      })
    );

    return Promise.all(uploadPromises);
  }
}