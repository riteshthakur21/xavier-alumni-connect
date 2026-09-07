/**
 * Date and timestamp formatting utilities for Xavier AlumniConnect
 */

/**
 * Format conversation last-message timestamps with WhatsApp-style relative/calendar date logic:
 * - < 1 minute: "just now"
 * - < 1 hour: "Xm ago" (e.g. "15m ago")
 * - Same calendar day: "Xh ago" (e.g. "2h ago") or "just now" / "Xm ago"
 * - 1 day ago (calendar yesterday): "Yesterday"
 * - 2 to 6 days ago: "2d ago", "3d ago", ..., "6d ago"
 * - 7+ days ago: "dd MMM" (e.g. "31 Aug", "05 Sep") with year only if different year
 */
export function formatConversationTimestamp(iso: string | Date | number | null | undefined): string {
  if (!iso) return '';

  const target = new Date(iso);
  if (isNaN(target.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - target.getTime();

  // Handle future dates or clock skew (< 1 min)
  if (diffMs < 60 * 1000) {
    return 'just now';
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  // Calculate difference in calendar days in user's local timezone
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayDiff = Math.round((nowDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff <= 0) {
    // Same day (>= 1 hour)
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${diffHours}h ago`;
  }

  if (dayDiff === 1) {
    return 'Yesterday';
  }

  if (dayDiff < 7) {
    return `${dayDiff}d ago`;
  }

  // 7+ days old: format as "dd MMM" (or "dd MMM yyyy" if different year)
  const day = String(target.getDate()).padStart(2, '0');
  const month = target.toLocaleDateString('en-US', { month: 'short' });

  if (target.getFullYear() !== now.getFullYear()) {
    return `${day} ${month} ${target.getFullYear()}`;
  }

  return `${day} ${month}`;
}
