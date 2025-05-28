"use client";

import { Hash } from "lucide-react";

// Props型定義
type RoomListProps = {
  rooms: string[];
  selectedRoom?: string;
  onSelectRoom: (room: string) => void;
};

/**
 * ルームリストコンポーネント
 * チャットルームの一覧表示と選択機能を提供
 *
 * @param rooms ルーム一覧
 * @param selectedRoom 選択中のルーム
 * @param onSelectRoom ルーム選択ハンドラー
 */
export default function RoomList({
  rooms,
  selectedRoom,
  onSelectRoom,
}: RoomListProps) {
  return (
    <div className="bg-card border rounded-md h-full overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="p-3 font-semibold bg-muted border-b text-center">
        <h2 className="text-sm font-medium">ルーム一覧</h2>
      </div>

      {/* ルームリスト */}
      <div className="flex flex-col overflow-y-auto flex-grow min-h-[300px]">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground italic">
            ルームはまだありません
          </div>
        ) : (
          rooms.map((room: string) => {
            const isSelected = selectedRoom === room;

            return (
              <button
                key={room}
                onClick={() => onSelectRoom(room)}
                className={`
                  flex items-center gap-2 p-3 text-left transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`ルーム ${room} を選択`}>
                <Hash size={16} className="flex-shrink-0" />
                <span className="truncate font-medium">{room}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
