# SocialFlow - Facebook Publishing Platform

## Overview
An advanced social media publishing platform for Facebook business accounts, offering intelligent content management and streamlined publishing workflows with enhanced user experience.

## Project Architecture
- **Frontend**: React with TypeScript, shadcn/ui components, Wouter routing
- **Backend**: Node.js Express server with simplified authentication
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: Meta Graph API integration for Facebook publishing
- **File Processing**: Excel/CSV import with Papa Parse and XLSX libraries

## Key Features
- Facebook account management and authentication
- Bulk post scheduling via Excel/CSV import
- Real-time dashboard with analytics
- Custom labeling system
- Multi-language support (EN, HI)
- Media upload and management
- Activity logging and tracking

## Recent Changes
**June 15, 2025**
- ✅ Successfully implemented Facebook page dropdown selector for Excel import
- ✅ Removed account name requirement from CSV template
- ✅ Updated backend to accept selected account ID from frontend
- ✅ Modified Excel parsing to use selected account instead of CSV data
- ✅ Simplified template to only require: Content, Scheduled Date, Custom Labels, Language, Media URL/Type
- ✅ Completed feature testing - 2 posts successfully imported using page selector
- ✅ User confirmed successful import of 2 posts with "Sivalik Vasudeva" page selection
- 🔧 Improved query client error handling and retry logic for dashboard stability
- ✅ Fixed time parsing to support "2:30 PM" format for same-day scheduling
- ✅ Fixed Google Drive link processing to convert sharing URLs to direct download format
- ✅ Fixed language metadata display in Recent Activity to show selected language properly
- ✅ Fixed timezone conversion issue causing 5.5-hour scheduling shifts in Excel import
- ✅ Applied UTC+5:30 timezone offset correction for accurate post scheduling
- ✅ Fixed timezone correction direction to subtract offset instead of adding
- ✅ Implemented manual UTC date creation to prevent timezone conversion entirely
- ✅ Added "View All Posts" page with comprehensive post management functionality
- ✅ Updated system to handle IST (Indian Standard Time) for scheduling
- ✅ Modified Excel import to interpret times as IST and convert to UTC for storage
- ✅ Fixed validation function conflicts preventing IST conversion
- ✅ Corrected existing posts to proper UTC storage times
- ✅ Implemented comprehensive Facebook publishing fix with overdue post processing
- ✅ Added automatic recovery system for posts that miss scheduled execution
- ✅ Verified Facebook API publishing working correctly with live posts
- ✅ Enhanced custom labels for Meta Insights reporting with Facebook API compliance
- ✅ Implemented proper label validation (25 char limit, max 10 labels per post)
- ✅ Custom labels from Excel imports now properly sent to Facebook's Meta Insights system
- ✅ All scheduled posts cleared multiple times at user request - system maintains clean state
- ✅ Fixed Facebook post visibility issue - all posts now publish with public "EVERYONE" privacy settings
- ✅ Implemented comprehensive media optimization system with automatic fallback for large video files
- ✅ Disabled automatic link posting per user request - videos either upload successfully or fail cleanly
- ✅ Implemented comprehensive video optimization system with detailed compression guidance for large files
- ✅ Fixed Google Drive URL processing to convert sharing links to direct download format for Facebook compatibility
- ✅ Resolved URL optimization timing issue - Google Drive URLs now converted during analysis phase for proper video detection
- ✅ Implemented comprehensive Google Drive permission diagnostics with specific sharing guidance for restricted files
- ✅ Fixed error message routing to properly show Google Drive permission guidance instead of incorrect compression advice
- ✅ Verified Google Drive permission detection working correctly - system now properly identifies sharing restrictions
- ✅ Updated Google Drive error messaging to accurately explain API limitations rather than permission issues
- ✅ Restored Google Drive video upload functionality by removing overly restrictive permission blocking
- ✅ Fixed Google Drive large video detection using range requests for accurate file size determination
- ✅ Identified video size as root cause of upload failures rather than permission issues
- ✅ Implemented Facebook resumable upload API for large videos (>50MB) to support full 4GB limit
- ✅ Fixed Google Drive large video uploads by bypassing file_url method limitations
- ✅ Forced all Google Drive videos to use resumable upload to eliminate URL detection failures
- ✅ Confirmed Google Drive programmatic access limitation - videos upload as 0 bytes due to security policies
- ✅ Implemented comprehensive error detection for empty video downloads with alternative solutions
- ✅ Added complete Dropbox video hosting support with automatic URL conversion
- ✅ Implemented intelligent upload method selection based on file size and source platform
- ✅ Fixed Dropbox URL conversion for new sharing format (scl/fi/) with proper dl.dropboxusercontent.com conversion
- ✅ Enhanced video content type detection to force video/mp4 for files with video extensions
- ✅ Added frontend Dropbox link button with real-time URL recognition and status indicators
- ✅ Successfully tested Dropbox video upload - confirmed working with Facebook post ID 1255291356114757
- ✅ Implemented comprehensive Facebook Graph API video validation system based on official specifications
- ✅ Added file size limits validation (1GB for URL uploads, 1.75GB for resumable uploads)
- ✅ Integrated automatic upload method selection based on Facebook requirements
- ✅ Enhanced error detection to prevent failed uploads by validating format compatibility before API calls
- ✅ Identified cloud storage access limitations causing video upload failures despite initial API success
- ✅ Updated frontend with practical hosting solution recommendations for reliable video uploads
- ✅ Replaced Dropbox with Vimeo as primary video hosting solution with comprehensive integration
- ✅ Implemented complete Vimeo helper service with URL extraction, video info retrieval, and direct access methods
- ✅ Added early validation system for Vimeo videos with detailed setup guidance when download permissions required
- ✅ Updated frontend to prioritize Vimeo with step-by-step setup instructions and real-time URL recognition
- ✅ Enhanced error messaging to provide actionable guidance for enabling Vimeo download permissions for Facebook compatibility
- ✅ Implemented YouTube native integration as primary video solution eliminating 100MB+ file size limitations
- ✅ Added complete YouTube helper service with URL extraction and Facebook Graph API native posting
- ✅ Successfully tested YouTube video publishing - confirmed working with Facebook post ID 101307726083031_702450925973731
- ✅ Enhanced Facebook service with YouTube-specific publishing method using native link sharing
- ✅ Eliminated video processing bottlenecks by leveraging Facebook's native YouTube integration
- ✅ Updated frontend to prioritize YouTube over Vimeo based on successful integration testing
- ✅ Redesigned video upload interface with YouTube as primary recommendation and red branding
- ✅ Reordered setup instructions to showcase YouTube's instant compatibility and no size limits
- ✅ Implemented YouTube video download and upload functionality using @distube/ytdl-core library
- ✅ Added file-based upload methods for downloaded YouTube videos with resumable upload support
- ✅ Enhanced Facebook service to handle both URL-based and file-based video uploads
- ✅ YouTube videos now downloaded as MP4 files and uploaded as actual video content to Facebook
- ✅ Automatic cleanup of temporary video files after successful upload
- ✅ Support for large YouTube videos using Facebook's resumable upload API (up to 1.75GB)
- ✅ Maintained custom labels and Meta Insights integration for downloaded video uploads
- ✅ Fixed "Could not extract functions" error by switching to @distube/ytdl-core and improving error handling
- ✅ Successfully tested YouTube download and upload with 45MB video (Post ID: 646949595058904)
- ✅ Implemented YouTube video processing for CSV/Excel imports - videos automatically downloaded during import
- ✅ Added comprehensive error handling and progress tracking for YouTube downloads in bulk imports
- ✅ Updated Excel import interface to inform users about automatic YouTube video processing capability
- ✅ Analyzed YouTube quality limitations - identified 1080p60 available as video-only streams requiring audio merging
- ✅ Added FFmpeg system dependency for high-quality video processing capabilities
- ✅ Successfully implemented FFmpeg-based video+audio merging to access 1080p60 quality (124.9MB vs 27.7MB)
- ✅ Fixed validation bugs preventing high-quality merged videos from uploading to Facebook
- ✅ Enhanced YouTube processing now downloads separate 1080p video and audio streams then merges with FFmpeg
- ✅ Fixed Facebook resumable upload JSON parsing errors for large merged videos
- ✅ Complete high-quality YouTube pipeline now operational: 1080p60 downloads → FFmpeg merge → Facebook upload
- ✅ Reduced chunk size to 4MB for Facebook API compatibility to resolve HTTP 413 errors
- ✅ Successfully tested FFmpeg processing with 230.6MB merged video (227.2MB video + 3.3MB audio)
- ✅ Confirmed dramatic quality improvement: From 27.7MB (360p) to 230.6MB (1080p60) - 8.3x size increase
- ✅ Verified FFmpeg merge performance: Consistent 30-42x processing speed across all video sizes
- ✅ End-to-end high-quality video processing system fully operational and tested

## Current Status
- Excel import feature with Facebook page selection is fully functional and user-verified
- Dashboard accessible without authentication requirements
- System successfully processing posts with proper account assignment
- Enhanced error handling implemented to prevent console errors
- Timezone conversion issue completely resolved - posts schedule at exact intended times
- All scheduled posts cleared at user request - system now clean with 0 active jobs
- Scheduling system ready for fresh content import
- All Posts page provides comprehensive post management with filtering and search
- View All Scheduled Posts functionality working correctly

## User Preferences
- Direct dashboard access without login requirements
- Simplified Excel import workflow with frontend page selection
- Clean, production-ready UI design
- Comprehensive error handling and user feedback

## Technical Implementation Notes
- Excel import now accepts accountId parameter from frontend
- Backend processes selected account ID instead of parsing from CSV
- Template generation simplified to remove account name column
- Frontend dropdown populated from connected Facebook accounts