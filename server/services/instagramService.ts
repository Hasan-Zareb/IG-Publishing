import fetch from 'node-fetch';
import { storage } from '../storage';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { existsSync } from 'fs';

interface InstagramAccountInfo {
  id: string;
  username: string;
}

interface InstagramMediaContainer {
  id: string;
}

interface InstagramPublishResult {
  id: string;
}

/**
 * Instagram Graph API Service
 * Handles posting to Instagram Business Accounts
 */
export class InstagramService {
  
  /**
   * Get Instagram Business Account ID from Facebook Page
   */
  static async getInstagramBusinessAccount(
    pageId: string,
    pageAccessToken: string
  ): Promise<{ success: boolean; accountId?: string; username?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || 'Failed to get Instagram account'
        };
      }
      
      if (!data.instagram_business_account) {
        return {
          success: false,
          error: 'No Instagram Business account connected to this Facebook Page'
        };
      }
      
      const igAccountId = data.instagram_business_account.id;
      
      // Get username
      const accountUrl = `https://graph.facebook.com/v18.0/${igAccountId}?fields=username&access_token=${pageAccessToken}`;
      const accountResponse = await fetch(accountUrl);
      const accountData = await accountResponse.json() as any;
      
      return {
        success: true,
        accountId: igAccountId,
        username: accountData.username || 'unknown'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create media container for Instagram post (Step 1)
   */
  static async createMediaContainer(
    instagramAccountId: string,
    accessToken: string,
    mediaUrl: string,
    caption?: string,
    mediaType: 'photo' | 'video' | 'reel' = 'photo',
    customLabels?: string[]
  ): Promise<{ success: boolean; containerId?: string; error?: string }> {
    try {
      const endpoint = `https://graph.facebook.com/v18.0/${instagramAccountId}/media`;
      
      const params = new URLSearchParams();
      
      // Add media based on type
      if (mediaType === 'photo') {
        params.append('image_url', mediaUrl);
      } else if (mediaType === 'reel') {
        params.append('media_type', 'REELS');
        params.append('video_url', mediaUrl);
        params.append('share_to_feed', 'true'); // Also share Reel to main feed
      } else {
        params.append('media_type', 'VIDEO');
        params.append('video_url', mediaUrl);
      }
      
      if (caption) {
        params.append('caption', caption);
      }
      
      params.append('access_token', accessToken);
      
      console.log(`Creating ${mediaType} container for Instagram:`, { instagramAccountId, mediaType, caption });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      const data = await response.json() as any;
      
      if (!response.ok || data.error) {
        console.error('Instagram media container creation error:', data.error);
        return {
          success: false,
          error: data.error?.message || `API error: ${response.status}`
        };
      }
      
      console.log('Instagram media container created:', data.id);
      
      return {
        success: true,
        containerId: data.id
      };
      
    } catch (error) {
      console.error('Error creating Instagram media container:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publish media container to Instagram (Step 2)
   */
  static async publishMediaContainer(
    instagramAccountId: string,
    accessToken: string,
    containerId: string
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const endpoint = `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`;
      
      const params = new URLSearchParams();
      params.append('creation_id', containerId);
      params.append('access_token', accessToken);
      
      console.log('Publishing Instagram media container:', containerId);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      const data = await response.json() as any;
      
      if (!response.ok || data.error) {
        console.error('Instagram publish error:', data.error);
        return {
          success: false,
          error: data.error?.message || `Publish failed: ${response.status}`
        };
      }
      
      console.log('Successfully published to Instagram:', data.id);
      
      return {
        success: true,
        postId: data.id
      };
      
    } catch (error) {
      console.error('Error publishing to Instagram:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publish post to Instagram (combines create + publish)
   */
  static async publishPost(
    instagramAccountId: string,
    accessToken: string,
    mediaUrl: string,
    caption?: string,
    mediaType: 'photo' | 'video' | 'reel' = 'photo',
    customLabels?: string[]
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Step 1: Create media container
      const containerResult = await this.createMediaContainer(
        instagramAccountId,
        accessToken,
        mediaUrl,
        caption,
        mediaType,
        customLabels
      );
      
      if (!containerResult.success || !containerResult.containerId) {
        return {
          success: false,
          error: containerResult.error || 'Failed to create media container'
        };
      }
      
      // Step 2: Check container status (required for videos)
      if (mediaType === 'video' || mediaType === 'reel') {
        await this.waitForMediaProcessing(containerResult.containerId, accessToken);
      }
      
      // Step 3: Publish container
      const publishResult = await this.publishMediaContainer(
        instagramAccountId,
        accessToken,
        containerResult.containerId
      );
      
      return publishResult;
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Wait for Instagram to process video before publishing
   */
  static async waitForMediaProcessing(
    containerId: string,
    accessToken: string,
    maxAttempts: number = 30
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const url = `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.status_code === 'FINISHED') {
        console.log('Instagram media processing finished');
        return;
      }
      
      if (data.status_code === 'ERROR') {
        throw new Error('Instagram media processing failed');
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Instagram media processing timeout');
  }

  /**
   * Validate Instagram access token
   */
  static async validateToken(
    instagramAccountId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id&access_token=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json() as any;
      
      return response.ok && !data.error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Instagram account info
   */
  static async getAccountInfo(
    instagramAccountId: string,
    accessToken: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || 'Failed to get account info'
        };
      }
      
      return {
        success: true,
        data
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check daily post limit (Instagram API limit: 25 posts/24 hours)
   */
  static async checkDailyLimit(
    instagramAccountId: number,
    userId: number
  ): Promise<{ canPost: boolean; postsToday: number; limit: number }> {
    try {
      const account = await storage.getInstagramAccount(instagramAccountId);
      
      if (!account) {
        return { canPost: false, postsToday: 0, limit: 25 };
      }
      
      // Check if last post date is today
      const today = new Date().toDateString();
      const lastPostDate = account.lastPostDate ? new Date(account.lastPostDate).toDateString() : null;
      
      if (lastPostDate !== today) {
        // Reset count for new day
        await storage.updateInstagramAccount(instagramAccountId, {
          dailyPostCount: 0,
          lastPostDate: new Date()
        });
        return { canPost: true, postsToday: 0, limit: 25 };
      }
      
      const postsToday = account.dailyPostCount || 0;
      const canPost = postsToday < 25;
      
      return { canPost, postsToday, limit: 25 };
      
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return { canPost: false, postsToday: 0, limit: 25 };
    }
  }

  /**
   * Increment daily post count
   */
  static async incrementPostCount(instagramAccountId: number): Promise<void> {
    try {
      const account = await storage.getInstagramAccount(instagramAccountId);
      
      if (!account) return;
      
      await storage.updateInstagramAccount(instagramAccountId, {
        dailyPostCount: (account.dailyPostCount || 0) + 1,
        lastPostDate: new Date()
      });
      
    } catch (error) {
      console.error('Error incrementing post count:', error);
    }
  }
}

