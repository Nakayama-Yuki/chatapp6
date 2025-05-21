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
  userName?: string;
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
  const [users, setUsers] = useState<
    Map<string, { name: string; email: string }>
  >(new Map());
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>();
  const [mainChannel, setMainChannel] = useState<RealtimeChannel | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

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
      .select("id, name")
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

      const displayName = user.data[0].name || email;
      addSystemMessage(
        `${displayName} をチャンネル ${selectedRoom} に追加しました`
      );
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
   * @param userName ユーザー名（オプション）
   */
  const addMessage = (
    mine: boolean,
    system: boolean,
    message: string,
    userName?: string
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        content: message,
        user_id: mine ? user?.id || "" : "other",
        isMine: mine,
        isSystem: system,
        userName: userName || user?.email?.split("@")[0] || "",
      },
    ]);
  };

  // 初期化処理
  useEffect(() => {
    // ユーザー情報の取得
    supabase.auth
      .getUser()
      .then(async (data) => {
        setUser(data.data.user);

        // ユーザー名を取得
        if (data.data.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", data.data.user.id)
            .single();

          if (profileData && profileData.name) {
            setUserName(profileData.name);
          } else {
            setUserName(data.data.user.email?.split("@")[0] || "");
          }
        }

        return data;
      })
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

    setUsers(new Map());

    // 新しいチャンネルの購読設定
    let newChannel = supabase.channel(selectedRoom, {
      config: {
        broadcast: { self: true },
        private: true, // プライベートチャンネルとして設定
      },
    });

    newChannel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        // 自分のメッセージかどうかを判定
        const isMine = payload.user_id === user?.id;
        // メッセージを追加（受信メッセージには送信者の名前情報も含める）
        addMessage(
          isMine,
          false,
          payload.message,
          isMine ? userName : payload.userName
        );
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        // 新たに参加したユーザーを追加
        const updatedUsers = new Map(users);
        newPresences.forEach((presence) => {
          updatedUsers.set(presence.email, {
            email: presence.email,
            name: presence.name || presence.email.split("@")[0],
          });
        });
        setUsers(updatedUsers);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        // 退出したユーザーを削除
        const updatedUsers = new Map(users);
        leftPresences.forEach((presence) => {
          // 同じメールアドレスを持つユーザーを検索して削除
          users.forEach((user, key) => {
            if (user.email === presence.email) {
              updatedUsers.delete(key);
            }
          });
        });
        setUsers(updatedUsers);
      })
      .subscribe((status, err) => {
        setLoading(false);

        if (status === "SUBSCRIBED") {
          setChannel(newChannel);
          // プレゼンス情報を送信
          newChannel.track({ email: user?.email, name: userName });
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
    // メッセージデータを取得
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
      // メッセージに対応するユーザー名を取得するため、ユーザーIDの一覧を作成
      const userIds = [...new Set(data.map((msg) => msg.user_id))];

      // プロフィール情報を取得
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      // IDをキーとするユーザー名マップを作成
      const userNameMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile) => {
          userNameMap.set(profile.id, profile.name);
        });
      }

      // 各メッセージにユーザー名を追加
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          isMine: msg.user_id === user?.id,
          isSystem: false,
          created_at: msg.created_at,
          userName: userNameMap.get(msg.user_id) || "",
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
      payload: { message, user_id: user?.id, userName: userName },
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
          <UserList users={Array.from(users.values())} />

          {/* ルーム作成ボタン */}
          <button
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground hover:bg-foreground/5 transition"
            onClick={() => setShowModal(true)}>
            ルームを作成
          </button>

          {/* プロフィール設定リンク */}
          <a
            href="/protected/profile"
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground hover:bg-foreground/5 transition text-center mt-2 block">
            プロフィール設定
          </a>
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
