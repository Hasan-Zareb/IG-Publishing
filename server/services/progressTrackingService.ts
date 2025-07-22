import { WebSocket } from 'ws';

interface ProgressUpdate {
  uploadId: string;
  step: string;
  percentage: number;
  details: string;
  timestamp: Date;
}

interface ActiveUpload {
  uploadId: string;
  userId: number;
  websocket?: WebSocket;
  progress: ProgressUpdate;
}

class ProgressTrackingService {
  private activeUploads: Map<string, ActiveUpload> = new Map();
  private clients: Map<string, WebSocket> = new Map();

  // Register a new upload session
  startUpload(uploadId: string, userId: number, websocket?: WebSocket): void {
    console.log(`📊 Starting progress tracking for upload: ${uploadId}`);
    
    const upload: ActiveUpload = {
      uploadId,
      userId,
      websocket,
      progress: {
        uploadId,
        step: 'Initializing upload...',
        percentage: 0,
        details: 'Starting Enhanced Google Drive video processing',
        timestamp: new Date()
      }
    };

    this.activeUploads.set(uploadId, upload);
    
    if (websocket) {
      this.clients.set(uploadId, websocket);
      this.sendProgressUpdate(upload.progress);
    }
  }

  // Update progress for an upload
  updateProgress(uploadId: string, step: string, percentage: number, details: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) {
      console.warn(`⚠️ Upload not found for progress update: ${uploadId}`);
      return;
    }

    upload.progress = {
      uploadId,
      step,
      percentage: Math.min(100, Math.max(0, percentage)),
      details,
      timestamp: new Date()
    };

    console.log(`📈 Progress update [${uploadId}]: ${step} - ${percentage}% - ${details}`);
    
    this.sendProgressUpdate(upload.progress);
  }

  // Send progress to connected WebSocket client
  private sendProgressUpdate(progress: ProgressUpdate): void {
    const client = this.clients.get(progress.uploadId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify({
          type: 'progress',
          data: progress
        }));
      } catch (error) {
        console.error(`❌ Failed to send progress update:`, error);
      }
    }
  }

  // Complete an upload
  completeUpload(uploadId: string, success: boolean, details?: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) return;

    const finalProgress: ProgressUpdate = {
      uploadId,
      step: success ? 'Upload completed successfully!' : 'Upload failed',
      percentage: success ? 100 : 0,
      details: details || (success ? 'Video uploaded and published to Facebook' : 'Upload failed'),
      timestamp: new Date()
    };

    console.log(`🏁 Upload ${success ? 'completed' : 'failed'} [${uploadId}]: ${details}`);
    
    this.sendProgressUpdate(finalProgress);
    
    // Clean up after a delay
    setTimeout(() => {
      this.activeUploads.delete(uploadId);
      const client = this.clients.get(uploadId);
      if (client) {
        this.clients.delete(uploadId);
        if (client.readyState === WebSocket.OPEN) {
          client.close();
        }
      }
    }, 5000);
  }

  // Get current progress for an upload
  getProgress(uploadId: string): ProgressUpdate | null {
    const upload = this.activeUploads.get(uploadId);
    return upload ? upload.progress : null;
  }

  // Register WebSocket client for existing upload
  registerClient(uploadId: string, websocket: WebSocket): void {
    this.clients.set(uploadId, websocket);
    
    // Send current progress if upload exists
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      this.sendProgressUpdate(upload.progress);
    }
  }

  // Remove client
  removeClient(uploadId: string): void {
    this.clients.delete(uploadId);
  }

  // Get all active uploads for debugging
  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }
}

// Export singleton instance
export const progressTracker = new ProgressTrackingService();
export default progressTracker;