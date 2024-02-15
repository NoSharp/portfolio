export const TOKENS: Record<string, string> = {
  HEADER: "HEADER",
  CHARCTER: "CHARACTER",
  ASTERISK: "ASTERISK",
} as const;

export interface TokenizerRuleHit {
  rule: keyof typeof TOKENS;
  content: string;
}
