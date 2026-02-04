# 더포텐셜 DB 마이그레이션 가이드

## 🎯 Supabase SQL Editor에서 실행해주세요

이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요.

```sql
-- ==========================================
-- 1. profiles 테이블 컬럼 추가
-- ==========================================

-- 기본 프로필 정보 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS title_role TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS entrepreneur_stage TEXT,
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS expertise JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- job_title이 있다면 title_role로 통합
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'job_title'
  ) THEN
    UPDATE profiles SET title_role = job_title WHERE job_title IS NOT NULL AND title_role IS NULL;
  END IF;
END $$;

-- ==========================================
-- 2. user_businesses 테이블 구조 개선
-- ==========================================

-- user_businesses 테이블이 있다면 컬럼 추가
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_businesses') THEN
    ALTER TABLE user_businesses 
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS type TEXT,
    ADD COLUMN IF NOT EXISTS stage TEXT,
    ADD COLUMN IF NOT EXISTS industry TEXT,
    ADD COLUMN IF NOT EXISTS founded_year INTEGER,
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
    
    -- 기존 category_id -> type 마이그레이션
    UPDATE user_businesses 
    SET type = category_id 
    WHERE type IS NULL AND category_id IS NOT NULL;
    
    -- 기존 business_name -> name 마이그레이션
    UPDATE user_businesses 
    SET name = business_name 
    WHERE name IS NULL AND business_name IS NOT NULL;
    
    -- 기존 is_main -> is_primary 마이그레이션
    UPDATE user_businesses 
    SET is_primary = is_main 
    WHERE is_main IS NOT NULL;
  END IF;
END $$;

-- ==========================================
-- 3. user_connections 테이블 생성 (팔로우/팔로잉)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_connections (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  
  -- 자기 자신을 팔로우하지 못하도록
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_connections_following ON user_connections(following_id);

-- ==========================================
-- 4. 통계 계산을 위한 함수
-- ==========================================

-- 팔로워 수 계산
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_connections
  WHERE following_id = user_id;
$$;

-- 팔로잉 수 계산
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_connections
  WHERE follower_id = user_id;
$$;

-- ==========================================
-- 5. RLS (Row Level Security) 설정
-- ==========================================

-- profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 프로필 읽기 가능
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- user_connections 테이블 RLS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- 모든 연결 정보 읽기 가능
CREATE POLICY "Connections are viewable by everyone"
ON user_connections FOR SELECT
USING (true);

-- 자신의 팔로우만 추가/삭제 가능
CREATE POLICY "Users can manage own follows"
ON user_connections FOR ALL
USING (auth.uid() = follower_id);

-- ==========================================
-- 완료!
-- ==========================================

SELECT '✅ 마이그레이션 완료!' as status;
```

## 📝 실행 후 확인사항

1. Supabase Dashboard > Table Editor에서 `profiles` 테이블 확인
2. 새로운 컬럼들이 추가되었는지 확인:
   - bio
   - title_role
   - company_name
   - entrepreneur_stage
   - categories (JSONB)
   - expertise (JSONB)
   - is_available

3. `user_connections` 테이블이 생성되었는지 확인

## 🚨 문제 발생 시

만약 특정 컬럼이 이미 존재한다는 에러가 나면, 해당 라인을 제거하고 다시 실행하세요.
