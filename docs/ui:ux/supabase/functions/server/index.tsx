import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as db from "./db-helpers.tsx";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-user-id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b941327d/health", (c) => {
  return c.json({ status: "ok" });
});

// 🚨 개발용: 모든 사용자 삭제 엔드포인트 (프로덕션에서는 제거 필요)
app.post("/make-server-b941327d/dev/delete-all-users", async (c) => {
  try {
    console.log('🚨 [개발용] 모든 사용자 삭제 시작...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. 모든 사용자 목록 가져오기
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError);
      return c.json({ error: '사용자 목록 조회 중 오류가 발생했습니다' }, 500);
    }

    if (!users || users.users.length === 0) {
      console.log('✅ 삭제할 사용자가 없습니다');
      return c.json({ 
        success: true, 
        message: '삭제할 사용자가 없습니다',
        deletedCount: 0 
      });
    }

    console.log(`📋 총 ${users.users.length}명의 사용자를 삭제합니다...`);

    // 2. 각 사용자 삭제
    let deletedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const user of users.users) {
      try {
        // Supabase Auth에서 사용자 삭제
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ 사용자 삭제 실패 (${user.email}):`, deleteError);
          failedCount++;
          errors.push({ email: user.email, error: deleteError.message });
        } else {
          console.log(`✅ 사용자 삭제 성공: ${user.email}`);
          deletedCount++;
        }
      } catch (error: any) {
        console.error(`❌ 사용자 삭제 중 예외 (${user.email}):`, error);
        failedCount++;
        errors.push({ email: user.email, error: error.message });
      }
    }

    // 3. KV에서 이메일 인증 토큰들도 정리
    try {
      // getByPrefix로 모든 인증 토큰 조회 후 삭제
      const tokens = await kv.getByPrefix('email_verification:');
      if (tokens && tokens.length > 0) {
        for (const token of tokens) {
          await kv.del(token.key);
        }
        console.log(`✅ ${tokens.length}개의 인증 토큰 삭제 완료`);
      }
    } catch (error: any) {
      console.error('⚠️ 인증 토큰 삭제 중 오류 (계속 진행):', error);
    }

    console.log(`🎯 사용자 삭제 완료: 성공 ${deletedCount}명, 실패 ${failedCount}명`);

    return c.json({
      success: true,
      message: `${deletedCount}명의 사용자가 삭제되었습니다`,
      deletedCount,
      failedCount,
      errors: failedCount > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ 사용자 삭제 처리 중 오류:', error);
    return c.json({ error: error.message || '사용자 삭제 중 오류가 발생했습니다' }, 500);
  }
});

// 🎯 이메일 중복 체크 엔드포인트
app.post("/make-server-b941327d/check-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log('🔍 이메일 중복 체크:', email);

    // Supabase Admin Client로 사용자 목록 조회
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ 사용자 목록 조회 에러:', checkError);
      return c.json({ error: '이메일 확인 중 오류가 발생했습니다' }, 500);
    }

    const emailExists = existingUsers?.users.some(user => user.email === email);

    if (emailExists) {
      console.log('⚠️ 이미 존재하는 이메일:', email);
      return c.json({ 
        exists: true,
        message: '이미 등록된 이메일입니다.'
      });
    }

    console.log('✅ 사용 가능한 이메일:', email);
    return c.json({ 
      exists: false,
      message: '사용 가능한 이메일입니다.'
    });
  } catch (error: any) {
    console.error('❌ 이메일 체크 중 오류:', error);
    return c.json({ error: error.message || '이메일 체크 중 오류가 발생했습니다' }, 500);
  }
});

// Username 중복 체크 엔드포인트
app.post("/make-server-b941327d/check-username", async (c) => {
  try {
    const body = await c.req.json();
    const { username } = body;

    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    // username 형식 검증 (영문, 숫자, 언더스코어, 하이픈만 허용, 3-20자)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return c.json({ 
        available: false, 
        error: '아이 영문, 숫자, _, - 만 사용 가능하며 3-20자여야 합니다.' 
      }, 200);
    }

    console.log('🔍 Username 중복 체크:', username);

    // DB에서 username 중복 확인
    const existingProfile = await db.getProfileByUsername(username);

    if (existingProfile) {
      console.log('❌ Username 중복:', username);
      return c.json({ 
        available: false, 
        error: '이미 사용 중인 아이디입니다.' 
      });
    }

    console.log('✅ Username 사용 가능:', username);
    return c.json({ 
      available: true, 
      message: '사용 가능한 아이디입니다!' 
    });
  } catch (error: any) {
    console.error('❌ Username 체크 중 오류:', error);
    return c.json({ error: error.message || 'Username 체크 중 오류가 발생했습니다' }, 500);
  }
});

// 회원가입 엔드포인트
app.post("/make-server-b941327d/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, display_name, avatar_url, businesses, devInfo, location_hub } = body;

    if (!email || !display_name) {
      console.error('❌ 회원가입 실패: 필수 정보 누락');
      return c.json({ error: '이메일과 이름은 필수입니다' }, 400);
    }

    console.log('📝 회원가입 요청:', { email, display_name });

    // Supabase Admin Client 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 🔍 이메일 중복 체크 (먼저 확인)
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (!checkError && existingUsers) {
      const emailExists = existingUsers.users.some(user => user.email === email);
      if (emailExists) {
        console.log('⚠️ 이미 존재하는 이메일:', email);
        return c.json({ 
          error: '이미 등록된 이메일입니다. 로그인을 시도하거나 다른 이메일을 사용해주세요.',
          code: 'email_exists'
        }, 409);
      }
    }

    // 사용자 생성 (비밀번호 없이)
    const randomPassword = crypto.randomUUID(); // 임시 비밀번호 (사용 안 함)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword,
      user_metadata: { display_name },
      email_confirm: false, // Magic Link로 인증
    });

    if (error) {
      console.error('❌ Supabase 회원가입 에러:', error);
      
      // 이미 존재하는 이메일인 경우 (백업 체크)
      if (error.message.includes('already been registered') || error.code === 'email_exists') {
        return c.json({ 
          error: '이미 등록된 이메일입니다. 로그인을 시도하거나 다른 이메일을 사용해주세요.',
          code: 'email_exists'
        }, 409);
      }
      
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ Supabase 회원가입 성공:', data.user?.email);

    // 📧 이메일 인증 토큰 생성 및 발송
    const verificationToken = crypto.randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료
    
    // KV에 인증 토큰 저장
    await kv.set(`email_verification:${verificationToken}`, {
      userId: data.user.id,
      email: email,
      expiresAt: tokenExpiry.toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    console.log('📧 인증 토큰 생성:', verificationToken);
    
    // Resend로 인증 이메일 발송
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY가 설정되지 않았습니다');
        throw new Error('이메일 발송 설정이 되어 있지 않습니다');
      }

      const verificationUrl = `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-b941327d/verify-email?token=${verificationToken}`;
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'The Potential <onboarding@resend.dev>',
          to: [email],
          subject: '[The Potential] 이메일 인증을 완료해주세요 ✨',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 40px;
                  }
                  .logo {
                    font-size: 32px;
                    font-weight: 800;
                    color: #00E5FF;
                    margin-bottom: 16px;
                  }
                  .content {
                    background: #1A1A1A;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 24px;
                  }
                  .title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: #ffffff;
                  }
                  .message {
                    font-size: 16px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 32px;
                  }
                  .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
                    color: #000000;
                    text-decoration: none;
                    padding: 16px 48px;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
                  }
                  .footer {
                    text-align: center;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.6;
                  }
                  .footer a {
                    color: #00E5FF;
                    text-decoration: none;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">The Potential</div>
                  </div>
                  
                  <div class="content">
                    <div class="title">안녕하세요, ${display_name}님! 👋</div>
                    <div class="message">
                      <p><strong>The Potential</strong>에 가입해주셔서 감사합니다.</p>
                      <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
                      <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">이 링크는 24시간 동안 유효합니다.</p>
                    </div>
                    <div style="text-align: center;">
                      <a href="${verificationUrl}" class="button">이메일 인증하기</a>
                    </div>
                  </div>
                  
                  <div class="footer">
                    <p>버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p style="margin-top: 24px;">© 2026 The Potential. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('❌ Resend 이메일 발송 실패:', errorData);
        throw new Error('인증 이메일 발송에 실패했습니다');
      }

      const emailResult = await emailResponse.json();
      console.log('✅ 인증 이메일 발송 성공:', emailResult.id);
    } catch (emailError: any) {
      console.error('❌ 이메일 발송 중 오류:', emailError);
      // 이메일 발송 실패해도 회원가입은 성공으로 처리 (나중에 재발송 가능)
    }

    // 🎯 새로운 DB 구조로 데이터 저장
    // 참고: Trigger에서 자동으로 profiles 생성됨
    if (data.user) {
      const userId = data.user.id;

      // 1. 프로필 추가 정보 업데이트 (location_hub 등)
      const profileUpdates: any = {};
      if (location_hub) {
        profileUpdates.location_hub = location_hub;
      }
      if (avatar_url) {
        profileUpdates.avatar_url = avatar_url;
      }
      
      if (Object.keys(profileUpdates).length > 0) {
        await db.updateProfile(userId, profileUpdates);
        console.log('✅ 프로필 추가 정보 업데이트 완료');
      }

      // 2. 비즈니스 정보 저장 (있는 경우)
      if (businesses && Array.isArray(businesses) && businesses.length > 0) {
        const businessesToCreate = businesses.map((biz: any) => ({
          user_id: userId,
          category_id: biz.category_id,
          stage_level: biz.stage_level,
          is_main: biz.is_main ?? false,
          business_name: biz.business_name ?? null,
          description: biz.description ?? null,
        }));
        
        await db.createUserBusinesses(businessesToCreate);
        console.log('✅ 비즈니스 정보 저장 완료 (Trigger에서 persona_title 자동 업데이트됨)');
      }

      // 3. 개발자 정보 저장 (있는 경우)
      if (devInfo) {
        await db.upsertUserDevInfo({
          user_id: userId,
          dev_level: devInfo.dev_level ?? null,
          tech_stack: devInfo.tech_stack ?? null,
          interest_ai: devInfo.interest_ai ?? null,
          github_url: devInfo.github_url ?? null,
          portfolio_url: devInfo.portfolio_url ?? null,
        });
        console.log('✅ 개발자 정보 저장 완료 (Trigger에서 persona_title 자동 업데이트됨)');
      }

      // 4. 온보딩 완료 처리
      if (businesses?.length > 0 || devInfo) {
        await db.completeOnboarding(userId);
        console.log('✅ 온보딩 완료 처리');
      }
    }

    // 🎯 자동 로그인: 세션 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password: randomPassword,
    });

    if (sessionError) {
      console.error('❌ 자동 로그인 실패:', sessionError);
      return c.json({
        success: true,
        user: data.user,
        message: '회원가입이 완료되었습니다! 로그인해주세요.',
        needLogin: true,
      });
    }

    console.log('✅ 자동 로그인 성공:', sessionData.user?.email);

    // 전체 사용자 데이터 조회
    const fullUserData = await db.getFullUserData(data.user.id);

    return c.json({
      success: true,
      user: sessionData.user,
      session: sessionData.session,
      profile: fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      message: '회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요. 📧',
      needEmailVerification: true,
      needLogin: false,
    });
  } catch (error: any) {
    console.error('❌ 회원가입 처리 중 오류:', error);
    return c.json({ error: error.message || '회원가입 중 오류가 발생했습니다' }, 500);
  }
});

// 로그인 엔드포인트
app.post("/make-server-b941327d/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      console.error('❌ 로그인 실패: 이메일 또는 비밀번호 누락');
      return c.json({ error: '이메일과 비밀번호는 필수입니다' }, 400);
    }

    console.log('🔐 로그인 요청:', { email });

    // Supabase Client 생성 (일반 사용자 로그인용)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // 이메일/비밀번호로 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase 로그인 에러:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ 로그인 성공:', data.user?.email);

    // 전체 사용자 데이터 조회 (새로운 DB 구조)
    const fullUserData = await db.getFullUserData(data.user.id);

    return c.json({
      success: true,
      session: data.session,
      user: data.user,
      profile: fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      message: '로그인이 완료되었습니다!',
    });
  } catch (error: any) {
    console.error('❌ 로그인 처리 중 오류:', error);
    return c.json({ error: error.message || '로그인 중 오류가 발생했습니다' }, 500);
  }
});

// 프로필 업데이트 엔드포인트 (프로필 등록 4단계용)
app.post("/make-server-b941327d/update-profile", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, username, jobTitle, company, locationHub, category, stage } = body;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    console.log('🔧 프로필 업데이트 요청:', { userId, username, jobTitle, company });

    // 1. profiles 테이블 업데이트
    const profileUpdates: any = {};
    
    if (username) profileUpdates.username = username;
    if (jobTitle) profileUpdates.job_title = jobTitle;
    if (locationHub) profileUpdates.location_hub = locationHub;
    
    if (Object.keys(profileUpdates).length > 0) {
      const updatedProfile = await db.updateProfile(userId, profileUpdates);
      console.log('✅ 프로필 기본 정보 업데이트 완료');
    }

    // 2. user_businesses 테이블 업데이트 (있는 경우)
    if (category && stage !== undefined) {
      // 기존 비즈니스 정보 삭제 후 새로 생성
      const existingBusinesses = await db.getUserBusinesses(userId);
      
      if (existingBusinesses.length > 0) {
        // 기존 것 업데이트
        await db.updateUserBusiness(existingBusinesses[0].id, {
          category_id: category,
          stage_level: stage,
          business_name: company || null,
          is_main: true,
        });
      } else {
        // 새로 생성
        await db.createUserBusiness({
          user_id: userId,
          category_id: category,
          stage_level: stage,
          business_name: company || null,
          is_main: true,
        });
      }
      console.log('✅ 비즈니스 정보 업데이트 완료');
    }

    // 3. 온보딩 완료 처리
    await db.completeOnboarding(userId);
    console.log('✅ 온보딩 완료 처리');

    // 4. 업데이트된 전체 데이터 조회
    const fullUserData = await db.getFullUserData(userId);

    return c.json({
      success: true,
      profile: fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      message: '프로필이 성공적으로 업데이트되었습니다!',
    });
  } catch (error: any) {
    console.error('❌ 프로필 업데이트 중 오류:', error);
    return c.json({ error: error.message || '프로필 업데이트 중 오류가 발생했습니다' }, 500);
  }
});

// 프로필 조회 엔드포인트 (GET)
app.get("/make-server-b941327d/profile", async (c) => {
  try {
    // 헤더에서 사용자 ID 가져오기
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    console.log('🔍 프로필 조회 요청:', { userId });

    // 전체 사용자 데이터 조회 (통계 포함)
    const fullUserData = await db.getFullUserDataWithStats(userId);

    // 프로필이 없으면 빈 데이터 반환 (404 대신 200)
    if (!fullUserData.profile) {
      console.log('⚠️ 프로필이 아직 생성되지 않음:', userId);
      return c.json({
        success: true,
        profile: null,
        businesses: [],
        devInfo: null,
        stats: { following: 0, followers: 0, clubs: 0 },
      });
    }

    console.log('✅ 프로필 조회 성공');

    return c.json({
      success: true,
      ...fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      stats: fullUserData.stats,
    });
  } catch (error: any) {
    console.error('❌ 프로필 조회 중 오류:', error);
    return c.json({ error: error.message || '프로필 조회 중 오류가 발생했습니다' }, 500);
  }
});

// 🎯 프로필 저장/업데이트 엔드포인트 (POST)
app.post("/make-server-b941327d/profile", async (c) => {
  try {
    const userId = c.req.header('x-user-id');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const body = await c.req.json();
    console.log('💾 프로필 저장 요청:', { userId, body });

    // profiles 테이블 업데이트할 필드 추출
    const profileUpdates: any = {};
    
    if (body.display_name !== undefined) profileUpdates.display_name = body.display_name;
    if (body.email !== undefined) profileUpdates.email = body.email;
    if (body.title_role !== undefined) profileUpdates.title_role = body.title_role;
    if (body.company_name !== undefined) profileUpdates.company_name = body.company_name;
    if (body.location_hub !== undefined) profileUpdates.location_hub = body.location_hub;
    if (body.avatar_url !== undefined) profileUpdates.avatar_url = body.avatar_url;
    if (body.bio !== undefined) profileUpdates.bio = body.bio;
    if (body.entrepreneur_stage !== undefined) profileUpdates.entrepreneur_stage = body.entrepreneur_stage;
    if (body.categories !== undefined) profileUpdates.categories = body.categories;
    if (body.expertise !== undefined) profileUpdates.expertise = body.expertise;
    if (body.is_available !== undefined) profileUpdates.is_available = body.is_available;
    if (body.username !== undefined) profileUpdates.username = body.username;

    // 프로필 업데이트
    const updatedProfile = await db.updateProfile(userId, profileUpdates);

    if (!updatedProfile) {
      console.error('❌ 프로필 업데이트 실패');
      return c.json({ error: '프로필 업데이트에 실패했습니다' }, 500);
    }

    console.log('✅ 프로필 저장 성공');

    // 온보딩 완료 처리
    if (body.entrepreneur_stage || body.categories?.length > 0) {
      await db.completeOnboarding(userId);
      console.log('✅ 온보딩 완료 처리');
    }

    // 업데이트된 전체 데이터 조회
    const fullUserData = await db.getFullUserDataWithStats(userId);

    return c.json({
      success: true,
      profile: fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      stats: fullUserData.stats,
      message: '프로필이 저장되었습니다!',
    });
  } catch (error: any) {
    console.error('❌ 프로필 저장 중 오류:', error);
    return c.json({ error: error.message || '프로필 저장 중 오류가 발생했습니다' }, 500);
  }
});

// 🎯 OAuth 로그인 사용자 동기화 엔드포인트
app.post("/make-server-b941327d/sync-oauth-user", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, displayName, avatarUrl } = body;

    if (!userId || !email) {
      return c.json({ error: 'User ID and email are required' }, 400);
    }

    console.log('🔄 OAuth 사용자 동기화 시작:', { userId, email, displayName });

    // 1. 이미 프로필이 있는지 확인
    const existingProfile = await db.getProfile(userId);

    if (existingProfile) {
      console.log('✅ 이미 프로필이 존재함:', userId);
      // 프로필이 이미 있으면 전체 데이터 반환
      const fullUserData = await db.getFullUserData(userId);
      return c.json({
        success: true,
        profile: fullUserData.profile,
        businesses: fullUserData.businesses,
        devInfo: fullUserData.devInfo,
        message: '기존 프로필을 찾았습니다.',
        isNewUser: false,
      });
    }

    console.log('🆕 새로운 OAuth 사용자 - 프로필 생성 중...');

    // 2. 새로운 프로필 생성 (Trigger가 자동으로 생성했을 수 있으므로 upsert 개념으로)
    const profileUpdates: any = {
      display_name: displayName || email.split('@')[0],
    };

    if (avatarUrl) {
      profileUpdates.avatar_url = avatarUrl;
    }

    await db.updateProfile(userId, profileUpdates);
    console.log('✅ OAuth 사용자 프로필 생성 완료');

    // 3. 전�� 사용자 데이터 조회
    const fullUserData = await db.getFullUserData(userId);

    return c.json({
      success: true,
      profile: fullUserData.profile,
      businesses: fullUserData.businesses,
      devInfo: fullUserData.devInfo,
      message: 'OAuth 사용자 프로필이 생성되었습니다.',
      isNewUser: true,
    });
  } catch (error: any) {
    console.error('❌ OAuth 사용자 동기화 중 오류:', error);
    return c.json({ error: error.message || 'OAuth 사용자 동기화 중 오류가 발생했습니다' }, 500);
  }
});

// 📧 이메일 인증 엔드포인트
app.get("/make-server-b941327d/verify-email", async (c) => {
  try {
    const token = c.req.query('token');

    if (!token) {
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>인증 토큰이 없습니다</h1>
              <p>올바른 인증 링크를 사용해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('📧 이메일 인증 시도:', token);

    // KV에서 토큰 정보 조회
    const tokenData = await kv.get(`email_verification:${token}`);

    if (!tokenData) {
      console.log('❌ 유효하지 않은 토큰:', token);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
                max-width: 500px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1>인증 링크가 만료되었습니다</h1>
              <p>인증 링크가 만료되었거나 이미 사용되었습니다.<br>로그인 후 인증 이메일을 재발송해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 토큰 만료 확인
    const expiresAt = new Date(tokenData.expiresAt);
    if (expiresAt < new Date()) {
      console.log('❌ 만료된 토큰:', token);
      await kv.del(`email_verification:${token}`);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
                max-width: 500px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1>인증 링크가 만료되었습니다</h1>
              <p>인증 링크 유효기간(24시간)이 지났습니다.<br>로그인 후 인증 이메일을 재발송해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Supabase Auth에서 이메일 확인 처리
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error } = await supabase.auth.admin.updateUserById(
      tokenData.userId,
      { email_confirm: true }
    );

    if (error) {
      console.error('❌ 이메일 인증 처리 실패:', error);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>인증 처리 중 오류가 발생했습니다</h1>
              <p>잠시 후 다시 시도해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 토큰 삭제 (재사용 방지)
    await kv.del(`email_verification:${token}`);

    console.log('✅ 이메일 인증 완료:', tokenData.email);

    // 성공 페이지 표시 (자동으로 앱으로 리다이렉트)
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>인증 완료 - The Potential</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
              animation: bounce 1s ease-in-out infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
              background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 16px;
              color: rgba(255,255,255,0.7);
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
              color: #000;
              text-decoration: none;
              padding: 16px 48px;
              border-radius: 16px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>이메일 인증이 완료되었습니다!</h1>
            <p>
              환영합니다, ${tokenData.email}님!<br>
              이제 The Potential의 모든 기능을 사용하실 수 있습니다.
            </p>
            <a href="/" class="button">앱으로 이동하기</a>
          </div>
          <script>
            // 3초 후 자동으로 앱으로 이동
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('❌ 이메일 인증 처리 중 오류:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>인증 실패 - The Potential</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              color: rgba(255,255,255,0.7);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>인증 처리 중 오류가 발생했습니다</h1>
            <p>${error.message}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// 📧 인증 이메일 재발송 엔드포인트
app.post("/make-server-b941327d/resend-verification", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: '이메일은 필수입니다' }, 400);
    }

    console.log('📧 인증 이메일 재발송 요청:', email);

    // Supabase에서 사용자 찾기
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError);
      return c.json({ error: '사용자 조회 중 오류가 발생했습니다' }, 500);
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', email);
      return c.json({ error: '해당 이메일로 등록된 사용자가 없습니다' }, 404);
    }

    // 이미 인증된 사용자인지 확인
    if (user.email_confirmed_at) {
      console.log('⚠️ 이미 인증된 사용자:', email);
      return c.json({ 
        success: true,
        message: '이미 인증이 완료된 계정입니다',
        alreadyVerified: true 
      });
    }

    // 새로운 인증 토큰 생성
    const verificationToken = crypto.randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await kv.set(`email_verification:${verificationToken}`, {
      userId: user.id,
      email: email,
      expiresAt: tokenExpiry.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Resend로 인증 이메일 발송
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY가 설정되지 않았습니다');
      return c.json({ error: '이메일 발송 설정이 되어 있지 않습니다' }, 500);
    }

    const verificationUrl = `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-b941327d/verify-email?token=${verificationToken}`;
    const displayName = user.user_metadata?.display_name || email.split('@')[0];
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Potential <onboarding@resend.dev>',
        to: [email],
        subject: '[The Potential] 이메일 인증을 완료해주세요 ✨',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;
                  background-color: #000000;
                  color: #ffffff;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 40px;
                }
                .logo {
                  font-size: 32px;
                  font-weight: 800;
                  color: #00E5FF;
                  margin-bottom: 16px;
                }
                .content {
                  background: #1A1A1A;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 24px;
                  padding: 40px;
                  margin-bottom: 24px;
                }
                .title {
                  font-size: 24px;
                  font-weight: 700;
                  margin-bottom: 16px;
                  color: #ffffff;
                }
                .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: rgba(255, 255, 255, 0.7);
                  margin-bottom: 32px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
                  color: #000000;
                  text-decoration: none;
                  padding: 16px 48px;
                  border-radius: 16px;
                  font-weight: 700;
                  font-size: 16px;
                  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
                }
                .footer {
                  text-align: center;
                  font-size: 14px;
                  color: rgba(255, 255, 255, 0.5);
                  line-height: 1.6;
                }
                .footer a {
                  color: #00E5FF;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">The Potential</div>
                </div>
                
                <div class="content">
                  <div class="title">안녕하세요, ${displayName}님! 👋</div>
                  <div class="message">
                    <p><strong>The Potential</strong> 인증 이메일이 재발송되었습니다.</p>
                    <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
                    <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">이 링크는 24시간 동안 유효합니다.</p>
                  </div>
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">이메일 인증하기</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p>버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
                  <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                  <p style="margin-top: 24px;">© 2026 The Potential. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('❌ Resend 이메일 발송 실패:', errorData);
      return c.json({ error: '인증 이메일 발송에 실패했습니다' }, 500);
    }

    const emailResult = await emailResponse.json();
    console.log('✅ 인증 이메일 재발송 성공:', emailResult.id);

    return c.json({
      success: true,
      message: '인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.',
    });
  } catch (error: any) {
    console.error('❌ 인증 이메일 재발송 중 오류:', error);
    return c.json({ error: error.message || '인증 이메일 재발송 중 오류가 발생했습니다' }, 500);
  }
});

// 🔐 Magic Link 발송 엔드포인트
app.post("/make-server-b941327d/send-magic-link", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: '이메일은 필수입니다' }, 400);
    }

    console.log('🔐 인증번호 발송 요청:', email);

    // Supabase Admin Client로 사용자 확인
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 사용자가 존재하는지 확인
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ 사용자 목록 조회 실패:', checkError);
      return c.json({ error: '사용자 확인 중 오류가 발생했습니다' }, 500);
    }

    const userExists = existingUsers?.users.some(user => user.email === email);

    if (!userExists) {
      console.log('⚠️ 존재하지 않는 이메일:', email);
      // 보안상 존재하지 않는 이메일이라도 동일한 메시지 반환
      return c.json({ 
        success: true,
        message: '인증번호를 이메일로 발송했습니다. 이메일을 확인해주세요.',
      });
    }

    // 사용자 정보 가져오기
    const user = existingUsers?.users.find(u => u.email === email);
    
    if (!user) {
      return c.json({ error: '사용자를 찾을 수 없습니다' }, 404);
    }

    // 6자리 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료
    
    // KV에 인증번호 저장
    await kv.set(`verification_code:${email}`, {
      code: verificationCode,
      userId: user.id,
      email: email,
      expiresAt: tokenExpiry.toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    console.log('🔐 인증번호 생성:', verificationCode, '이메일:', email);
    
    // Resend로 인증번호 이메일 발송
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY가 설정되지 않았습니다');
        throw new Error('이메일 발송 설정이 되어 있지 않습니다');
      }

      console.log('📧 인증번호 이메일 발송 시도:', { email, verificationCode });
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'The Potential <onboarding@resend.dev>',
          to: [email],
          subject: '[The Potential] 로그인 인증번호가 도착했습니다 🔐',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 40px;
                  }
                  .logo {
                    font-size: 32px;
                    font-weight: 800;
                    color: #00E5FF;
                    margin-bottom: 16px;
                  }
                  .content {
                    background: #1A1A1A;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 24px;
                  }
                  .title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: #ffffff;
                  }
                  .message {
                    font-size: 16px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 32px;
                  }
                  .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
                    color: #000000;
                    text-decoration: none;
                    padding: 16px 48px;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
                  }
                  .footer {
                    text-align: center;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.6;
                  }
                  .footer a {
                    color: #00E5FF;
                    text-decoration: none;
                  }
                  .warning {
                    background: rgba(255, 200, 0, 0.1);
                    border: 1px solid rgba(255, 200, 0, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 24px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">The Potential</div>
                  </div>
                  
                  <div class="content">
                    <div class="title">안녕하세요! 👋</div>
                    <div class="message">
                      <p><strong>The Potential</strong> 로그인 요청이 있었습니다.</p>
                      <p>아래 인증번호를 입력하여 로그인해주세요.</p>
                    </div>
                    <div style="text-align: center; margin: 32px 0;">
                      <div style="background: rgba(0, 229, 255, 0.1); border: 2px solid #00E5FF; border-radius: 16px; padding: 24px; display: inline-block;">
                        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">인증번호</div>
                        <div style="font-size: 48px; font-weight: 800; color: #00E5FF; letter-spacing: 8px; font-family: 'Monaco', 'Courier New', monospace;">${verificationCode}</div>
                      </div>
                    </div>
                    <div class="warning">
                      ⏰ 이 인증번호는 15분 동안 유효합니다.<br>
                      🔐 본인이 요청하지 않았다면 이 이메일을 무시해주세요.
                    </div>
                  </div>
                  
                  <div class="footer">
                    <p>© 2026 The Potential. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('❌ Resend 이메일 발송 실패:', { status: emailResponse.status, error: errorData });
        return c.json({ error: '인증번호 발송에 실패했습니다', details: errorData }, 500);
      }

      const emailResult = await emailResponse.json();
      console.log('✅ 인증번호 이메일 발송 성공:', { emailId: emailResult.id, to: email, code: verificationCode });

      return c.json({
        success: true,
        message: '인증번호를 이메일로 발송했습니다. 이메일을 확인해주세요.',
      });
    } catch (emailError: any) {
      console.error('❌ 이메일 발송 중 오류:', emailError);
      return c.json({ error: '인증번호 발송에 실패했습니다' }, 500);
    }
  } catch (error: any) {
    console.error('❌ 인증번호 발송 처리 중 오류:', error);
    return c.json({ error: error.message || '인증번호 발송 중 오류가 발생했습니다' }, 500);
  }
});

// 🔐 Magic Link 인증 엔드포인트
app.get("/make-server-b941327d/verify-magic-link", async (c) => {
  try {
    const token = c.req.query('token');

    if (!token) {
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>인증 토큰이 없습니다</h1>
              <p>올바른 로그인 링크를 사용해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('🔐 Magic Link 인증 시도:', token);

    // KV에서 토큰 정보 조회
    const tokenData = await kv.get(`magic_link:${token}`);

    if (!tokenData) {
      console.log('❌ 유효하지 않은 토큰:', token);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
                max-width: 500px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1>로그인 링크가 만료되었습니다</h1>
              <p>로그인 링크가 만료되었거나 이미 사용되었습니다.<br>새로운 로그인 링크를 요청해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 토큰 만료 확인
    const expiresAt = new Date(tokenData.expiresAt);
    if (expiresAt < new Date()) {
      console.log('❌ 만료된 토큰:', token);
      await kv.del(`magic_link:${token}`);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>인증 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
                max-width: 500px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1>로그인 링크가 만료되었습니다</h1>
              <p>로그인 링크 유효기간(15분)이 지났습니다.<br>새로운 로그인 링크를 요청해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Supabase Admin으로 세션 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 임시 비밀번호로 비밀번호 재설정
    const tempPassword = crypto.randomUUID();
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.userId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('❌ 사용자 비밀번호 업데이트 실패:', updateError);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>로그인 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>로그인 처리 실패</h1>
              <p>로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 클라이언트로 로그인
    const clientSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: sessionData, error: signInError } = await clientSupabase.auth.signInWithPassword({
      email: tokenData.email,
      password: tempPassword,
    });

    if (signInError || !sessionData.session) {
      console.error('❌ 세션 생성 실패:', signInError);
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>로그인 실패 - The Potential</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 24px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                color: rgba(255,255,255,0.7);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>세션 생성 실패</h1>
              <p>로그인 세션 생성에 실패했습니다. 다시 시도해주세요.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 토큰 삭제 (일회성)
    await kv.del(`magic_link:${token}`);
    console.log('✅ Magic Link 인증 성공:', tokenData.email);

    // 성공 페이지 반환 및 세션 정보를 쿠키로 전달
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>로그인 성공 - The Potential</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 500px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
              animation: bounce 1s ease-in-out infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
              background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 16px;
              color: rgba(255,255,255,0.7);
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
              color: #000;
              text-decoration: none;
              padding: 16px 48px;
              border-radius: 16px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>로그인 성공!</h1>
            <p>
              환영합니다, ${tokenData.email}님!<br>
              잠시 후 자동으로 앱으로 이동합니다.
            </p>
            <a href="/" class="button">앱으로 이동하기</a>
          </div>
          <script>
            // 세션 정보를 localStorage에 저장
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: '${sessionData.session.access_token}',
              refresh_token: '${sessionData.session.refresh_token}',
              expires_at: ${sessionData.session.expires_at},
              user: ${JSON.stringify(sessionData.user)}
            }));
            
            // 1초 후 자동으로 앱으로 이동
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('❌ Magic Link 인증 처리 중 오류:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>인증 실패 - The Potential</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              color: rgba(255,255,255,0.7);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>인증 처리 실패</h1>
            <p>오류: ${error.message}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// 🔐 인증번호 검증 API 엔드포인트
app.post("/make-server-b941327d/verify-code", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code } = body;

    if (!email || !code) {
      return c.json({ error: '이메일과 인증번호가 필요합니다' }, 400);
    }

    console.log('🔐 인증번호 검증 시도:', { email, code });

    // KV에서 인증번호 조회
    const codeData = await kv.get(`verification_code:${email}`);

    if (!codeData) {
      console.log('❌ 유효하지 않은 인증번호:', { email, code });
      return c.json({ error: '유효하지 않거나 만료된 인증번호입니다' }, 404);
    }

    // 인증번호 일치 확인
    if (codeData.code !== code) {
      console.log('❌ 인증번호 불일치:', { expected: codeData.code, received: code });
      return c.json({ error: '인증번호가 일치하지 않습니다' }, 401);
    }

    // 만료 시간 확인
    const expiresAt = new Date(codeData.expiresAt);
    if (expiresAt < new Date()) {
      console.log('❌ 만료된 인증번호:', { email, code });
      await kv.del(`verification_code:${email}`);
      return c.json({ error: '만료된 인증번호입니다. 새로 요청해주세요.' }, 410);
    }

    // Supabase Admin Client로 사용자 정보 조회
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(codeData.userId);

    if (userError || !user) {
      console.error('❌ 사용자 조회 실패:', userError);
      return c.json({ error: '사용자를 찾을 수 없습니다' }, 404);
    }

    // 임시 비밀번호 생성 (32자리 랜덤)
    const tempPassword = crypto.randomUUID() + crypto.randomUUID();
    
    // 사용자 비밀번호를 임시 비밀번호로 업데이트
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('❌ 비밀번호 업데이트 실패:', updateError);
      return c.json({ error: '로그인 처리에 실패했습니다' }, 500);
    }

    console.log('✅ 임시 비밀번호 설정 완료');

    // 인증번호 삭제 (일회성)
    await kv.del(`verification_code:${email}`);
    console.log('✅ 인증번호 검증 성공:', email);

    // 임시 비밀번호 반환 (프론트에서 자동 로그인에 사용)
    return c.json({
      success: true,
      email: email,
      tempPassword: tempPassword,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('❌ 인증번호 검증 중 오류:', error);
    return c.json({ error: error.message || '인증 중 오류가 발생했습니다' }, 500);
  }
});

Deno.serve(app.fetch);