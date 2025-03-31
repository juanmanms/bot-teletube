import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: Joi.object({
        YOUTUBE_API_KEY: Joi.string().required(),
        YOUTUBE_CHANNEL_ID: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
        TELEGRAM_CHAT_ID: Joi.string().required(),
        CHECK_INTERVAL: Joi.number().default(5),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
})
export class ConfigModule {}
