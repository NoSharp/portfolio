export const TOKENS: Record<string, string> = {
  HEADING: "HEADING",
  CHARCTER: "CHARACTER",
} as const;

export interface TokenizerRule {
  name: keyof typeof TOKENS;
  pattern: RegExp;
}

export interface TokenizerRuleHit {
  rule: TokenizerRule;
  content: string;
}
