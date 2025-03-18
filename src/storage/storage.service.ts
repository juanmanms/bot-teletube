import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly storagePath = path.join(process.cwd(), 'data');
  private readonly storageFile = path.join(
    this.storagePath,
    'processed_videos.json',
  );
  private processedVideos: Set<string> = new Set();

  async onModuleInit() {
    await this.loadProcessedVideos();
  }

  /**
   * Carga los IDs de videos procesados desde el archivo JSON
   */
  private async loadProcessedVideos(): Promise<void> {
    try {
      // Crear directorio si no existe
      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
        this.logger.log(`Directorio de datos creado en: ${this.storagePath}`);
      }

      // Crear archivo si no existe
      if (!fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([]));
        this.logger.log(
          `Archivo de videos procesados creado en: ${this.storageFile}`,
        );
        return;
      }

      // Leer archivo existente
      const data = fs.readFileSync(this.storageFile, 'utf8');
      const videoIds = JSON.parse(data) as string[];

      // Cargar IDs en el Set
      videoIds.forEach((id) => this.processedVideos.add(id));
      this.logger.log(
        `Cargados ${this.processedVideos.size} videos procesados`,
      );
    } catch (error) {
      this.logger.error(
        `Error al cargar videos procesados: ${error.message}`,
        error.stack,
      );
      // Inicializar como set vacío en caso de error
      this.processedVideos = new Set();
    }
  }

  /**
   * Guarda los IDs de videos procesados en el archivo JSON
   */
  private async saveProcessedVideos(): Promise<void> {
    try {
      const videoIds = Array.from(this.processedVideos);
      fs.writeFileSync(this.storageFile, JSON.stringify(videoIds, null, 2));
      this.logger.debug(`Guardados ${videoIds.length} videos procesados`);
    } catch (error) {
      this.logger.error(
        `Error al guardar videos procesados: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Verifica si un video ya ha sido procesado
   * @param videoId ID del video a verificar
   * @returns true si el video ya fue procesado, false en caso contrario
   */
  isVideoProcessed(videoId: string): boolean {
    return this.processedVideos.has(videoId);
  }

  /**
   * Añade un video a la lista de videos procesados
   * @param videoId ID del video a añadir
   */
  async addProcessedVideo(videoId: string): Promise<void> {
    this.processedVideos.add(videoId);
    await this.saveProcessedVideos();
  }

  /**
   * Obtiene todos los IDs de videos procesados
   * @returns Array de IDs de videos procesados
   */
  getProcessedVideos(): string[] {
    return Array.from(this.processedVideos);
  }
}
