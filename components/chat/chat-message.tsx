"use client";

// メッセージの型定義
type Message = {
  id?: string;
  content: string;
  user_id: string;
  isMine: boolean;
  isSystem: boolean;
  created_at?: string;
  userName?: string;
};

// Props型定義
type ChatMessageProps = {
  message: Message;
};

/**
 * チャットメッセージコンポーネント
 * ユーザーメッセージ、システムメッセージ、自分のメッセージを表示
 *
 * @param message メッセージ情報
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  // メッセージのスタイル設定
  const getMessageStyles = (): string => {
    const baseStyles = [
      "rounded-xl",
      "p-3",
      "max-w-[80%]",
      "break-words",
      "shadow-sm",
      "transition-colors",
    ];

    // システムメッセージのスタイル
    if (message.isSystem) {
      return [
        ...baseStyles,
        "bg-muted",
        "text-muted-foreground",
        "self-center",
        "italic",
        "text-center",
        "text-sm",
        "border",
      ].join(" ");
    }

    // 自分のメッセージのスタイル
    if (message.isMine) {
      return [
        ...baseStyles,
        "bg-primary",
        "text-primary-foreground",
        "self-end",
      ].join(" ");
    }

    // 他のユーザーのメッセージのスタイル
    return [
      ...baseStyles,
      "bg-secondary",
      "text-secondary-foreground",
      "self-start",
      "border",
    ].join(" ");
  };

  // 日付フォーマット関数
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.warn("日付のフォーマットに失敗しました:", error);
      return "";
    }
  };

  return (
    <div
      className={`flex flex-col ${
        message.isMine ? "items-end" : "items-start"
      }`}
      role="group"
      aria-label={`${
        message.isMine ? "自分" : message.userName || "ユーザー"
      }のメッセージ`}>
      {/* ユーザー名表示（他のユーザーのメッセージの場合） */}
      {!message.isSystem && !message.isMine && message.userName && (
        <span className="text-xs text-muted-foreground mb-1 px-1 font-medium">
          {message.userName}
        </span>
      )}

      {/* メッセージ本体 */}
      <div
        className={getMessageStyles()}
        role={message.isSystem ? "status" : "text"}
        aria-live={message.isSystem ? "polite" : undefined}>
        {message.content}
      </div>

      {/* メッセージの時間表示（システムメッセージ以外） */}
      {!message.isSystem && message.created_at && (
        <time
          className="text-xs text-muted-foreground mt-1 px-1"
          dateTime={message.created_at}
          title={new Date(message.created_at).toLocaleString("ja-JP")}>
          {formatDate(message.created_at)}
        </time>
      )}
    </div>
  );
}
