const SPAM_KEYWORDS = [
  "viagra",
  "cialis",
  "casino",
  "lottery",
  "winner",
  "click here",
  "buy now",
  "free money",
  "act now",
  "limited time",
  "no obligation",
  "risk free",
  "as seen on",
  "order now",
  "special promotion",
  "nigerian prince",
  "wire transfer",
  "bitcoin doubler",
  "crypto giveaway",
];

const URL_REGEX = /https?:\/\/[^\s]{1,2000}/gi;

interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkSpam(data: Record<string, unknown>): SpamCheckResult {
  const text = Object.values(data)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  // Check keywords
  for (const keyword of SPAM_KEYWORDS) {
    if (text.includes(keyword)) {
      return { isSpam: true, reason: `Spam keyword detected: ${keyword}` };
    }
  }

  // Check excessive URLs (more than 5)
  const urls = text.match(URL_REGEX);
  if (urls && urls.length > 5) {
    return { isSpam: true, reason: "Too many URLs in submission" };
  }

  // Check for very short submissions (less than 3 chars of real content)
  const cleanText = text.replace(/\s+/g, "");
  if (cleanText.length > 0 && cleanText.length < 3) {
    return { isSpam: true, reason: "Submission too short" };
  }

  return { isSpam: false };
}

export interface EnhancedSpamResult {
  isSpam: boolean;
  reason?: string;
  spamScore?: number;
  method: "keyword" | "ai" | "none";
}

export async function checkSpamEnhanced(
  data: Record<string, unknown>,
  useAI: boolean
): Promise<EnhancedSpamResult> {
  // Always run keyword check first (free/instant)
  const keywordResult = checkSpam(data);
  if (keywordResult.isSpam) {
    return {
      isSpam: true,
      reason: keywordResult.reason,
      spamScore: 100,
      method: "keyword",
    };
  }

  // If AI is enabled and keyword check passed, run AI check
  if (useAI) {
    try {
      const { checkSpamWithAI } = await import("@/lib/ai-spam");
      const aiResult = await checkSpamWithAI(data);
      if (aiResult) {
        return {
          isSpam: aiResult.isSpam,
          reason: aiResult.reason,
          spamScore: aiResult.confidence,
          method: "ai",
        };
      }
    } catch {
      // AI check failed, fall through to non-spam
    }
  }

  return { isSpam: false, method: "none" };
}

export function checkHoneypot(
  data: Record<string, unknown>,
  honeypotField: string | null
): boolean {
  if (!honeypotField) return false;
  const value = data[honeypotField];
  return typeof value === "string" && value.length > 0;
}
