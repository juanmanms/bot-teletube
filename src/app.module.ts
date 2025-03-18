import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YoutubeModule } from './youtube/youtube.module';
import { TelegramModule } from './telegram/telegram.module';
import { SyncModule } from './sync/sync.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { StorageService } from './storage/storage.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    YoutubeModule,
    TelegramModule,
    SyncModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, StorageService],
})
export class AppModule {}
