import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { InstagramService } from '../services/instagramService';
import multer from 'multer';
import { z } from 'zod';

const router = Router();

// Configure multer for CSV/Excel uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Helper function to get authenticated user (same as main routes)
const authenticateUser = async (req: Request) => {
  return { id: 3 }; // Default user ID for now
};

/**
 * GET /api/instagram/accounts
 * Get all Instagram accounts for the current user
 */
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const accounts = await storage.getInstagramAccounts(user.id);
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching Instagram accounts:', error);
    res.status(500).json({ message: 'Failed to fetch Instagram accounts' });
  }
});

/**
 * POST /api/instagram/accounts/connect
 * Connect an Instagram Business Account
 */
router.post('/accounts/connect', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { pageId, pageAccessToken } = req.body;
    
    if (!pageId || !pageAccessToken) {
      return res.status(400).json({ 
        message: 'Facebook Page ID and access token are required' 
      });
    }
    
    // Get Instagram Business Account from Facebook Page
    const igAccountResult = await InstagramService.getInstagramBusinessAccount(
      pageId,
      pageAccessToken
    );
    
    if (!igAccountResult.success) {
      return res.status(400).json({ 
        message: igAccountResult.error || 'Failed to get Instagram account' 
      });
    }
    
    // Check if account already exists
    const existingAccount = await storage.getInstagramAccountByUserId(igAccountResult.accountId!);
    
    if (existingAccount) {
      // Update existing account
      await storage.updateInstagramAccount(existingAccount.id, {
        accessToken: pageAccessToken,
        username: igAccountResult.username,
        isActive: true
      });
      
      return res.json({ 
        message: 'Instagram account updated',
        account: existingAccount 
      });
    }
    
    // Create new account
    const newAccount = await storage.createInstagramAccount({
      userId: user.id,
      username: igAccountResult.username!,
      instagramUserId: igAccountResult.accountId!,
      accessToken: pageAccessToken,
      isActive: true
    });
    
    // Log activity
    await storage.createActivity({
      userId: user.id,
      type: 'instagram_account_connected',
      description: `Connected Instagram account: @${igAccountResult.username}`,
      metadata: { accountId: newAccount.id, username: igAccountResult.username }
    });
    
    res.status(201).json({ 
      message: 'Instagram account connected successfully',
      account: newAccount 
    });
    
  } catch (error) {
    console.error('Error connecting Instagram account:', error);
    res.status(500).json({ message: 'Failed to connect Instagram account' });
  }
});

/**
 * GET /api/instagram/posts
 * Get all Instagram posts for the current user
 */
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const allPosts = await storage.getPosts(user.id);
    const instagramPosts = allPosts.filter(post => post.platform === 'instagram');
    
    res.json(instagramPosts);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ message: 'Failed to fetch Instagram posts' });
  }
});

