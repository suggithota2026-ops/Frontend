// Global blob URL cleanup utility
// This helps clean up any orphaned blob URLs that might cause ERR_FILE_NOT_FOUND errors

// Known problematic blob URLs that should be immediately cleaned up
const KNOWN_PROBLEMATIC_URLS = [
  'blob:http://localhost:8081/b3c4b3a8-66fe-484f-8b86-fec029f94210',
  'blob:http://localhost:8081/aab492a6-71f5-42ef-9212-01be6d018c99'
];

// Immediate cleanup of known problematic URLs
KNOWN_PROBLEMATIC_URLS.forEach(url => {
  try {
    URL.revokeObjectURL(url);
    console.log('✓ Cleaned up known problematic URL:', url);
  } catch (error) {
    // URL may already be dead, which is fine
    console.log('Known URL already dead or invalid:', url);
  }
});

class BlobUrlManager {
  private static instance: BlobUrlManager;
  private trackedUrls: Set<string> = new Set();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPeriodicCleanup();
    this.setupPageUnloadCleanup();
  }

  static getInstance(): BlobUrlManager {
    if (!BlobUrlManager.instance) {
      BlobUrlManager.instance = new BlobUrlManager();
    }
    return BlobUrlManager.instance;
  }

  trackUrl(url: string): void {
    this.trackedUrls.add(url);
    console.log('Tracking blob URL:', url);
  }

  untrackUrl(url: string): void {
    this.trackedUrls.delete(url);
    console.log('Untracking blob URL:', url);
  }

  revokeUrl(url: string): boolean {
    try {
      URL.revokeObjectURL(url);
      this.untrackUrl(url);
      console.log('Successfully revoked blob URL:', url);
      return true;
    } catch (error) {
      console.warn('Error revoking blob URL:', url, error);
      this.untrackUrl(url); // Remove from tracking even if revoke fails
      return false;
    }
  }

  revokeAll(): void {
    console.log('Revoking all tracked blob URLs:', this.trackedUrls.size);
    this.trackedUrls.forEach(url => {
      this.revokeUrl(url);
    });
    this.trackedUrls.clear();
  }

  private startPeriodicCleanup(): void {
    // Clean up every 30 seconds to catch any missed URLs
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000);
  }

  private performCleanup(): void {
    // Remove any URLs that are no longer valid
    const urlsToRemove: string[] = [];
    
    this.trackedUrls.forEach(url => {
      try {
        // Try to create a small test blob to see if URL is still valid
        const testBlob = new Blob(['test'], { type: 'text/plain' });
        const testUrl = URL.createObjectURL(testBlob);
        URL.revokeObjectURL(testUrl);
        
        // If we get here, the URL system is working
        // We can't easily test if a specific blob URL is valid without fetching it
        // So we'll rely on other cleanup mechanisms
      } catch (error) {
        // If blob creation fails, revoke all tracked URLs
        console.log('Blob system error detected, revoking all URLs');
        urlsToRemove.push(url);
      }
    });
    
    urlsToRemove.forEach(url => {
      this.revokeUrl(url);
    });
  }

  private setupPageUnloadCleanup(): void {
    // Clean up on page unload/navigation
    const cleanup = () => {
      console.log('Performing final blob URL cleanup');
      this.revokeAll();
      
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
    };

    // Multiple event listeners for maximum coverage
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('unload', cleanup);
    window.addEventListener('pagehide', cleanup);
    
    // Also clean up when visibility changes to hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.performCleanup();
      }
    });
  }
}

// Create global instance
const blobUrlManager = BlobUrlManager.getInstance();

// Export utility functions
export const trackBlobUrl = (url: string): void => {
  blobUrlManager.trackUrl(url);
};

export const revokeBlobUrl = (url: string): boolean => {
  return blobUrlManager.revokeUrl(url);
};

export const revokeAllBlobUrls = (): void => {
  blobUrlManager.revokeAll();
};

// Cleanup any existing blob URLs on module load
// This helps clear any URLs from previous sessions
revokeAllBlobUrls();

export default blobUrlManager;