import { db } from '../database';
import { posts } from '../shared/schema';
import { eq, and, lt } from 'drizzle-orm';

// Serverless-compatible scheduler that doesn't rely on persistent background jobs
export class ServerlessScheduler {
  private static instance: ServerlessScheduler;
  
  public static getInstance(): ServerlessScheduler {
    if (!ServerlessScheduler.instance) {
      ServerlessScheduler.instance = new ServerlessScheduler();
    }
    return ServerlessScheduler.instance;
  }

  // Check for overdue posts and publish them
  async checkAndPublishOverduePosts(): Promise<{ published: number; failed: number }> {
    try {
      const now = new Date();
      
      // Get all scheduled posts that are overdue
      const overduePosts = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.status, 'scheduled'),
            lt(posts.scheduledFor, now)
          )
        );

      let published = 0;
      let failed = 0;

      for (const post of overduePosts) {
        try {
          // Attempt to publish the post
          await this.publishPost(post);
          published++;
        } catch (error) {
          console.error(`Failed to publish post ${post.id}:`, error);
          
          // Mark post as failed
          await db
            .update(posts)
            .set({
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            })
            .where(eq(posts.id, post.id));
          
          failed++;
        }
      }

      return { published, failed };
    } catch (error) {
      console.error('Error checking overdue posts:', error);
      throw error;
    }
  }

  // Publish a single post
  private async publishPost(post: any): Promise<void> {
    try {
      // Import the appropriate service based on platform
      if (post.platform === 'instagram') {
        const { publishPostToInstagram } = await import('./instagramPostService');
        const result = await publishPostToInstagram(post);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to publish to Instagram');
        }
      } else {
        // Default to Facebook
        const { publishPostToFacebook } = await import('./postService');
        const result = await publishPostToFacebook(post);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to publish to Facebook');
        }
      }

      // Update post status
      await db
        .update(posts)
        .set({
          status: 'published',
          publishedAt: new Date()
        })
        .where(eq(posts.id, post.id));

    } catch (error) {
      console.error(`Error publishing post ${post.id}:`, error);
      throw error;
    }
  }

  // Get statistics about scheduled posts
  async getSchedulingStats(): Promise<{
    totalScheduled: number;
    overdue: number;
    nextScheduled: Date | null;
  }> {
    try {
      const now = new Date();
      
      // Get total scheduled posts
      const totalScheduled = await db
        .select({ count: posts.id })
        .from(posts)
        .where(eq(posts.status, 'scheduled'));

      // Get overdue posts
      const overdue = await db
        .select({ count: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.status, 'scheduled'),
            lt(posts.scheduledFor, now)
          )
        );

      // Get next scheduled post
      const nextScheduled = await db
        .select({ scheduledFor: posts.scheduledFor })
        .from(posts)
        .where(eq(posts.status, 'scheduled'))
        .orderBy(posts.scheduledFor)
        .limit(1);

      return {
        totalScheduled: totalScheduled.length,
        overdue: overdue.length,
        nextScheduled: nextScheduled[0]?.scheduledFor || null
      };
    } catch (error) {
      console.error('Error getting scheduling stats:', error);
      throw error;
    }
  }
}
