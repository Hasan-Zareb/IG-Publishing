import puppeteer from 'puppeteer';
import axios from 'axios';
import { promises as fs, statSync, createWriteStream } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

interface VideoDownloadResult {
  success: boolean;
  filePath?: string;
  filename?: string;
  error?: string;
  videoInfo?: {
    title?: string;
    duration?: string;
    quality?: string;
  };
}

export class FacebookVideoDownloader {
  private static readonly DOWNLOAD_DIR = path.join(process.cwd(), 'temp', 'fb_videos');
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0'
  ];

  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  /**
   * Download Facebook video in highest quality available
   */
  static async downloadVideo(facebookUrl: string): Promise<VideoDownloadResult> {
    try {
      console.log('🎥 Starting Facebook video download:', facebookUrl);

      // Validate Facebook URL
      if (!this.isValidFacebookVideoUrl(facebookUrl)) {
        return { success: false, error: 'Invalid Facebook video URL' };
      }

      // Ensure download directory exists
      await this.ensureDownloadDirectory();

      // Try network-based extraction first (more reliable in server environments)
      console.log('🔄 Trying network-based extraction first...');
      let videoInfo: { success: boolean; videoUrl?: string; title?: string; error?: string } = await this.extractVideoUrlFromNetwork(facebookUrl);
      
      if (!videoInfo.success || !videoInfo.videoUrl) {
        console.log('🔄 Network extraction failed, trying mobile version...');
        const mobileUrl = facebookUrl.replace('www.facebook.com', 'm.facebook.com');
        videoInfo = await this.extractVideoUrlFromNetwork(mobileUrl);
      }
      
      if (!videoInfo.success || !videoInfo.videoUrl) {
        console.log('🔄 Network methods failed, trying browser extraction...');
        try {
          const browserResult = await this.extractVideoInfo(facebookUrl);
          if (browserResult.success && browserResult.videoUrl) {
            videoInfo = browserResult;
          }
        } catch (error) {
          console.log('❌ Browser extraction also failed:', error);
          videoInfo = { 
            success: false, 
            error: 'Browser extraction failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
          };
        }
      }
      
      if (!videoInfo.success || !videoInfo.videoUrl) {
        // Provide comprehensive error message with solutions
        const baseError = videoInfo.error || 'Failed to extract video URL from all methods';
        const solutionMessage = `

🔧 SOLUTIONS TO TRY:
1. Check if the Facebook video is public (not private/friends-only)
2. Verify the video URL is correct and complete
3. Try copying the video URL again from Facebook
4. Use a public Facebook page video instead of personal profile video
5. Download the video manually and upload it directly

⚠️  FACEBOOK RESTRICTIONS:
Facebook has tightened security for video downloads. Only public videos from pages can typically be accessed programmatically.`;
        
        return { 
          success: false, 
          error: baseError + solutionMessage
        };
      }

      // Download the video file
      const downloadResult = await this.downloadVideoFile(videoInfo.videoUrl, videoInfo.title);
      if (!downloadResult.success) {
        return { success: false, error: downloadResult.error };
      }

      console.log('✅ Facebook video downloaded successfully:', downloadResult.filename);
      return {
        success: true,
        filePath: downloadResult.filePath,
        filename: downloadResult.filename,
        videoInfo: {
          title: videoInfo.title,
          duration: 'Unknown',
          quality: 'Original'
        }
      };

    } catch (error) {
      console.error('❌ Error downloading Facebook video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract video information and download URL from Facebook page
   */
  private static async extractVideoInfo(facebookUrl: string): Promise<{
    success: boolean;
    videoUrl?: string;
    title?: string;
    duration?: string;
    quality?: string;
    error?: string;
  }> {
    let browser;
    try {
      console.log('🔍 Extracting video info from Facebook page...');

      // Launch browser with stealth settings and additional Linux flags
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--single-process',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });

      const page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Block unnecessary resources for faster loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'image'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to Facebook video page
      await page.goto(facebookUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for video element to load
      await page.waitForSelector('video', { timeout: 10000 }).catch(() => null);

      // Extract video information using multiple selectors
      const videoInfo = await page.evaluate(() => {
        // Try multiple methods to find video elements
        const videoSelectors = [
          'video[src]',
          'video source[src]',
          '[data-video-id] video',
          '.spotlight video',
          'div[role="main"] video'
        ];

        let videoElement: HTMLVideoElement | null = null;
        let videoSrc = '';

        // Find video element
        for (const selector of videoSelectors) {
          const element = document.querySelector(selector) as HTMLVideoElement;
          if (element && element.src) {
            videoElement = element;
            videoSrc = element.src;
            break;
          }
        }

        // Try to find source elements
        if (!videoSrc) {
          const sources = Array.from(document.querySelectorAll('video source[src]'));
          for (const source of sources) {
            const src = (source as HTMLSourceElement).src;
            if (src && src.includes('video')) {
              videoSrc = src;
              break;
            }
          }
        }

        // Extract title from page
        const titleSelectors = [
          '[data-pagelet="VideoPlayerTitle"] h1',
          '[role="main"] h1',
          'h1[dir="auto"]',
          '.x1e558r4 h1',
          'title'
        ];

        let title = '';
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            title = element.textContent.trim();
            if (title && !title.includes('Facebook')) {
              break;
            }
          }
        }

        // Get video duration if available
        const duration = videoElement?.duration ? Math.floor(videoElement.duration).toString() + 's' : undefined;

        return {
          videoUrl: videoSrc,
          title: title || 'Facebook Video',
          duration,
          quality: 'HD' // Assume HD for Facebook videos
        };
      });

      await browser.close();

      if (!videoInfo.videoUrl) {
        // This code path should not be reached now since network extraction is done first
        return { success: false, error: 'Could not extract video URL from browser method' };
      }

      console.log('✅ Video info extracted:', { title: videoInfo.title, hasUrl: !!videoInfo.videoUrl });
      return {
        success: true,
        ...videoInfo
      };

    } catch (error) {
      if (browser) await browser.close();
      console.error('❌ Error extracting video info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract video info'
      };
    }
  }

  /**
   * Alternative method to extract video URL from network requests
   */
  private static async extractVideoUrlFromNetwork(facebookUrl: string): Promise<{
    success: boolean;
    videoUrl?: string;
    title?: string;
    error?: string;
  }> {
    try {
      console.log('🔍 Trying alternative extraction method...');

      // Try multiple URL variations with retry logic
      const urlVariations = [
        facebookUrl,
        facebookUrl.replace('www.facebook.com', 'm.facebook.com'),
        facebookUrl.replace('facebook.com', 'm.facebook.com'),
        facebookUrl + '?_rdr',
        facebookUrl.replace('/watch?v=', '/watch/?v='),
        facebookUrl.replace('watch/?v=', 'videos/')
      ];

      // Try each URL variation with retry logic
      for (const url of urlVariations) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`🔄 Trying URL variation ${urlVariations.indexOf(url) + 1}/${urlVariations.length}, attempt ${attempt}/3: ${url.substring(0, 50)}...`);
            
            const response = await axios.get(url, {
              headers: {
                'User-Agent': this.getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
              },
              timeout: 15000,
              maxRedirects: 3,
              validateStatus: function (status) {
                return status >= 200 && status < 400;
              }
            });

            const html = response.data;

            // Extract video URL using updated regex patterns for 2025
            const videoUrlPatterns = [
        // Latest Facebook video patterns (2025)
        /"hd_src":"([^"]+)"/,
        /"sd_src":"([^"]+)"/,
        /"browser_native_hd_url":"([^"]+)"/,
        /"browser_native_sd_url":"([^"]+)"/,
        /"playable_url":"([^"]+)"/,
        /"videoUrl":"([^"]+)"/,
        /hd_src:"([^"]+)"/,
        /sd_src:"([^"]+)"/,
        /"playable_url_quality_hd":"([^"]+)"/,
        /"playable_url_quality_sd":"([^"]+)"/,
        /\\"hd_src\\":\\"([^"]+)\\"/,
        /\\"sd_src\\":\\"([^"]+)\\"/,
        // New 2025 patterns
        /"dash_manifest":"([^"]+)"/,
        /"progressive_urls":\[.*?"([^"]+)".*?\]/,
        /"src":"([^"]+\.mp4[^"]*)"/, 
        /"video_url":"([^"]+)"/,
        /"media_url":"([^"]+)"/,
        /"src":"(https:\/\/[^"]*\.mp4[^"]*)"/,
        /"url":"(https:\/\/[^"]*\.mp4[^"]*)"/,
        /data-video-url="([^"]+)"/,
        /data-src="([^"]*\.mp4[^"]*)"/,
        // Mobile specific patterns
        /"src":"(https:\/\/[^"]*video_dash[^"]*)"/,
        /"progressive_url":"([^"]+)"/
      ];

      let videoUrl = '';
      for (const pattern of videoUrlPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          videoUrl = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
          // Prioritize .mp4 files over manifest files (similar to reel downloader)
          if (videoUrl.startsWith('http') && videoUrl.includes('.mp4')) {
            break;
          }
        }
      }

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Facebook Video';

            if (videoUrl) {
              console.log('✅ Video URL extracted via network method');
              return {
                success: true,
                videoUrl,
                title
              };
            }

          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`❌ Attempt ${attempt}/3 failed for ${url.substring(0, 50)}...: ${errorMsg}`);
            
            if (attempt === 3) {
              console.log(`🚫 All attempts failed for ${url.substring(0, 50)}...`);
              break; // Move to next URL variation
            } else {
              // Wait before retry with exponential backoff
              const delay = attempt * 2000; // 2s, 4s
              console.log(`⏱️ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
      }

      return {
        success: false,
        error: 'Could not extract video URL from Facebook page after trying all methods'
      };

    } catch (error) {
      console.error('❌ Error in network extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network extraction failed'
      };
    }
  }

  /**
   * Download video file from extracted URL
   */
  private static async downloadVideoFile(videoUrl: string, title?: string): Promise<{
    success: boolean;
    filePath?: string;
    filename?: string;
    error?: string;
  }> {
    try {
      console.log('⬇️ Downloading video file...');

      const filename = `fb_video_${randomUUID()}_${this.sanitizeFilename(title || 'video')}.mp4`;
      const filePath = path.join(this.DOWNLOAD_DIR, filename);

      const response = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Referer': 'https://www.facebook.com/',
          'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
        },
        timeout: 120000 // 2 minutes timeout for large videos
      });

      const writer = await fs.open(filePath, 'w');
      const writeStream = writer.createWriteStream();

      response.data.pipe(writeStream);

      return new Promise((resolve) => {
        writeStream.on('finish', async () => {
          await writer.close();
          
          // Check if the downloaded file is actually a video by reading file header
          const fileBuffer = await fs.readFile(filePath, { encoding: null });
          const isValidVideo = this.isValidVideoFile(fileBuffer);
          
          if (!isValidVideo) {
            console.error('❌ Downloaded file is not a valid video: File header indicates HTML or text content');
            
            // Check if it's HTML content
            const textContent = fileBuffer.toString('utf8', 0, 500);
            if (textContent.includes('<html') || textContent.includes('<!DOCTYPE')) {
              console.error('🔍 Downloaded content is HTML page - likely access restricted or login required');
            }
            
            // Clean up invalid file
            try {
              await fs.unlink(filePath);
            } catch (e) {
              console.warn('Failed to cleanup invalid file:', e);
            }
            
            resolve({
              success: false,
              error: 'Downloaded content is not a video file. This usually means the Facebook video is private, requires login, or the URL extraction failed.'
            });
            return;
          }
          
          console.log('✅ Downloaded file validated as video content');
          const fileSize = statSync(filePath).size;
          console.log('✅ Video file downloaded and validated successfully');
          resolve({
            success: true,
            filePath,
            filename
          });
        });

        writeStream.on('error', async (error) => {
          await writer.close();
          console.error('❌ Error writing video file:', error);
          resolve({
            success: false,
            error: error.message
          });
        });
      });

    } catch (error) {
      console.error('❌ Error downloading video file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  /**
   * Check if a file buffer contains valid video content
   */
  private static isValidVideoFile(buffer: Buffer): boolean {
    // Check for common video file signatures
    const videoSignatures = [
      // MP4
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
      [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70],
      // AVI
      [0x52, 0x49, 0x46, 0x46],
      // MOV/QuickTime
      [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74],
      // WebM
      [0x1A, 0x45, 0xDF, 0xA3],
      // FLV
      [0x46, 0x4C, 0x56]
    ];

    // Check for HTML content (common when video is private/inaccessible)
    const text = buffer.toString('utf8', 0, Math.min(200, buffer.length));
    if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('<head>')) {
      return false;
    }

    // Check video signatures
    for (const signature of videoSignatures) {
      if (buffer.length >= signature.length) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (buffer[i] !== signature[i]) {
            matches = false;
            break;
          }
        }
        if (matches) return true;
      }
    }

    return false;
  }

  /**
   * Validate Facebook video URL (excludes reels - handled by FacebookReelDownloader)
   */
  private static isValidFacebookVideoUrl(url: string): boolean {
    // Check if it's a reel URL (should be handled by FacebookReelDownloader)
    const isReelUrl = /\/reel\/\d+/.test(url);
    if (isReelUrl) {
      return false; // Reels are handled by FacebookReelDownloader
    }

    const facebookVideoPatterns = [
      /^https?:\/\/(www\.)?facebook\.com\/.*\/videos\/\d+/,
      /^https?:\/\/(www\.)?facebook\.com\/watch\/\?v=\d+/,
      /^https?:\/\/(www\.)?facebook\.com\/.*\/posts\/\d+/,
      /^https?:\/\/(www\.)?facebook\.com\/video\.php\?v=\d+/
    ];

    return facebookVideoPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Ensure download directory exists
   */
  private static async ensureDownloadDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.DOWNLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating download directory:', error);
    }
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Clean up downloaded files (optional cleanup method)
   */
  static async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log('🗑️ Cleaned up temporary file:', filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}