// Note: node-schedule removed for serverless compatibility
import { storage } from '../storage';
import { Post, posts } from '@shared/schema';
import { InstagramService } from './instagramService';
import { db } from '../db';
import { and, eq } from 'drizzle-orm';

// Note: Scheduling removed for serverless compatibility
// const activeInstagramJobs: Record<number, schedule.Job> = {};

/**
 * Publish a post to Instagram
 */
export async function publishPostToInstagram(post: Post): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!post.instagramAccountId) {
      return { success: false, error: 'No Instagram account selected' };
    }
    
    if (!post.mediaUrl) {
      return { success: false, error: 'Instagram posts require media (photo/video/reel)' };
    }
    
    // Get Instagram account
    const account = await storage.getInstagramAccount(post.instagramAccountId);
    if (!account) {
      return { success: false, error: 'Instagram account not found' };
    }
    
    // Validate token
    const isValid = await InstagramService.validateToken(account.instagramUserId, account.accessToken);
    if (!isValid) {
      return { 
        success: false, 
        error: 'Instagram access token is invalid or expired. Please reconnect your account.' 
      };
    }
    
    // Check daily limit
    const limitCheck = await InstagramService.checkDailyLimit(account.id, post.userId!);
    if (!limitCheck.canPost) {
      return {
        success: false,
        error: `Daily post limit reached (${limitCheck.postsToday}/${limitCheck.limit}). Instagram API allows 25 posts per 24 hours per account.`
      };
    }
    
    console.log(`Publishing post ${post.id} to Instagram: @${account.username}`);
    
    // Determine media type
    const mediaType = post.mediaType === 'reel' ? 'reel' : 
                     post.mediaType === 'video' ? 'video' : 'photo';
    
    // Publish to Instagram
    const result = await InstagramService.publishPost(
      account.instagramUserId,
      account.accessToken,
      post.mediaUrl,
      post.content,
      mediaType,
      post.labels || []
    );
    
    if (result.success) {
      // Increment post count
      await InstagramService.incrementPostCount(account.id);
      
      // Log activity
      await storage.createActivity({
        userId: post.userId || null,
        type: 'instagram_post_published',
        description: `Post published to Instagram: @${account.username}`,
        metadata: { 
          postId: post.id,
          instagramPostId: result.postId,
          accountId: account.id
        }
      });
      
      console.log(`Successfully published post ${post.id} to Instagram. IG Post ID: ${result.postId}`);
      
      return { 
        success: true, 
        data: { 
          instagramPostId: result.postId,
          accountId: account.id,
          username: account.username
        }
      };
    } else {
      console.error(`Failed to publish post ${post.id} to Instagram:`, result.error);
      return { 
        success: false, 
        error: result.error || 'Unknown Instagram publishing error'
      };
    }
    
  } catch (error) {
    console.error('Error publishing to Instagram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Schedule an Instagram post for future publication
 */
export function scheduleInstagramPost(post: Post): void {
  console.log(`🔍 INSTAGRAM SCHEDULE: Attempting to schedule post ${post.id}`);
  
  if (!post.scheduledFor || post.status !== 'scheduled') {
    console.warn(`❌ Instagram post ${post.id} is not scheduled or has no scheduled date`);
    return;
  }
  
  // Cancel any existing job for this post
  // Note: activeInstagramJobs not available in serverless environment
  // if (activeInstagramJobs[post.id]) {
  //   console.log(`🔄 Canceling existing Instagram job for post ${post.id}`);
  //   activeInstagramJobs[post.id].cancel();
  //   delete activeInstagramJobs[post.id];
  // }
  
  const scheduledTime = new Date(post.scheduledFor);
  const now = new Date();
  
  if (scheduledTime <= now) {
    console.warn(`❌ Instagram post ${post.id} scheduled time is in the past`);
    return;
  }
  
  // Schedule new job
  console.log(`✅ INSTAGRAM SCHEDULING: Creating job for post ${post.id} at ${scheduledTime.toISOString()}`);
  // Note: Scheduling removed for serverless compatibility
  // activeInstagramJobs[post.id] = schedule.scheduleJob(scheduledTime, async () => {
  console.log(`ℹ️  Serverless mode: Instagram post will be checked via /api/scheduler/check endpoint`);
  // Simulate the scheduling logic without actual scheduling
  const scheduledFunction = async () => {
    try {
      console.log(`🚀 EXECUTING SCHEDULED INSTAGRAM POST: ${post.id}`);
      
      // Atomic update to prevent race conditions
      const [updatedPost] = await db
        .update(posts)
        .set({ status: 'publishing' })
        .where(and(eq(posts.id, post.id), eq(posts.status, 'scheduled')))
        .returning();
      
      if (!updatedPost) {
        console.log(`⚡ RACE CONDITION PREVENTED: Instagram post ${post.id} already processing`);
        return;
      }
      
      // Publish to Instagram
      const result = await publishPostToInstagram(updatedPost);
      
      if (result.success) {
        await storage.updatePost(post.id, {
          status: 'published',
          publishedAt: new Date(),
          instagramPostId: result.data?.instagramPostId
        });
        
        console.log(`Successfully published scheduled Instagram post ${post.id}`);
      } else {
        await storage.updatePost(post.id, {
          status: 'failed',
          errorMessage: result.error || 'Unknown error during scheduled publication'
        });
        
        console.error(`Failed to publish scheduled Instagram post ${post.id}:`, result.error);
      }
    } catch (error) {
      console.error(`Error executing scheduled Instagram post ${post.id}:`, error);
      
      try {
        await storage.updatePost(post.id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (updateError) {
        console.error(`Error updating Instagram post ${post.id} status:`, updateError);
      }
    } finally {
  // Note: Job cleanup removed for serverless compatibility
  // Note: activeInstagramJobs not available in serverless environment
      console.log(`🧹 CLEANUP: Completed processing for Instagram post ${post.id}`);
    }
  };
  
  // Note: In serverless mode, we don't actually schedule the job
  // The function is defined but not executed until triggered externally
  console.log(`ℹ️  Scheduled function defined for Instagram post ${post.id}, will be executed via external trigger`);
  
  console.log(`✅ INSTAGRAM SCHEDULE SUCCESS: Post ${post.id} scheduled`);
}

/**
 * Initialize scheduling for all scheduled Instagram posts
 */
export async function initializeScheduledInstagramPosts(): Promise<void> {
  try {
    console.log('Initializing scheduled Instagram posts system...');
    
    const scheduledPosts = await storage.getScheduledPosts();
    const instagramPosts = scheduledPosts.filter(post => post.platform === 'instagram');
    
    let scheduledCount = 0;
    for (const post of instagramPosts) {
      scheduleInstagramPost(post);
      scheduledCount++;
    }
    
    console.log(`Initialized ${scheduledCount} scheduled Instagram posts`);
  } catch (error) {
    console.error('Error initializing scheduled Instagram posts:', error);
  }
}

/**
 * Cancel a scheduled Instagram post
 */
export async function cancelScheduledInstagramPost(postId: number): Promise<boolean> {
  try {
    // Note: activeInstagramJobs not available in serverless environment
    // if (activeInstagramJobs[postId]) {
    //   activeInstagramJobs[postId].cancel();
    //   delete activeInstagramJobs[postId];
    //   console.log(`Cancelled scheduled Instagram post ${postId}`);
    //   return true;
    // }
    console.log(`ℹ️  Serverless mode: No active job to cancel for Instagram post ${postId}`);
    return false;
  } catch (error) {
    console.error(`Error cancelling scheduled Instagram post ${postId}:`, error);
    return false;
  }
}

