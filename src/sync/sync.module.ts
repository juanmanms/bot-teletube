import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { YoutubeModule } from '../youtube/youtube.module';
import { TelegramModule } from '../telegram/telegram.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [YoutubeModule, TelegramModule, StorageModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