/**
 * POST /api/instagram/posts
 * Create and publish/schedule an Instagram post
 */
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { 
      content, 
      mediaUrl, 
      mediaType, 
      instagramAccountId,
      scheduledFor,
      labels,
      language,
      status
    } = req.body;
    
    // Validation
    if (!instagramAccountId) {
      return res.status(400).json({ message: 'Instagram account is required' });
    }
    
    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required for Instagram posts' });
    }
    
    const account = await storage.getInstagramAccount(parseInt(instagramAccountId));
    if (!account) {
      return res.status(404).json({ message: 'Instagram account not found' });
    }
    
    // Check daily limit
    const limitCheck = await InstagramService.checkDailyLimit(account.id, user.id);
    if (!limitCheck.canPost) {
      return res.status(429).json({ 
        message: `Daily post limit reached (${limitCheck.postsToday}/${limitCheck.limit}). Instagram API allows 25 posts per 24 hours per account.`,
        postsToday: limitCheck.postsToday,
        limit: limitCheck.limit
      });
    }
    
    // Handle immediate publish
    if (status === 'immediate') {
      const publishResult = await InstagramService.publishPost(
        account.instagramUserId,
        account.accessToken,
        mediaUrl,
        content,
        mediaType === 'reel' ? 'reel' : mediaType === 'video' ? 'video' : 'photo',
        labels
      );
      
      if (publishResult.success) {
        // Increment post count
        await InstagramService.incrementPostCount(account.id);
        
        // Create post record
        const post = await storage.createPost({
          userId: user.id,
          platform: 'instagram',
          instagramAccountId: account.id,
          content,
          mediaUrl,
          mediaType: mediaType || 'photo',
          labels: labels || [],
          language: language || 'en',
          status: 'published',
          publishedAt: new Date(),
          instagramPostId: publishResult.postId
        } as any);
        
        // Log activity
        await storage.createActivity({
          userId: user.id,
          type: 'instagram_post_published',
          description: `Published to Instagram: @${account.username}`,
          metadata: { postId: post.id, instagramPostId: publishResult.postId }
        });
        
        return res.status(201).json(post);
      } else {
        // Create failed post record
        const post = await storage.createPost({
          userId: user.id,
          platform: 'instagram',
          instagramAccountId: account.id,
          content,
          mediaUrl,
          mediaType: mediaType || 'photo',
          labels: labels || [],
          language: language || 'en',
          status: 'failed',
          errorMessage: publishResult.error
        } as any);
        
        return res.status(500).json({ 
          message: 'Failed to publish to Instagram',
          error: publishResult.error,
          post 
        });
      }
    }
    
    // Handle scheduled post
    if (status === 'scheduled' && scheduledFor) {
      const { parseISTDateToUTC } = await import('../utils/timezoneUtils');
      const scheduledForUTC = parseISTDateToUTC(scheduledFor, 'Instagram scheduled post');
      
      const post = await storage.createPost({
        userId: user.id,
        platform: 'instagram',
        instagramAccountId: account.id,
        content,
        mediaUrl,
        mediaType: mediaType || 'photo',
        labels: labels || [],
        language: language || 'en',
        status: 'scheduled',
        scheduledFor: scheduledForUTC
      } as any);
      
      // Schedule the post (will need to create Instagram-specific scheduling)
      const { scheduleInstagramPost } = await import('../services/instagramPostService');
      scheduleInstagramPost(post);
      
      // Log activity
      await storage.createActivity({
        userId: user.id,
        type: 'instagram_post_scheduled',
        description: `Scheduled Instagram post for ${scheduledFor}`,
        metadata: { postId: post.id }
      });
      
      return res.status(201).json(post);
    }
    
    // Handle draft
    const post = await storage.createPost({
      userId: user.id,
      platform: 'instagram',
      instagramAccountId: account.id,
      content,
      mediaUrl,
      mediaType: mediaType || 'photo',
      labels: labels || [],
      language: language || 'en',
      status: 'draft'
    } as any);
    
    res.status(201).json(post);
    
  } catch (error) {
    console.error('Error creating Instagram post:', error);
    res.status(500).json({ message: 'Failed to create Instagram post' });
  }
});

/**
 * GET /api/instagram/stats
 * Get Instagram posting statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const allPosts = await storage.getPosts(user.id);
    const instagramPosts = allPosts.filter(p => p.platform === 'instagram');
    const accounts = await storage.getInstagramAccounts(user.id);
    
    const scheduled = instagramPosts.filter(p => p.status === 'scheduled').length;
    const publishedToday = instagramPosts.filter(p => 
      p.status === 'published' && 
      p.publishedAt && 
      new Date(p.publishedAt).toDateString() === new Date().toDateString()
    ).length;
    
    // Calculate total posts today across all accounts (for rate limiting)
    const totalPostsToday = accounts.reduce((sum, account) => 
      sum + (account.dailyPostCount || 0), 0
    );
    
    res.json({
      scheduled,
      publishedToday,
      accounts: accounts.length,
      totalPosts: instagramPosts.length,
      dailyLimitUsed: totalPostsToday,
      dailyLimitTotal: accounts.length * 25
    });
  } catch (error) {
    console.error('Error fetching Instagram stats:', error);
    res.status(500).json({ message: 'Failed to fetch Instagram stats' });
  }
});

/**
 * POST /api/instagram/import-csv
 * Import Instagram posts from CSV file
 */
router.post('/import-csv', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { accountId } = req.body;
    
    // accountId is now optional - can be specified in CSV via accountUsername column
    const accountIdNumber = accountId ? parseInt(accountId) : undefined;
    
    // Import Instagram CSV (accountId is optional for multi-account CSVs)
    const { InstagramImportService } = await import('../services/instagramImportService');
    const result = await InstagramImportService.importFromCSV(
      req.file.buffer,
      user.id,
      accountIdNumber || undefined
    );
    
    if (result.success) {
      // Log activity
      await storage.createActivity({
        userId: user.id,
        type: 'instagram_bulk_import',
        description: `Imported ${result.imported} Instagram posts from CSV`,
        metadata: { 
          imported: result.imported,
          failed: result.failed 
        }
      });
      
      res.json(result);
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('Error importing Instagram CSV:', error);
    res.status(500).json({ message: 'Failed to import CSV' });
  }
});

