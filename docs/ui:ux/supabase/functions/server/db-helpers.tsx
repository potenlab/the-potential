/**
 * 더포텐셜 & 포텐메이커스 PostgreSQL DB 헬퍼
 * Supabase Client를 사용한 관계형 DB 쿼리
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// ========================================
// 타입 정의 (SQL 스키마와 일치)
// ========================================

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  
  // 직업 정보
  title_role: string | null;
  company_name: string | null;
  
  // 위치
  location_hub: string | null;
  
  // 창업 단계 & 직종
  entrepreneur_stage: string | null;
  categories: string[] | null;
  expertise: string[] | null;
  
  // 상태
  is_available: boolean;
  persona_title: string | null;
  is_admin: boolean;
  onboarding_done: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface UserBusiness {
  id: string;
  user_id: string;
  
  // 새로운 구조
  name: string | null;
  type: string | null;           // "STARTUP", "BUSINESS", "AGENCY"
  stage: string | null;           // "IDEA", "LAUNCH", "GROWTH" 등
  description: string | null;
  industry: string | null;
  founded_year: number | null;
  is_primary: boolean;
  
  // 레거시 필드 (호환성)
  category_id: string | null;
  stage_level: number | null;
  business_name: string | null;
  is_main: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface UserDevInfo {
  user_id: string;
  dev_level: number | null; // 1~5
  tech_stack: string[] | null;
  interest_ai: string[] | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserConnection {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserStats {
  following: number;
  followers: number;
  clubs: number;
}

// ========================================
// Supabase Admin Client 생성 헬퍼
// ========================================

export function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

export function getAnonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

// ========================================
// Profile CRUD
// ========================================

/**
 * 프로필 조회 (ID로)
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // 데이터가 없는 경우는 에러로 처리하지 않음
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('❌ 프로필 조회 에러:', error);
    return null;
  }

  return data;
}

/**
 * 프로필 조회 (이메일로)
 */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('❌ 프로필 조회 에러 (이메일):', error);
    return null;
  }

  return data;
}

/**
 * 프로필 조회 (Username으로)
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    // 데이터가 없는 경우는 에러로 처리하지 않음
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('❌ 프로필 조회 에러 (username):', error);
    return null;
  }

  return data;
}

/**
 * 프로필 업데이트
 * 참고: Trigger에서 자동으로 updated_at 업데이트됨
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    // 데이터가 없는 경우는 에러로 처리하지 않음
    if (error.code === 'PGRST116') {
      console.log('⚠️ 프로필이 존재하지 않습니다. userId:', userId);
      return null;
    }
    console.error('❌ 프로필 업데이트 에러:', error);
    return null;
  }

  return data;
}

/**
 * 온보딩 완료 처리
 */
export async function completeOnboarding(userId: string): Promise<boolean> {
  const result = await updateProfile(userId, { onboarding_done: true });
  return result !== null;
}

// ========================================
// UserBusiness CRUD
// ========================================

/**
 * 사업 정보 조회 (특정 유저)
 */
export async function getUserBusinesses(userId: string): Promise<UserBusiness[]> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_businesses')
    .select('*')
    .eq('user_id', userId)
    .order('is_main', { ascending: false }); // 주력 사업 먼저

  if (error) {
    console.error('❌ 사업 정보 조회 에러:', error);
    return [];
  }

  return data || [];
}

/**
 * 사업 정보 생성
 * 참고: Trigger에서 자동으로 persona_title 업데이트됨
 */
export async function createUserBusiness(
  business: Omit<UserBusiness, 'id' | 'created_at' | 'updated_at'>
): Promise<UserBusiness | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_businesses')
    .insert(business)
    .select()
    .single();

  if (error) {
    console.error('❌ 사업 정보 생성 에러:', error);
    return null;
  }

  return data;
}

/**
 * 여러 사업 정보 한번에 생성
 */
export async function createUserBusinesses(
  businesses: Omit<UserBusiness, 'id' | 'created_at' | 'updated_at'>[]
): Promise<UserBusiness[]> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_businesses')
    .insert(businesses)
    .select();

  if (error) {
    console.error('❌ 사업 정보 생성 에러 (다중):', error);
    return [];
  }

  return data || [];
}

