"use client";

/**
 * ルームリストコンポーネント
 *
 * @param rooms ルーム一覧
 * @param selectedRoom 選択中のルーム
 * @param onSelectRoom ルーム選択ハンドラー
 */
export default function RoomList({
  rooms,
  selectedRoom,
  onSelectRoom,
}: {
  rooms: string[];
  selectedRoom?: string;
  onSelectRoom: (room: string) => void;
}) {
  return (
    <div className="bg-white h-full rounded-md text-slate-900 overflow-hidden flex flex-col">
      <div className="p-2 font-semibold bg-stone-100 w-full text-center">
        ルーム一覧
      </div>

      <div className="flex flex-col overflow-y-auto flex-grow min-h-[300px]">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 italic">
            ルームはまだありません
          </div>
        ) : (
          rooms.map((room: string) => (
            <button
              key={room}
              onClick={() => onSelectRoom(room)}
              className={`
                ${
                  selectedRoom === room
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100 text-black"
                }
                rounded-sm p-2 text-left transition flex items-center w-full
              `}>
              <span className="mr-2">#</span>
              <span className="truncate">{room}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
