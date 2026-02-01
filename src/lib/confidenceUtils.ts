/**
 * Confidence normalization utility
 * Ensures confidence is always displayed as a 0-100 percentage
 */

/**
 * Normalize confidence to 0-100 scale
 * @param confidence - Raw confidence value (could be 0-1 or 0-100)
 * @returns Normalized confidence as 0-100 percentage
 */
export function normalizeConfidence(confidence: number | undefined | null): number {
  if (confidence === undefined || confidence === null) return 65; // Default fallback
  
  // If value is between 0 and 1 (exclusive), multiply by 100
  if (confidence > 0 && confidence <= 1) {
    return Math.round(confidence * 100);
  }
  
  // If already 0-100, just round it
  if (confidence > 1 && confidence <= 100) {
    return Math.round(confidence);
  }
  
  // Edge cases
  if (confidence === 0) return 0;
  if (confidence > 100) return 100;
  
  return 65; // Fallback
}

/**
 * Format confidence as display string
 * @param confidence - Raw confidence value
 * @returns Formatted string like "72%"
 */
export function formatConfidencePercent(confidence: number | undefined | null): string {
  return `${normalizeConfidence(confidence)}%`;
}

/**
 * Get confidence color class based on normalized value
 * @param confidence - Raw confidence value
 * @returns Tailwind color class
 */
export function getConfidenceColorClass(confidence: number | undefined | null): string {
  const normalized = normalizeConfidence(confidence);
  
  if (normalized >= 70) return 'text-success';
  if (normalized >= 55) return 'text-yellow-400';
  return 'text-orange-400';
}

/**
 * Get confidence label based on normalized value
 * @param confidence - Raw confidence value
 * @returns Label like "🔒 LOCK", "🔥 HOT", etc.
 */
export function getConfidenceLabel(confidence: number | undefined | null): string {
  const normalized = normalizeConfidence(confidence);
  
  if (normalized >= 75) return '🔒 LOCK';
  if (normalized >= 70) return '🔥 HOT';
  if (normalized >= 60) return '💪 STRONG';
  return '📊 VALUE';
}
