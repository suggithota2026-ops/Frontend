import { useState, useEffect, useCallback, useRef } from 'react';
import { trackBlobUrl, revokeBlobUrl } from '@/utils/blobUrlManager';

interface UseBlobUrlReturn {
  blobUrl: string | null;
  setFile: (file: File | null) => void;
  clear: () => void;
}

/**
 * Enhanced custom hook for managing blob URLs with aggressive cleanup
 * Includes additional safeguards against ERR_FILE_NOT_FOUND errors
 */
export const useBlobUrl = (): UseBlobUrlReturn => {
  const [blobUrl, setBlobUrlState] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  // Keep track of all created blob URLs for cleanup
  const blobUrlsRef = useRef<Set<string>>(new Set());
  
  // Track mounted state to prevent state updates on unmounted components
  const isMountedRef = useRef(true);

  const setBlobUrl = useCallback((url: string | null) => {
    if (isMountedRef.current) {
      setBlobUrlState(url);
    }
  }, []);

  const cleanupBlobUrl = useCallback((url: string | null) => {
    if (url) {
      const success = revokeBlobUrl(url);
      blobUrlsRef.current.delete(url);
      if (success) {
        console.log('Successfully revoked blob URL:', url);
      }
    }
  }, []);

  // Create blob URL when file changes
  useEffect(() => {
    if (currentFile) {
      try {
        // Clean up previous blob URL if it exists
        if (blobUrl) {
          cleanupBlobUrl(blobUrl);
        }
        
        const newBlobUrl = URL.createObjectURL(currentFile);
        blobUrlsRef.current.add(newBlobUrl);
        trackBlobUrl(newBlobUrl);
        console.log('Created new blob URL:', newBlobUrl);
        setBlobUrl(newBlobUrl);
      } catch (error) {
        console.error('Error creating blob URL:', error);
        setBlobUrl(null);
      }
    } else {
      // Clean up when no file
      if (blobUrl) {
        cleanupBlobUrl(blobUrl);
        setBlobUrl(null);
      }
    }
    
    // Cleanup function for this effect
    return () => {
      if (blobUrl) {
        cleanupBlobUrl(blobUrl);
      }
    };
  }, [currentFile, blobUrl, cleanupBlobUrl, setBlobUrl]);

  // Aggressive cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clean up all tracked blob URLs
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
          console.log('Revoked blob URL on unmount:', url);
        } catch (error) {
          console.warn('Error revoking blob URL on unmount:', url, error);
        }
      });
      
      blobUrlsRef.current.clear();
    };
  }, []);

  // Additional cleanup when component becomes inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clean up blob URLs when tab is hidden
        if (blobUrl) {
          cleanupBlobUrl(blobUrl);
          setBlobUrl(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [blobUrl, cleanupBlobUrl, setBlobUrl]);

  const setFile = useCallback((file: File | null) => {
    if (isMountedRef.current) {
      setCurrentFile(file);
    }
  }, []);

  const clear = useCallback(() => {
    if (isMountedRef.current) {
      setCurrentFile(null);
    }
  }, []);

  return {
    blobUrl,
    setFile,
    clear
  };
};