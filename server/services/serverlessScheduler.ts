import { pool } from '../database';

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
      const now = new Date().toISOString();
      
      // Get all scheduled posts that are overdue
      const result = await pool.query(`
        SELECT * FROM posts 
        WHERE status = 'scheduled' 
        AND scheduled_for < $1
      `, [now]);

      const overduePosts = result.rows;
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
          await pool.query(`
            UPDATE posts 
            SET status = 'failed', 
                error_message = $1,
                updated_at = NOW()
            WHERE id = $2
          `, [error instanceof Error ? error.message : 'Unknown error', post.id]);
          
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
      await pool.query(`
        UPDATE posts 
        SET status = 'published', 
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [post.id]);

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
      const now = new Date().toISOString();
      
      // Get total scheduled posts
      const totalResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM posts 
        WHERE status = 'scheduled'
      `);

      // Get overdue posts
      const overdueResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM posts 
        WHERE status = 'scheduled' 
        AND scheduled_for < $1
      `, [now]);

      // Get next scheduled post
      const nextResult = await pool.query(`
        SELECT scheduled_for 
        FROM posts 
        WHERE status = 'scheduled' 
        ORDER BY scheduled_for ASC 
        LIMIT 1
      `);

      return {
        totalScheduled: parseInt(totalResult.rows[0].count),
        overdue: parseInt(overdueResult.rows[0].count),
        nextScheduled: nextResult.rows[0]?.scheduled_for || null
      };
    } catch (error) {
      console.error('Error getting scheduling stats:', error);
      throw error;
    }
  }
}