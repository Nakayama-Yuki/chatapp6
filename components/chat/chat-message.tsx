"use client";

/**
 * メッセージの型定義
 */
interface Message {
  id?: string;
  content: string;
  user_id: string;
  isMine: boolean;
  isSystem: boolean;
  created_at?: string;
}

/**
 * チャットメッセージコンポーネント
 *
 * @param message メッセージ情報
 */
export default function ChatMessage({ message }: { message: Message }) {
  // メッセージのスタイル設定
  const getMessageStyles = () => {
    const baseStyles = [
      "rounded-xl",
      "p-3",
      "max-w-[80%]",
      "break-words",
      "shadow-xs",
    ];

    // システムメッセージのスタイル
    if (message.isSystem) {
      return [
        ...baseStyles,
        "bg-gray-200",
        "text-gray-700",
        "self-center",
        "italic",
        "text-center",
        "text-sm",
      ].join(" ");
    }

    // 自分のメッセージのスタイル
    if (message.isMine) {
      return [...baseStyles, "bg-green-500", "text-white", "self-end"].join(
        " "
      );
    }

    // 他のユーザーのメッセージのスタイル
    return [...baseStyles, "bg-blue-500", "text-white", "self-start"].join(" ");
  };

  // 日付フォーマット関数
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      className={`flex flex-col ${
        message.isMine ? "items-end" : "items-start"
      }`}>
      <div className={getMessageStyles()}>{message.content}</div>

      {/* メッセージの時間表示（システムメッセージ以外） */}
      {!message.isSystem && message.created_at && (
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formatDate(message.created_at)}
        </span>
      )}
    </div>
  );
}
