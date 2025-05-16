-- ユーザートリガー関数を更新して名前フィールドをサポート
CREATE OR REPLACE FUNCTION insert_user() RETURNS TRIGGER AS
$$
  BEGIN
    -- raw_user_meta_dataから名前情報を取得
    INSERT INTO public.profiles (id, email, name) 
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        (NEW.raw_user_meta_data->>'name')::TEXT,
        SPLIT_PART(NEW.email, '@', 1)
      )
    ); 
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public;
