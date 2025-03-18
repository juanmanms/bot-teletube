/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { AppConfig } from 'src/config/configuration';

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private youtube: youtube_v3.Youtube;

  constructor(private configService: ConfigService<AppConfig>) {
    const apiKey = this.configService.get('youtube.apiKey', { infer: true });
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async getLatestVideos(maxResults = 10): Promise<YoutubeVideo[]> {
    try {
      const channelId = this.configService.get('youtube.channelId', {
        infer: true,
      });

      const response = await this.youtube.search.list({
        part: ['snippet'],
        channelId,
        maxResults,
        order: 'date',
        type: ['video'],
      });

      return (response.data.items || []).map((item) => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
        publishedAt: item.snippet?.publishedAt || '',
        url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      }));
    } catch (error) {
      this.logger.error(`Error fetching videos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getVideoDetails(videoId: string): Promise<YoutubeVideo | null> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
      });

      if (!response.data.items?.length) {
        return null;
      }

      const video = response.data.items[0];
      return {
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
        publishedAt: video.snippet?.publishedAt || '',
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching video details: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTopVideos(maxResults = 5): Promise<YoutubeVideo[]> {
    try {
      const channelId = this.configService.get('youtube.channelId', {
        infer: true,
      });

      const response = await this.youtube.search.list({
        part: ['snippet'],
        channelId,
        maxResults,
        order: 'viewCount',
        type: ['video'],
      });

      return (response.data.items || []).map((item) => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
        publishedAt: item.snippet?.publishedAt || '',
        url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      }));
    } catch (error) {
      this.logger.error(`Error fetching videos: ${error.message}`, error.stack);
      throw error;
    }
  }
}
