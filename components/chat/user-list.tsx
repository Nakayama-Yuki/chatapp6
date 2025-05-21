"use client";

/**
 * ユーザーリストコンポーネント
 *
 * @param users ユーザー一覧（名前とメールアドレスを含むオブジェクト）
 */
export default function UserList({
  users,
}: {
  users: { name: string; email: string }[];
}) {
  return (
    <div className="bg-white h-full rounded-md text-slate-900">
      <div className="p-2 font-semibold bg-stone-100 w-full text-center">
        オンラインユーザー
      </div>

      <div className="flex flex-col gap-1 p-2">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 italic p-2">
            ユーザーがいません
          </div>
        ) : (
          users.map((user) => (
            <div key={user.email} className="flex items-center gap-2 p-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="truncate" title={user.email}>
                {user.name || user.email}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
