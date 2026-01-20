// Force cleanup script for persistent blob URL issues
// This script should be run to completely reset blob URL state

(function() {
  console.log('=== FORCE BLOB URL CLEANUP INITIATED ===');
  
  // 1. Revoke ALL possible blob URLs
  try {
    // Try to revoke the specific problematic URLs
    const problematicUrls = [
      'blob:http://localhost:8081/b3c4b3a8-66fe-484f-8b86-fec029f94210',
      'blob:http://localhost:8081/aab492a6-71f5-42ef-9212-01be6d018c99'
    ];
    
    problematicUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
        console.log('✓ Revoked problematic URL:', url);
      } catch (e) {
        console.warn('Could not revoke URL (may already be dead):', url);
      }
    });
    
  } catch (error) {
    console.error('Error during URL revocation:', error);
  }
  
  // 2. Clear browser storage that might hold references
  try {
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✓ Cleared sessionStorage');
    
    // Clear localStorage
    localStorage.clear();
    console.log('✓ Cleared localStorage');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log('✓ Cleared cache:', name);
        });
      });
    }
    
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
  
  // 3. Force garbage collection if available
  if (window.gc) {
    try {
      window.gc();
      console.log('✓ Forced garbage collection');
    } catch (e) {
      console.warn('Could not force garbage collection');
    }
  }
  
  // 4. Reload the page to ensure clean state
  console.log('=== CLEANUP COMPLETE - RELOADING PAGE ===');
  
  // Small delay to ensure cleanup completes
  setTimeout(() => {
    window.location.reload(true); // Force reload from server
  }, 1000);
  
})();