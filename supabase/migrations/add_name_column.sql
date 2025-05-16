-- name column migration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- 既存ユーザーのnameカラムを初期化（例：emailの@より前の部分を名前として使用）
UPDATE public.profiles SET name = SPLIT_PART(email, '@', 1) WHERE name IS NULL;
