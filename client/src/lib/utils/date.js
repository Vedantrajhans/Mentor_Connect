/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time until session
 */
export const getTimeUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  
  if (diff < 0) return 'Past';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Check if session is within 5 minutes
 */
export const canJoinSession = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start - now;
  
  // Can join 5 minutes before
  return diff <= 5 * 60 * 1000 && diff > -60 * 60 * 1000;
};

/**
 * Check if session has ended
 */
export const hasSessionEnded = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const sessionEnd = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour session
  
  return now > sessionEnd;
};
