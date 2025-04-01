import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AppConfig } from 'src/config/configuration';
import { YoutubeService, YoutubeVideo } from '../youtube/youtube.service';
import { TelegramService } from '../telegram/telegram.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private initialized = false;

  constructor(
    private configService: ConfigService<AppConfig>,
    private youtubeService: YoutubeService,
    private telegramService: TelegramService,
    private storageService: StorageService,
  ) {}

  @Cron('0 */55 * * * *') // Runs every 55 minutes by default
  async syncYoutubeVideos(): Promise<void> {
    try {
      const checkInterval = this.configService.get('app.checkInterval', {
        infer: true,
      });
      this.logger.log(
        `Checking for new videos (interval: ${checkInterval} minutes)`,
      );

      const latestVideos = await this.youtubeService.getLatestVideos(10);

      if (!this.initialized) {
        // First run, just store the videos without sending notifications
        for (const video of latestVideos) {
          await this.storageService.addProcessedVideo(video.id);
        }
        this.initialized = true;
        this.logger.log(
          `Initialized with ${latestVideos.length} latest videos`,
        );
        return;
      }

      // Process new videos
      const newVideos = this.filterNewVideos(latestVideos);

      if (newVideos.length > 0) {
        this.logger.log(`Found ${newVideos.length} new videos`);
        for (const video of newVideos) {
          await this.telegramService.sendNewVideoNotification(video);
          await this.storageService.addProcessedVideo(video.id);
        }
      } else {
        this.logger.debug('No new videos found');
      }
    } catch (error) {
      this.logger.error(`Error syncing videos: ${error.message}`, error.stack);
    }
  }

  private filterNewVideos(videos: YoutubeVideo[]): YoutubeVideo[] {
    return videos.filter(
      (video) => !this.storageService.isVideoProcessed(video.id),
    );
  }
}