/**
 * 사업 정보 업데이트
 */
export async function updateUserBusiness(
  businessId: string,
  updates: Partial<UserBusiness>
): Promise<UserBusiness | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    console.error('❌ 사업 정보 업데이트 에러:', error);
    return null;
  }

  return data;
}

/**
 * 사업 정보 삭제
 */
export async function deleteUserBusiness(businessId: string): Promise<boolean> {
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('user_businesses')
    .delete()
    .eq('id', businessId);

  if (error) {
    console.error('❌ 사업 정보 삭제 에러:', error);
    return false;
  }

  return true;
}

// ========================================
// UserDevInfo CRUD
// ========================================

/**
 * 개발자 정보 조회
 */
export async function getUserDevInfo(userId: string): Promise<UserDevInfo | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_dev_info')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // 데이터가 없는 경우는 에러로 처리하지 않음
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('❌ 개발자 정보 조회 에러:', error);
    return null;
  }

  return data;
}

/**
 * 개발자 정보 생성 또는 업데이트 (Upsert)
 * 참고: Trigger에서 자동으로 persona_title 업데이트됨
 */
export async function upsertUserDevInfo(
  devInfo: Omit<UserDevInfo, 'created_at' | 'updated_at'>
): Promise<UserDevInfo | null> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('user_dev_info')
    .upsert(devInfo, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('❌ 개발자 정보 생성/수정 에러:', error);
    return null;
  }

  return data;
}

/**
 * 개발자 정보 삭제
 */
export async function deleteUserDevInfo(userId: string): Promise<boolean> {
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('user_dev_info')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('❌ 개발자 정보 삭제 에러:', error);
    return false;
  }

  return true;
}

// ========================================
// 통합 데이터 조회
// ========================================

/**
 * 사용자의 모든 정보 한번에 조회
 */
export async function getFullUserData(userId: string) {
  const [profile, businesses, devInfo] = await Promise.all([
    getProfile(userId),
    getUserBusinesses(userId),
    getUserDevInfo(userId),
  ]);

  return {
    profile,
    businesses,
    devInfo,
  };
}

// ========================================
// 스테이지 설명 조회 (SQL Function 활용)
// ========================================

/**
 * SQL Function을 호출하여 스테이지 설명 가져오기
 */
export async function getStageDescription(
  category: string,
  stageLevel: number
): Promise<string> {
  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .rpc('get_stage_description', {
      category,
      stage_level: stageLevel
    });

  if (error) {
    console.error('❌ 스테이지 설명 조회 에러:', error);
    return `Stage ${stageLevel}`;
  }

  return data || `Stage ${stageLevel}`;
}

// ========================================
// UserConnection CRUD (팔로우/팔로잉)
// ========================================

/**
 * 팔로우하기
 */
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) {
    console.error('❌ 자기 자신을 팔로우할 수 없습니다');
    return false;
  }

  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('user_connections')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    console.error('❌ 팔로우 에러:', error);
    return false;
  }

  return true;
}

/**
 * 언팔로우하기
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('user_connections')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error('❌ 언팔로우 에러:', error);
    return false;
  }

  return true;
}

/**
 * 사용자 통계 조회 (팔로워/팔로잉 수)
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = getAdminClient();
  
  // 팔로잉 수
  const { count: followingCount } = await supabase
    .from('user_connections')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);
  
  // 팔로워 수
  const { count: followerCount } = await supabase
    .from('user_connections')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);
  
  return {
    following: followingCount || 0,
    followers: followerCount || 0,
    clubs: 0, // TODO: clubs 테이블 생성 후 구현
  };
}

/**
 * 사용자의 전체 데이터 조회 (통계 포함)
 */
export async function getFullUserDataWithStats(userId: string) {
  const [profile, businesses, devInfo, stats] = await Promise.all([
    getProfile(userId),
    getUserBusinesses(userId),
    getUserDevInfo(userId),
    getUserStats(userId),
  ]);

  return {
    profile,
    businesses,
    devInfo,
    stats,
  };
}