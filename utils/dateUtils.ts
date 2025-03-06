/**
 * Utility functions for date formatting throughout the application
 */

/**
 * Formats a date string into a user-friendly time and date format
 * @param dateString ISO date string to format
 * @returns Object containing formatted time and date strings
 */
export const formatDateTime = (dateString: string) => {
  if (!dateString) return { formattedTime: '', formattedDate: '' };
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { formattedTime: dateString, formattedDate: dateString };
    }
    
    // Format time (12-hour format with AM/PM)
    const formattedTime = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Format date (Month Day, Year)
    const formattedDate = date.toLocaleDateString([], { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return { formattedTime, formattedDate };
  } catch (error) {
    console.error('Error formatting date:', error);
    return { formattedTime: dateString, formattedDate: dateString };
  }
};

/**
 * Formats a date string into a full readable format
 * @param dateString ISO date string to format
 * @returns Formatted date string (e.g., "March 5, 2025 - 2:30 PM")
 */
export const formatFullDate = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format: March 5, 2025 - 2:30 PM
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formats a date string into a relative time format (e.g., "2 hours ago", "in 3 days")
 * @param dateString ISO date string to format
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    // Future date
    if (diffInSeconds > 0) {
      if (diffInSeconds < 60) return `in ${diffInSeconds} seconds`;
      if (diffInSeconds < 3600) return `in ${Math.floor(diffInSeconds / 60)} minutes`;
      if (diffInSeconds < 86400) return `in ${Math.floor(diffInSeconds / 3600)} hours`;
      if (diffInSeconds < 2592000) return `in ${Math.floor(diffInSeconds / 86400)} days`;
      return formatFullDate(dateString);
    }
    
    // Past date
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return `${absDiff} seconds ago`;
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
    if (absDiff < 2592000) return `${Math.floor(absDiff / 86400)} days ago`;
    return formatFullDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};
