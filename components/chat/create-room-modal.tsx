"use client";

import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useState } from "react";

// Props型定義
type CreateRoomModalProps = {
  channel: RealtimeChannel | null;
  onClose: () => void;
};

/**
 * ルーム作成モーダルコンポーネント
 * 新しいチャットルームの作成機能を提供
 *
 * @param channel メインチャンネル
 * @param onClose モーダルを閉じるハンドラー
 */
export default function CreateRoomModal({
  channel,
  onClose,
}: CreateRoomModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  /**
   * ルーム作成処理
   */
  const createRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("ルーム名を入力してください");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const user = await supabase.auth.getUser();
      const session = await supabase.auth.getSession();

      if (!session.data.session?.access_token) {
        setError("認証エラーが発生しました");
        setIsCreating(false);
        return;
      }

      const token = session.data.session.access_token;

      // リアルタイム認証トークンの設定
      supabase.realtime.setAuth(token);

      // ルームの作成
      const roomsResponse = await supabase
        .from("rooms")
        .insert({ topic: topic.trim() })
        .select("topic");

      if (roomsResponse.error) {
        console.error("Room creation error:", roomsResponse.error);
        setError(roomsResponse.error.message || "ルーム作成エラー");
        setIsCreating(false);
        return;
      }

      if (roomsResponse.data && user.data.user) {
        // 作成者をルームユーザーに追加
        await supabase.from("rooms_users").insert({
          user_id: user.data.user.id,
          room_topic: roomsResponse.data[0].topic,
        });

        // ルーム作成イベントの送信
        await channel?.send({
          type: "broadcast",
          event: "new_room",
          payload: {},
        });

        // モーダルを閉じる
        onClose();

        // 新しく作成したルームにリダイレクト
        window.location.href = `/protected/chat?room=${encodeURIComponent(
          roomsResponse.data[0].topic
        )}`;
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError("ルーム作成中にエラーが発生しました");
    } finally {
      setIsCreating(false);
    }
  };

  // オーバーレイクリックでモーダルを閉じる
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <form
        className="flex flex-col w-full max-w-md gap-4 bg-background border rounded-lg p-6 shadow-lg"
        onSubmit={createRoom}
        onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title" className="text-xl font-bold text-foreground">
          ルームを作成
        </h2>

        {error && (
          <div
            className="bg-destructive/15 text-destructive p-3 rounded-md border border-destructive/20"
            role="alert"
            aria-live="polite">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="topic">
            ルーム名
          </label>
          <input
            className="w-full rounded-md px-3 py-2 bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            name="topic"
            id="topic"
            placeholder="例: general"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            maxLength={50}
            disabled={isCreating}
            aria-describedby={error ? "topic-error" : undefined}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isCreating}>
            {isCreating ? "作成中..." : "ルームを作成"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-secondary text-secondary-foreground rounded-md px-4 py-2 font-medium hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isCreating}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
