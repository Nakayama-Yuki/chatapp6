"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useState } from "react";

/**
 * ルーム作成モーダルコンポーネント
 *
 * @param channel メインチャンネル
 * @param onClose モーダルを閉じるハンドラー
 */
export default function CreateRoomModal({
  channel,
  onClose,
}: {
  channel: RealtimeChannel | null;
  onClose: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  /**
   * ルーム作成処理
   */
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("ルーム名を入力してください");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const user = await supabase.auth.getUser();
      const token = (await supabase.auth.getSession()).data.session!
        .access_token;

      // リアルタイム認証トークンの設定
      supabase.realtime.setAuth(token);

      // ルームの作成
      const rooms_response = await supabase
        .from("rooms")
        .insert({ topic })
        .select("topic");

      if (rooms_response.error) {
        console.error("Room creation error:", rooms_response.error);
        setError(rooms_response.error.message || "ルーム作成エラー");
        setIsCreating(false);
        return;
      }

      if (rooms_response.data) {
        // 作成者をルームユーザーに追加
        await supabase.from("rooms_users").insert({
          user_id: user.data.user!.id,
          room_topic: rooms_response.data[0].topic,
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
        window.location.href = `/protected/chat?room=${rooms_response.data[0].topic}`;
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError("ルーム作成中にエラーが発生しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col h-full w-full justify-center items-center align-middle gap-2 z-10 bg-[#00000099]">
      <form
        className="flex flex-col sm:max-w-md gap-2 text-foreground bg-background rounded-md p-6 shadow-lg"
        onSubmit={createRoom}>
        <h2 className="text-xl font-bold mb-4">ルームを作成</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <label className="text-sm font-medium" htmlFor="topic">
          ルーム名
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="topic"
          id="topic"
          placeholder="general"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />

        <div className="flex justify-between gap-4">
          <button
            type="submit"
            className="border border-green-500 bg-green-500 text-white rounded-md px-4 py-2 mb-2 w-40 hover:bg-green-600 transition disabled:opacity-50"
            disabled={isCreating}>
            {isCreating ? "作成中..." : "ルームを作成"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 w-40 hover:bg-foreground/5 transition">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
