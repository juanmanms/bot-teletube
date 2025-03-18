import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { AppConfig } from '../config/configuration';
import { YoutubeVideo, YoutubeService } from '../youtube/youtube.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private chatId: string;

  constructor(
    private configService: ConfigService<AppConfig>,
    private youtubeService: YoutubeService, // Inject YoutubeService
  ) {
    const token = this.configService.get('telegram.botToken', { infer: true });
    const chatId = this.configService.get('telegram.chatId', { infer: true });

    if (!token) {
      throw new Error(
        'Telegram bot token is required but was not provided in the configuration',
      );
    }

    if (!chatId) {
      throw new Error(
        'Telegram chat ID is required but was not provided in the configuration',
      );
    }

    this.chatId = chatId;
    this.bot = new TelegramBot(token, { polling: true });
  }

  onModuleInit() {
    this.logger.log('Telegram bot service initialized');
    this.initializeCommandHandlers();
  }

  private initializeCommandHandlers(): void {
    try {
      this.bot.onText(/\/help/, this.handleHelpCommand.bind(this));
      this.bot.onText(/\/latest/, this.handleLatestCommand.bind(this));
      this.bot.onText(/\/top/, this.handleTopCommand.bind(this));
      this.logger.log('Command handlers initialized');
    } catch (error) {
      this.logger.error(
        `Error initializing command handlers: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleHelpCommand(msg: TelegramBot.Message): Promise<void> {
    try {
      const chatId = msg.chat.id;
      const helpMessage =
        '🤖 <b>Available Commands</b>\n\n' +
        '/help - Show this help message\n' +
        '/latest - Show the latest video\n' +
        '/top - Show top videos\n';

      await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
      this.logger.log(`Help command processed for chat ${chatId}`);
    } catch (error) {
      this.logger.error(
        `Error handling help command: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleLatestCommand(msg: TelegramBot.Message): Promise<void> {
    try {
      const chatId = msg.chat.id;
      const latestVideos = await this.youtubeService.getLatestVideos(); // Fetch the latest videos

      if (latestVideos.length > 0) {
        const latestVideo = latestVideos[0]; // Get the first video from the list
        const message = this.createVideoMessage(latestVideo);
        await this.bot.sendPhoto(chatId, latestVideo.thumbnailUrl, {
          caption: message,
          parse_mode: 'HTML',
        });
        this.logger.log(`Latest command processed for chat ${chatId}`);
      } else {
        await this.bot.sendMessage(chatId, 'No videos found.');
        this.logger.log(`No videos found for chat ${chatId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling latest command: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleTopCommand(msg: TelegramBot.Message): Promise<void> {
    try {
      const chatId = msg.chat.id;
      // This would normally fetch top videos from a service
      await this.bot.sendMessage(
        chatId,
        '🏆 Feature coming soon: This will show the top videos.',
      );
      this.logger.log(`Top command processed for chat ${chatId}`);
    } catch (error) {
      this.logger.error(
        `Error handling top command: ${error.message}`,
        error.stack,
      );
    }
  }

  async sendNewVideoNotification(video: YoutubeVideo): Promise<void> {
    try {
      const message = this.createVideoMessage(video);

      await this.bot.sendPhoto(this.chatId, video.thumbnailUrl, {
        caption: message,
        parse_mode: 'HTML',
      });

      this.logger.log(`Notification sent for video: ${video.id}`);
    } catch (error) {
      this.logger.error(
        `Error sending video notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private createVideoMessage(video: YoutubeVideo): string {
    return (
      `🎬 <b>Nuevo video publicado</b>\n\n` +
      `<b>${video.title}</b>\n\n` +
      `${this.truncateDescription(video.description)}\n\n` +
      `🔗 <a href="${video.url}">Ver en YouTube</a>`
    );
  }

  private truncateDescription(description: string, maxLength = 200): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }
}
