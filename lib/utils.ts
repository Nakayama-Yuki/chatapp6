import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * メールアドレスの右から4文字を残してそれより前をアスタリスクでマスクする関数
 * セキュリティ上の理由で一部のメールアドレスを隠す
 *
 * @param email マスクするメールアドレス
 * @returns マスクされたメールアドレス
 *
 * @example
 * maskEmail("user@example.com") => "****ser@example.com"
 * maskEmail("abcdefg@test.jp") => "***defg@test.jp"
 * maskEmail("abc@test.com") => "***abc@test.com" (短いメールアドレスの場合)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) {
    return email;
  }

  const [localPart, domain] = email.split("@");

  // ローカル部が4文字以下の場合は全体をマスクして最後に元の文字列を表示
  if (localPart.length <= 4) {
    const maskedPart = "*".repeat(3);
    return `${maskedPart}${localPart}@${domain}`;
  }

  // ローカル部が4文字より長い場合は右から4文字を残してそれより前をマスク
  const visiblePart = localPart.slice(-4); // 右から4文字
  const maskedLength = localPart.length - 4;
  const maskedPart = "*".repeat(maskedLength);
  return `${maskedPart}${visiblePart}@${domain}`;
}
