"use client";

// ユーザーの型定義
type User = {
  id: string;
  name: string;
};

// Props型定義
type UserListProps = {
  users: User[];
};

/**
 * ユーザーリストコンポーネント
 * オンラインユーザーの一覧表示を提供
 *
 * @param users ユーザー一覧（IDと名前を含むオブジェクト）
 */
export default function UserList({ users }: UserListProps) {
  return (
    <div className="bg-card border rounded-md h-full overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="p-3 font-semibold bg-muted border-b text-center">
        <h2 className="text-sm font-medium">オンラインユーザー</h2>
      </div>

      {/* ユーザーリスト */}
      <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-grow">
        {users.length === 0 ? (
          <div className="text-center text-muted-foreground italic p-4">
            ユーザーがいません
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
              role="listitem">
              <div
                className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                aria-label="オンライン"
                role="status"
              />
              <div
                className="truncate font-medium text-foreground"
                title={user.name}>
                {user.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
