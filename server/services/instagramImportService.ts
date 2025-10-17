import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { storage } from '../storage';
import { parseISTDateToUTC } from '../utils/timezoneUtils';
import { scheduleInstagramPost } from './instagramPostService';

export interface InstagramImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  warnings?: string[];
}

/**
 * Instagram Import Service
 * Handles bulk import of Instagram posts from CSV/Excel files
 */
export class InstagramImportService {
  
  /**
   * Generate Instagram CSV template
   */
  static generateTemplate(): Buffer {
    const templateData = [
      {
        caption: 'Morning motivation 💪 Start your day right! #motivation #success',
        scheduledFor: '2:00 PM',
        mediaUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID_1/view',
        mediaType: 'reel',
        accountUsername: 'account1',
        customLabels: 'motivation, morning',
        language: 'en'
      },
      {
        caption: 'Quick recipe tutorial 🍳 Easy breakfast! #cooking #recipe #food',
        scheduledFor: '2:15 PM',
        mediaUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID_2/view',
        mediaType: 'reel',
        accountUsername: 'account2',
        customLabels: 'cooking, tutorial',
        language: 'en'
      },
      {
        caption: 'Product showcase 🎯 Check it out! #product #demo',
        scheduledFor: '10/15/2025 4:45 PM',
        mediaUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID_3/view',
        mediaType: 'video',
        accountUsername: 'account1',
        customLabels: 'product, demo',
        language: 'en'
      },
      {
        caption: 'Weekend sale announcement 🛍️ 50% OFF! #sale #shopping',
        scheduledFor: '2025-10-16 10:00:00',
        mediaUrl: 'https://i.imgur.com/example.jpg',
        mediaType: 'photo',
        accountUsername: 'account3',
        customLabels: 'sale, weekend',
        language: 'en'
      },
      {
        caption: 'हिंदी में ट्यूटोरियल 🇮🇳 #hindi #tutorial #india',
        scheduledFor: '2025-10-16 18:30:00',
        mediaUrl: 'https://drive.google.com/file/d/YOUR_FILE_ID_4/view',
        mediaType: 'reel',
        accountUsername: 'account2',
        customLabels: 'hindi, tutorial',
        language: 'hi'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Instagram Posts');
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 60 }, // caption
      { wch: 25 }, // scheduledFor
      { wch: 50 }, // mediaUrl
      { wch: 15 }, // mediaType
      { wch: 20 }, // accountUsername
      { wch: 30 }, // customLabels
      { wch: 10 }  // language
    ];
    worksheet['!cols'] = colWidths;
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  
  /**
   * Import Instagram posts from CSV file
   */
  static async importFromCSV(
    fileBuffer: Buffer,
    userId: number,
    instagramAccountId?: number
  ): Promise<InstagramImportResult> {
    try {
      // Detect file type
      const isCSV = this.isCSVBuffer(fileBuffer);
      
      let rows: any[];
      if (isCSV) {
        rows = await this.parseCSV(fileBuffer);
      } else {
        rows = await this.parseExcel(fileBuffer);
      }
      
      if (rows.length === 0) {
        return {
          success: false,
          imported: 0,
          failed: 0,
          errors: ['No data found in file']
        };
      }
      
      console.log(`📊 Processing ${rows.length} Instagram posts from file`);
      
      // Process and create posts
      return await this.processAndCreatePosts(rows, userId, instagramAccountId);
      
    } catch (error) {
      console.error('Error importing Instagram CSV:', error);
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Parse CSV file
   */
  private static async parseCSV(fileBuffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const csvText = fileBuffer.toString('utf-8');
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().replace(/\s+/g, ''),
        complete: (results) => {
          resolve(results.data || []);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Parse Excel file
   */
  private static async parseExcel(fileBuffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error('No worksheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('File must contain headers and at least one data row');
    }
    
    // Convert to objects
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);
    
    return dataRows
      .filter((row: any) => Array.isArray(row) && row.some((cell: any) => cell))
      .map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[header.toLowerCase().replace(/\s+/g, '')] = row[index];
          }
        });
        return obj;
      });
  }
  
  /**
   * Detect if buffer is CSV
   */
  private static isCSVBuffer(buffer: Buffer): boolean {
    const text = buffer.toString('utf-8', 0, 1000);
    return text.includes(',') && !text.includes('<?xml');
  }
  
  /**
   * Process rows and create posts
   */
  private static async processAndCreatePosts(
    rows: any[],
    userId: number,
    instagramAccountId?: number
  ): Promise<InstagramImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let imported = 0;
    let failed = 0;
    
    // Get all user's Instagram accounts for multi-account support
    const userAccounts = await storage.getInstagramAccounts(userId);
    const accountMap = new Map(userAccounts.map(acc => [acc.username.toLowerCase(), acc]));
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because first row is headers and we're 0-indexed
      
      try {
        // Extract fields (support multiple column name variations)
        const caption = row.caption || row.content || row.message || '';
        const scheduledFor = row.scheduledfor || row.scheduledFor || row['scheduled for'] || '';
        const mediaUrl = row.mediaurl || row.mediaUrl || row['media url'] || row.videourl || row.videoUrl || '';
        const mediaType = (row.mediatype || row.mediaType || row['media type'] || 'reel').toLowerCase();
        const customLabels = row.customlabels || row.customLabels || row.labels || row.tags || '';
        const language = row.language || 'en';
        const accountUsername = row.accountusername || row.accountUsername || row.account || row.instagramaccount || '';
        
        // Validation
        if (!caption || caption.trim() === '') {
          errors.push(`Row ${rowNum}: Caption is required`);
          failed++;
          continue;
        }
        
        if (!mediaUrl || mediaUrl.trim() === '') {
          errors.push(`Row ${rowNum}: Media URL is required (Instagram requires media)`);
          failed++;
          continue;
        }
        
        if (!scheduledFor || scheduledFor.toString().trim() === '') {
          errors.push(`Row ${rowNum}: Scheduled date/time is required`);
          failed++;
          continue;
        }
        
        // Validate media type
        const validMediaTypes = ['photo', 'image', 'video', 'reel'];
        if (!validMediaTypes.includes(mediaType)) {
          warnings.push(`Row ${rowNum}: Invalid mediaType "${mediaType}", defaulting to "reel"`);
        }
        
        const finalMediaType = validMediaTypes.includes(mediaType) ? mediaType : 'reel';
        
        // Parse labels
        const labelArray = customLabels ? 
          customLabels.split(',').map((l: string) => l.trim()).filter((l: string) => l) : 
          [];
        
        // Determine which Instagram account to use
        let finalAccountId = instagramAccountId;
        
        // If accountUsername is specified in CSV, use that instead
        if (accountUsername && accountUsername.trim() !== '') {
          const username = accountUsername.trim().toLowerCase().replace('@', ''); // Remove @ if present
          const account = accountMap.get(username);
          
          if (account) {
            finalAccountId = account.id;
            console.log(`Row ${rowNum}: Using account @${account.username} from CSV`);
          } else {
            // Account not found - try partial match
            const partialMatch = userAccounts.find(acc => 
              acc.username.toLowerCase().includes(username) ||
              username.includes(acc.username.toLowerCase())
            );
            
            if (partialMatch) {
              finalAccountId = partialMatch.id;
              warnings.push(`Row ${rowNum}: Using partial match @${partialMatch.username} for "${accountUsername}"`);
            } else {
              errors.push(`Row ${rowNum}: Instagram account "${accountUsername}" not found. Connect this account first.`);
              failed++;
              continue;
            }
          }
        }
        
        // Validate we have an account
        if (!finalAccountId) {
          errors.push(`Row ${rowNum}: No Instagram account specified. Add "accountUsername" column or select account in UI.`);
          failed++;
          continue;
        }
        
        // Check daily limit for this account
        const { InstagramService } = await import('./instagramService');
        const limitCheck = await InstagramService.checkDailyLimit(finalAccountId, userId);
        
        if (!limitCheck.canPost) {
          warnings.push(`Row ${rowNum}: Account has reached daily limit (${limitCheck.postsToday}/25). Post will be scheduled but may fail when publishing.`);
        }
        
        // Parse date and convert from IST to UTC
        const scheduledDateUTC = parseISTDateToUTC(scheduledFor, `Instagram row ${rowNum}`);
        
        // Create post
        const post = await storage.createPost({
          userId: userId,
          platform: 'instagram',
          instagramAccountId: finalAccountId,
          content: caption.trim(),
          mediaUrl: mediaUrl.trim(),
          mediaType: finalMediaType,
          labels: labelArray,
          language: language || 'en',
          scheduledFor: scheduledDateUTC,
          status: 'scheduled'
        } as any);
        
        // Schedule the post
        scheduleInstagramPost(post);
        
        imported++;
        console.log(`✅ Row ${rowNum}: Instagram post imported and scheduled`);
        
      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }
    }
    
    // Create summary activity
    await storage.createActivity({
      userId: userId,
      type: 'instagram_bulk_import_summary',
      description: `Instagram bulk import: ${imported} posts imported, ${failed} failed`,
      metadata: {
        imported,
        failed,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    });
    
    return {
      success: imported > 0,
      imported,
      failed,
      errors,
      warnings
    };
  }
}

