export default () => ({
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  app: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL || '5', 10),
  },
});

export interface AppConfig {
  youtube: {
    apiKey: string;
    channelId: string;
  };
  telegram: {
    botToken: string;
    chatId: string;
  };
  app: {
    checkInterval: number;
  };
}
