-- 認証されたユーザーがすべてのチャットルームにアクセスできるようにするポリシーを追加

-- リアルタイムポリシーを更新して、認証されたユーザーがすべてのルームのブロードキャストを読めるようにする
DROP POLICY IF EXISTS "authenticated can read broadcast and presence state" ON "realtime"."messages";

CREATE POLICY "authenticated can read broadcast and presence state"
ON "realtime"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  -- 認証されたすべてのユーザーに broadcast と presence の読み取りを許可
  -- ルームトピックがユーザーがアクセスできるルームであること
  EXISTS (
    SELECT 1 
    FROM public.rooms
    WHERE rooms.topic = realtime.topic()
    AND realtime.messages.extension in ('broadcast', 'presence')
  )
);

-- メッセージの送信は、引き続きルームに参加しているユーザーのみ可能
DROP POLICY IF EXISTS "authenticated can send broadcast and track presence" ON "realtime"."messages";

CREATE POLICY "authenticated can send broadcast and track presence"
ON "realtime"."messages"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  -- ルームに参加しているユーザーのみブロードキャスト送信と presence 追跡を許可
  EXISTS (
    SELECT 1
    FROM public.rooms_users
    WHERE user_id = auth.uid()
    AND room_topic = realtime.topic()
    AND realtime.messages.extension in ('broadcast', 'presence')
  )
);

-- 認証されたすべてのユーザーがメッセージを閲覧できるように更新
DROP POLICY IF EXISTS "can read messages from joined rooms" ON "public"."messages";

CREATE POLICY "can read messages from all rooms"
ON "public"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  -- 認証されたすべてのユーザーがメッセージを閲覧可能
  TRUE
);

-- ルームへのメッセージ送信はルームに参加しているユーザーのみ可能（変更なし）
-- このポリシーはそのまま維持
