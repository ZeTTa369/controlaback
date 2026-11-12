import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  // Subida de una sola imagen (Edificios)
  async uploadImage(file: Express.Multer.File, folder: string = 'edificios'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      throw new BadRequestException('Solo se permiten imágenes (JPG, PNG, WEBP)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `residencial/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:eco', fetch_format: 'auto' },
          ],
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

  // Subida de multiples imagenes (Departamentos)
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'departamentos',
  ): Promise<{ url: string; id_publico: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos para subir');
    }

    for (const file of files) {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        throw new BadRequestException(`El archivo ${file.originalname} no es una imagen válida (JPG, PNG, WEBP)`);
      }
    }

    const uploadPromises = files.map(
      (file) =>
        new Promise<{ url: string; id_publico: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `residencial/${folder}`,
              resource_type: 'image',
              transformation: [
                { width: 1200, crop: 'limit', quality: 'auto:eco', fetch_format: 'auto' },
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
        }),
    );

    return Promise.all(uploadPromises);
  }

  // Subida de multiples documentos mixtos: PDF e Imagenes (Contratos / Respaldos)
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'contratos',
  ): Promise<{ url: string; id_publico: string; originalName: string; mimetype: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos para subir');
    }

    // Validar que cada archivo sea PDF o imagen permitida
    for (const file of files) {
      if (!file.mimetype.match(/^(application\/pdf|image\/(jpg|jpeg|png|webp))$/)) {
        throw new BadRequestException(
          `El archivo ${file.originalname} no tiene un formato válido (Solo PDF, JPG, PNG o WEBP)`,
        );
      }
    }

    const uploadPromises = files.map(
      (file) =>
        new Promise<{ url: string; id_publico: string; originalName: string; mimetype: string }>(
          (resolve, reject) => {
            const esPdf = file.mimetype === 'application/pdf';

            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `residencial/${folder}`,
                resource_type: 'auto',
                // Solo aplicar compresion/redimensionamiento si es imagen; los PDF se suben intactos
                ...(!esPdf && {
                  transformation: [
                    { width: 1400, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
                  ],
                }),
              },
              (error, result: UploadApiResponse) => {
                if (error) return reject(error);
                resolve({
                  url: result.secure_url,
                  id_publico: result.public_id,
                  originalName: file.originalname,
                  mimetype: file.mimetype,
                });
              },
            );

            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
          },
        ),
    );

    return Promise.all(uploadPromises);
  }
}