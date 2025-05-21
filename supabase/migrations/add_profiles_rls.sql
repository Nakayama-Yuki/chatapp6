-- プロフィールのアクセス制御ポリシーを追加

-- 自分のプロフィールを読み取り可能にするポリシー
CREATE POLICY "Users can view own profile"
ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 自分のプロフィールを更新可能にするポリシー
CREATE POLICY "Users can update own profile"
ON "public"."profiles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
