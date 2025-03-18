import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { YoutubeService } from '../youtube/youtube.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramService, YoutubeService],
  exports: [TelegramService],
})
export class TelegramModule {}
