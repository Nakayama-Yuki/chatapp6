"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import CreateRoomModal from "@/components/chat/create-room-modal";
import ChatMessage from "@/components/chat/chat-message";
import UserList from "@/components/chat/user-list";
import RoomList from "@/components/chat/room-list";

// メッセージの型定義
interface Message {
  id?: string;
  content: string;
  user_id: string;
  isMine: boolean;
  isSystem: boolean;
  created_at?: string;
}

/**
 * チャットアプリのメインページコンポーネント
 */
export default function ChatPage() {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Set<string>>(new Set());
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>();
  const [mainChannel, setMainChannel] = useState<RealtimeChannel | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Supabaseクライアントの初期化
  const supabase = createClient();

  /**
   * チャンネル一覧を取得する関数
   */
  const getChannels = async () => {
    const channels = await supabase.from("rooms").select("topic");
    setRooms(channels.data?.map(({ topic }) => topic) || []);
  };

  /**
   * ユーザーをチャンネルに追加する関数
   * @param email 追加するユーザーのメールアドレス
   */
  const addUserToChannel = async (email: string) => {
    if (!selectedRoom) return;

    const user = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email);

    if (!user.data?.length) {
      addSystemMessage(`ユーザー ${email} が見つかりませんでした`);
    } else {
      const room = await supabase
        .from("rooms")
        .select("topic")
        .eq("topic", selectedRoom);

      await supabase
        .from("rooms_users")
        .upsert({ user_id: user.data[0].id, room_topic: room.data?.[0].topic });

      addSystemMessage(`${email} をチャンネル ${selectedRoom} に追加しました`);
    }
  };

  /**
   * システムメッセージを追加する関数
   * @param message メッセージ内容
   */
  const addSystemMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        content: message,
        user_id: "system",
        isMine: false,
        isSystem: true,
      },
    ]);
  };

  /**
   * メッセージを追加する関数
   * @param mine 自分のメッセージかどうか
   * @param system システムメッセージかどうか
   * @param message メッセージ内容
   */
  const addMessage = (mine: boolean, system: boolean, message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        content: message,
        user_id: mine ? user?.id || "" : "other",
        isMine: mine,
        isSystem: system,
      },
    ]);
  };

  // 初期化処理
  useEffect(() => {
    // ユーザー情報の取得
    supabase.auth
      .getUser()
      .then((data) => setUser(data.data.user))
      .then(async () => {
        // リアルタイム認証設定
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token!;
        supabase.realtime.setAuth(token);

        // メインチャンネルの初期化
        let main = supabase.channel("supaslack");

        main
          .on("broadcast", { event: "new_room" }, () => getChannels())
          .subscribe();

        setMainChannel(main);
        getChannels();
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  // ルーム選択時の処理
  useEffect(() => {
    if (!selectedRoom) return;

    // メッセージをクリア
    setMessages([]);

    // 既存のチャンネル購読を解除
    if (channel) {
      channel.unsubscribe();
    }

    setUsers(new Set());

    // 新しいチャンネルの購読設定
    let newChannel = supabase.channel(selectedRoom, {
      config: {
        broadcast: { self: true },
        private: true, // プライベートチャンネルとして設定
      },
    });

    newChannel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        addMessage(payload.user_id == user?.id, false, payload.message);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        // 新たに参加したユーザーを追加
        const updatedUsers = new Set(users);
        newPresences.forEach(({ email }) => updatedUsers.add(email));
        setUsers(updatedUsers);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        // 退出したユーザーを削除
        const updatedUsers = new Set(users);
        leftPresences.forEach(({ email }) => updatedUsers.delete(email));
        setUsers(updatedUsers);
      })
      .subscribe((status, err) => {
        setLoading(false);

        if (status === "SUBSCRIBED") {
          setChannel(newChannel);
          // プレゼンス情報を送信
          newChannel.track({ email: user?.email });
          setError(null);

          // 過去のメッセージを取得（オプション）
          fetchRoomMessages(selectedRoom);
        }

        if (status === "CLOSED") {
          setChannel(null);
        }

        if (status === "CHANNEL_ERROR") {
          setError(err?.message || "チャンネルへの接続エラー");
        }
      });

    return () => {
      if (newChannel) {
        newChannel.unsubscribe();
      }
    };
  }, [selectedRoom]);

  /**
   * 過去のメッセージを取得する関数
   * @param roomTopic ルームトピック
   */
  const fetchRoomMessages = async (roomTopic: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_topic", roomTopic)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("メッセージの取得エラー:", error);
      return;
    }

    if (data && data.length > 0) {
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          isMine: msg.user_id === user?.id,
          isSystem: false,
          created_at: msg.created_at,
        }))
      );
    }
  };

  /**
   * メッセージ送信処理
   * @param message メッセージ内容
   */
  const sendMessage = async (message: string) => {
    if (!message.trim() || !channel || !selectedRoom) return;

    // スラッシュコマンドの処理
    if (message.startsWith("/invite")) {
      const email = message.replace("/invite ", "");
      await addUserToChannel(email);
      return;
    }

    // メッセージをDBに保存
    const { error } = await supabase.from("messages").insert({
      room_topic: selectedRoom,
      user_id: user?.id,
      content: message,
    });

    if (error) {
      console.error("メッセージ保存エラー:", error);
      return;
    }

    // リアルタイムブロードキャスト
    await channel.send({
      type: "broadcast",
      event: "message",
      payload: { message, user_id: user?.id },
    });
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 flex flex-col h-full w-full justify-center items-center align-middle gap-2 z-10 bg-[#000000CC]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full p-4 md:p-10">
      {/* ルーム作成モーダル */}
      {showModal && (
        <CreateRoomModal
          channel={mainChannel}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex w-full h-full gap-4 flex-col md:flex-row">
        {/* サイドバー */}
        <div className="grow-0 flex flex-col gap-2 w-full md:w-[20rem] overflow-hidden">
          {/* ルーム一覧 */}
          <RoomList
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={(room) => {
              setLoading(true);
              setSelectedRoom(room);
            }}
          />

          {/* ユーザー一覧 */}
          <UserList users={Array.from(users)} />

          {/* ルーム作成ボタン */}
          <button
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground hover:bg-foreground/5 transition"
            onClick={() => setShowModal(true)}>
            ルームを作成
          </button>
        </div>

        {/* チャット本体 */}
        <div className="grow flex flex-col gap-2 h-full">
          {error ? (
            <div className="bg-white h-full rounded-md text-slate-900 p-4 flex justify-center items-center">
              <div className="text-center">
                <h1 className="text-xl font-bold text-red-500">エラー</h1>
                <p>{error}</p>
                <p className="mt-2">このルームにアクセスする権限がありません</p>
              </div>
            </div>
          ) : (
            <div className="bg-white h-full rounded-md text-slate-900 p-2 overflow-y-auto flex flex-col gap-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  メッセージはまだありません
                </div>
              ) : (
                messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))
              )}
            </div>
          )}

          {/* メッセージ入力フォーム */}
          <form
            className="flex text-foreground w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const target = form.elements[0] as HTMLInputElement;
              const message = target.value;

              if (message.trim()) {
                sendMessage(message);
              }

              target.value = "";
            }}>
            <label className="hidden" htmlFor="message">
              メッセージ
            </label>
            <input
              name="message"
              className="grow rounded-md text-black p-2 border-2 border-gray-300 focus:border-blue-500 focus:outline-hidden"
              placeholder={
                channel ? "メッセージを入力" : "チャンネルを選択してください"
              }
              disabled={!channel}
            />
            <button
              type="submit"
              className="border border-foreground/20 rounded-md px-4 py-2 text-foreground hover:bg-foreground/5 transition disabled:opacity-50"
              disabled={!channel}>
              送信
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
