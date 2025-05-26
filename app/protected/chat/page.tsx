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
    if (!selectedRoom || !user) return;

    // メッセージをクリア
    setMessages([]);

    // 既存のチャンネル購読を解除
    if (channel) {
      channel.unsubscribe();
    }

    setUsers(new Map());

    // ユーザーが選択したルームに自動的に参加する処理を追加
    const joinRoom = async () => {
      try {
        // ルームの情報を取得
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("topic")
          .eq("topic", selectedRoom)
          .single();

        if (roomError) {
          setError(roomError.message || "ルームの情報取得に失敗しました");
          return;
        }

        // すでにルームに参加しているか確認
        const { data: userRoomData, error: userRoomError } = await supabase
          .from("rooms_users")
          .select("*")
          .eq("user_id", user.id)
          .eq("room_topic", selectedRoom);

        if (userRoomError) {
          setError(
            userRoomError.message || "ルーム参加状態の確認に失敗しました"
          );
          return;
        }

        // まだ参加していない場合は自動的に参加
        if (!userRoomData || userRoomData.length === 0) {
          const { error: joinError } = await supabase
            .from("rooms_users")
            .upsert({
              user_id: user.id,
              room_topic: selectedRoom,
            });

          if (joinError) {
            setError(joinError.message || "ルームへの参加に失敗しました");
            return;
          }

          // 参加したことを通知するシステムメッセージ
          addSystemMessage(`ルーム「${selectedRoom}」に参加しました`);
        }
      } catch (err) {
        console.error("ルーム参加エラー:", err);
        setError("ルームへの参加中にエラーが発生しました");
      }
    };

    // ルーム参加処理を実行
    joinRoom();

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
    <div className="h-full flex flex-col">
      {/* ページヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          リアルタイムチャット
        </h1>
        <p className="text-muted-foreground">
          {selectedRoom ? `#${selectedRoom}` : "ルームを選択してください"}
        </p>
      </div>

      {/* ルーム作成モーダル */}
      {showModal && (
        <CreateRoomModal
          channel={mainChannel}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex-1 flex gap-6 min-h-0">
        {/* 左サイドバー：ルーム＆ユーザー一覧 */}
        <div className="w-80 flex flex-col gap-4 shrink-0">
          {/* ルーム一覧 */}
          <div className="flex-1 min-h-0">
            <RoomList
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelectRoom={(room) => {
                setLoading(true);
                setSelectedRoom(room);
              }}
            />
          </div>

          {/* ユーザー一覧 */}
          <div className="h-64">
            <UserList users={Array.from(users.values())} />
          </div>

          {/* ルーム作成ボタン */}
          <button
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 hover:bg-primary/90 transition font-medium"
            onClick={() => setShowModal(true)}>
            ＋ ルームを作成
          </button>
        </div>

        {/* メインチャットエリア */}
        <div className="flex-1 flex flex-col bg-card border rounded-xl min-h-0">
          {error ? (
            <div className="flex-1 flex justify-center items-center p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-destructive mb-2">
                  エラー
                </h2>
                <p className="text-muted-foreground mb-2">{error}</p>
                <p className="text-sm text-muted-foreground">
                  このルームにアクセスする権限がありません
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* チャットヘッダー */}
              {selectedRoom && (
                <div className="border-b p-4">
                  <h3 className="font-semibold text-lg">#{selectedRoom}</h3>
                  <p className="text-sm text-muted-foreground">
                    {Array.from(users.values()).length} 人がオンライン
                  </p>
                </div>
              )}

              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💬</div>
                      <p>メッセージはまだありません</p>
                      <p className="text-sm mt-1">
                        最初のメッセージを送信しましょう！
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))
                )}
              </div>

              {/* メッセージ入力フォーム */}
              <div className="border-t p-4">
                <form
                  className="flex gap-3"
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
                    className="flex-1 rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={
                      channel
                        ? "メッセージを入力..."
                        : "ルームを選択してください"
                    }
                    disabled={!channel}
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground rounded-lg px-6 py-3 hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!channel}>
                    送信
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