/**
 * GET /api/instagram/template
 * Download Instagram CSV template
 */
router.get('/template', async (req: Request, res: Response) => {
  try {
    const { InstagramImportService } = await import('../services/instagramImportService');
    const templateBuffer = InstagramImportService.generateTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="instagram-posts-template.xlsx"');
    res.send(templateBuffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Failed to generate template' });
  }
});

/**
 * DELETE /api/instagram/accounts/:id
 * Delete an Instagram account
 */
router.delete('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const accountId = parseInt(req.params.id);
    const success = await storage.deleteInstagramAccount(accountId);
    
    if (success) {
      await storage.createActivity({
        userId: user.id,
        type: 'instagram_account_disconnected',
        description: 'Instagram account disconnected',
        metadata: { accountId }
      });
      
      res.json({ success: true, message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    console.error('Error deleting Instagram account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

/**
 * GET /api/instagram/auth/connect
 * Initiate Instagram OAuth connection
 */
router.get('/auth/connect', async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5001/api/instagram/auth/callback';
    
    if (!appId) {
      return res.status(500).json({ message: 'Instagram App ID not configured' });
    }

    // Instagram OAuth URL
    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile,pages_manage_metadata,read_insights&` +
      `response_type=code&` +
      `state=${user.id}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Instagram auth:', error);
    res.status(500).json({ message: 'Failed to initiate Instagram authentication' });
  }
});

/**
 * GET /api/instagram/auth/callback
 * Handle Instagram OAuth callback
 */
router.get('/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).send('Missing authorization code or state');
    }

    const userId = parseInt(state as string);
    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5001/api/instagram/auth/callback';

    if (!appId || !appSecret) {
      return res.status(500).send('Instagram API credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code as string,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return res.status(400).send('Failed to exchange authorization code for access token');
    }

    const accessToken = tokenData.access_token;

    // Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return res.status(400).send('No Facebook pages found. Please create a Facebook page first.');
    }

    // Find page with Instagram Business Account
    let instagramAccount = null;
    for (const page of pagesData.data) {
      try {
        const igResponse = await fetch(
          `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();
        
        if (igData.instagram_business_account) {
          // Get Instagram account details
          const igAccountResponse = await fetch(
            `https://graph.facebook.com/v20.0/${igData.instagram_business_account.id}?fields=id,username&access_token=${page.access_token}`
          );
          const igAccountData = await igAccountResponse.json();
          
          if (igAccountData.id && igAccountData.username) {
            instagramAccount = {
              pageId: page.id,
              pageAccessToken: page.access_token,
              instagramId: igAccountData.id,
              username: igAccountData.username
            };
            break;
          }
        }
      } catch (error) {
        console.error(`Error checking page ${page.id}:`, error);
        continue;
      }
    }

    if (!instagramAccount) {
      return res.status(400).send('No Instagram Business Account found. Please connect your Instagram account to a Facebook page.');
    }

    // Check if account already exists
    const existingAccount = await storage.getInstagramAccountByUserId(instagramAccount.instagramId);
    
    if (existingAccount) {
      // Update existing account
      await storage.updateInstagramAccount(existingAccount.id, {
        accessToken: instagramAccount.pageAccessToken,
        username: instagramAccount.username,
        isActive: true
      });
      
      // Redirect to success page
      return res.redirect(`http://localhost:5001/instagram-accounts?connected=updated&username=${instagramAccount.username}`);
    }

    // Create new account
    const newAccount = await storage.createInstagramAccount({
      userId: userId,
      username: instagramAccount.username,
      instagramUserId: instagramAccount.instagramId,
      accessToken: instagramAccount.pageAccessToken,
      isActive: true
    });

    // Log activity
    await storage.createActivity({
      userId: userId,
      type: 'instagram_account_connected',
      description: `Connected Instagram account: @${instagramAccount.username}`,
      metadata: { accountId: newAccount.id, username: instagramAccount.username }
    });

    // Redirect to success page
    return res.redirect(`http://localhost:5001/instagram-accounts?connected=success&username=${instagramAccount.username}`);

  } catch (error) {
    console.error('Error handling Instagram callback:', error);
    return res.status(500).send('Failed to connect Instagram account');
  }
});

export default router;

