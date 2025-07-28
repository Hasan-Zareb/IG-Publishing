/**
 * Reliable Scheduling Service
 * Ensures posts are published even if server restarts or goes to sleep
 * Uses database-driven approach instead of in-memory scheduling
 */

import { storage } from '../storage';
import { publishPostToFacebook } from './postService';

export class ReliableSchedulingService {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  /**
   * Initialize the reliable scheduling system
   * Uses frequent database checks instead of in-memory timers
   */
  static async initialize(): Promise<void> {
    console.log('🔄 INITIALIZING RELIABLE SCHEDULING SYSTEM...');
    
    // Process any overdue posts immediately
    await this.processOverduePosts();
    
    // Set up more frequent checks (every 30 seconds) for better reliability
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      await this.processOverduePosts();
    }, 30 * 1000); // Check every 30 seconds
    
    console.log('✅ RELIABLE SCHEDULING SYSTEM INITIALIZED - Checking every 30 seconds');
  }

  /**
   * Process overdue posts with improved reliability
   */
  private static async processOverduePosts(): Promise<void> {
    // Prevent concurrent processing
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const now = new Date();
      
      // Get posts that should have been published (with 1 minute buffer)
      const bufferTime = new Date(now.getTime() - 60000); // 1 minute ago
      const overduePosts = await storage.getOverduePosts();
      
      if (overduePosts.length > 0) {
        console.log(`🚨 FOUND ${overduePosts.length} OVERDUE POSTS - Processing immediately`);
        
        for (const post of overduePosts) {
          const scheduledTime = new Date(post.scheduledFor!);
          const delayMinutes = Math.floor((now.getTime() - scheduledTime.getTime()) / 60000);
          
          console.log(`⏰ PUBLISHING OVERDUE POST ${post.id}: "${post.content?.substring(0, 50)}..." (${delayMinutes} minutes late)`);
          
          try {
            // Publish the post
            const result = await publishPostToFacebook(post);
            
            if (result.success) {
              await storage.updatePost(post.id, {
                status: 'published',
                publishedAt: new Date()
              });
              
              await storage.createActivity({
                userId: post.userId || null,
                type: 'post_published',
                description: `Overdue post published (${delayMinutes} minutes late)`,
                metadata: { 
                  postId: post.id, 
                  wasOverdue: true,
                  delayMinutes: delayMinutes,
                  originalScheduledTime: post.scheduledFor
                }
              });
              
              console.log(`✅ OVERDUE POST ${post.id} PUBLISHED SUCCESSFULLY`);
            } else {
              await storage.updatePost(post.id, {
                status: 'failed',
                errorMessage: result.error || 'Publication failed'
              });
              
              await storage.createActivity({
                userId: post.userId || null,
                type: 'post_failed',
                description: `Overdue post failed to publish: ${result.error}`,
                metadata: { 
                  postId: post.id, 
                  wasOverdue: true,
                  error: result.error
                }
              });
              
              console.error(`❌ OVERDUE POST ${post.id} FAILED: ${result.error}`);
            }
          } catch (error) {
            console.error(`💥 ERROR PROCESSING OVERDUE POST ${post.id}:`, error);
            
            await storage.updatePost(post.id, {
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
      
      // Also check for posts that should be published in the next minute
      const upcomingTime = new Date(now.getTime() + 60000); // 1 minute from now
      const upcomingPosts = await storage.getScheduledPosts();
      const imminentPosts = upcomingPosts.filter(post => {
        const scheduledTime = new Date(post.scheduledFor!);
        return scheduledTime <= upcomingTime && scheduledTime > now;
      });
      
      if (imminentPosts.length > 0) {
        console.log(`📋 ${imminentPosts.length} posts scheduled for next minute - Ready for publication`);
      }
      
    } catch (error) {
      console.error('💥 ERROR IN RELIABLE SCHEDULING:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force check for overdue posts (called manually if needed)
   */
  static async forceCheck(): Promise<void> {
    console.log('🔍 FORCE CHECKING FOR OVERDUE POSTS...');
    await this.processOverduePosts();
  }

  /**
   * Get scheduling status for debugging
   */
  static getStatus(): { isActive: boolean; checkInterval: number; isProcessing: boolean } {
    return {
      isActive: this.checkInterval !== null,
      checkInterval: 30, // seconds
      isProcessing: this.isProcessing
    };
  }

  /**
   * Shutdown the service
   */
  static shutdown(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🛑 RELIABLE SCHEDULING SERVICE SHUTDOWN');
  }
}