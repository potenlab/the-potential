-- =============================================================================
-- Seed file for The Potential Platform
-- Comprehensive dummy data for all tables
-- =============================================================================
-- Users:
-- 1. user@potential.com (id: a1b2c3d4-e5f6-4789-abcd-111111111111) - member role
-- 2. admin@potential.com (id: a1b2c3d4-e5f6-4789-abcd-222222222222) - admin role
-- 3. expert1@potential.com (id: a1b2c3d4-e5f6-4789-abcd-333333333333) - expert role
-- 4. expert2@potential.com (id: a1b2c3d4-e5f6-4789-abcd-444444444444) - expert role
-- 5. member2@potential.com (id: a1b2c3d4-e5f6-4789-abcd-555555555555) - member role
-- 6. pending@potential.com (id: a1b2c3d4-e5f6-4789-abcd-666666666666) - pending member
-- Password for all: password123
-- =============================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- CLEANUP: Remove existing seed data if re-running
-- =============================================================================
DO $$
BEGIN
  -- Delete existing test users if they exist
  DELETE FROM auth.users WHERE email IN (
    'user@potential.com',
    'admin@potential.com',
    'expert1@potential.com',
    'expert2@potential.com',
    'member2@potential.com',
    'pending@potential.com'
  );
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- =============================================================================
-- CREATE AUTH USERS
-- =============================================================================

-- User 1: Regular Member (user@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'user@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Sample User"}',
  FALSE,
  NOW() - INTERVAL '30 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- User 2: Admin (admin@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'admin@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  FALSE,
  NOW() - INTERVAL '60 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- User 3: Expert 1 - Marketing (expert1@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'expert1@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Kim Marketing Expert"}',
  FALSE,
  NOW() - INTERVAL '45 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- User 4: Expert 2 - Development (expert2@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'expert2@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Park Development Expert"}',
  FALSE,
  NOW() - INTERVAL '40 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- User 5: Member 2 (member2@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'member2@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Lee Startup Founder"}',
  FALSE,
  NOW() - INTERVAL '20 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- User 6: Pending Member (pending@potential.com)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  role
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-666666666666',
  '00000000-0000-0000-0000-000000000000',
  'pending@potential.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Choi New Applicant"}',
  FALSE,
  NOW() - INTERVAL '2 days',
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL,
  FALSE,
  'authenticated'
);

-- =============================================================================
-- CREATE AUTH IDENTITIES (Required for email/password login)
-- =============================================================================

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-111111111111',
    'email', 'user@potential.com',
    'email_verified', true
  ),
  'email',
  'user@potential.com',
  NOW(),
  NOW() - INTERVAL '30 days',
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-222222222222',
    'email', 'admin@potential.com',
    'email_verified', true
  ),
  'email',
  'admin@potential.com',
  NOW(),
  NOW() - INTERVAL '60 days',
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-333333333333',
    'email', 'expert1@potential.com',
    'email_verified', true
  ),
  'email',
  'expert1@potential.com',
  NOW(),
  NOW() - INTERVAL '45 days',
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-444444444444',
    'email', 'expert2@potential.com',
    'email_verified', true
  ),
  'email',
  'expert2@potential.com',
  NOW(),
  NOW() - INTERVAL '40 days',
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-555555555555',
    'email', 'member2@potential.com',
    'email_verified', true
  ),
  'email',
  'member2@potential.com',
  NOW(),
  NOW() - INTERVAL '20 days',
  NOW()
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-666666666666',
  'a1b2c3d4-e5f6-4789-abcd-666666666666',
  jsonb_build_object(
    'sub', 'a1b2c3d4-e5f6-4789-abcd-666666666666',
    'email', 'pending@potential.com',
    'email_verified', true
  ),
  'email',
  'pending@potential.com',
  NOW(),
  NOW() - INTERVAL '2 days',
  NOW()
);

-- =============================================================================
-- CREATE USER PROFILES
-- =============================================================================

-- Profile 1: Regular member (user@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  network_count,
  expertise,
  skills,
  collaboration_needs,
  experience,
  portfolio_links,
  created_at,
  updated_at,
  last_active_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'user@potential.com',
  'Sample User',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  '+82-10-1234-5678',
  'Sample Startup Inc.',
  'Founder & CEO',
  'A passionate entrepreneur building innovative solutions for the Korean market. Focused on EdTech and sustainable business models.',
  'Seoul, South Korea',
  'member',
  'approved',
  75,
  5,
  ARRAY['technology', 'startups', 'innovation', 'edtech'],
  ARRAY['leadership', 'product-management', 'fundraising', 'pitching'],
  '[{"type": "marketing", "description": "Looking for digital marketing expertise"}, {"type": "development", "description": "Need mobile app development partner"}]'::jsonb,
  '[{"title": "Founder & CEO", "company": "Sample Startup Inc.", "startDate": "2023-01", "endDate": null, "description": "Building EdTech solutions"}, {"title": "Product Manager", "company": "Tech Corp", "startDate": "2020-03", "endDate": "2022-12", "description": "Led product development for B2B SaaS"}]'::jsonb,
  '[{"title": "LinkedIn", "url": "https://linkedin.com/in/sampleuser"}, {"title": "Personal Website", "url": "https://sampleuser.com"}]'::jsonb,
  NOW() - INTERVAL '30 days',
  NOW(),
  NOW() - INTERVAL '1 hour'
);

-- Profile 2: Admin (admin@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  network_count,
  expertise,
  skills,
  created_at,
  updated_at,
  last_active_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  'admin@potential.com',
  'Admin User',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  '+82-10-9876-5432',
  'The Potential',
  'Platform Administrator',
  'Platform administrator responsible for managing users, content, and ensuring community quality.',
  'Seoul, South Korea',
  'admin',
  'approved',
  100,
  0,
  ARRAY['platform-management', 'user-support', 'community-building'],
  ARRAY['administration', 'moderation', 'analytics', 'customer-service'],
  NOW() - INTERVAL '60 days',
  NOW(),
  NOW()
);

-- Profile 3: Expert 1 - Marketing (expert1@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  network_count,
  expertise,
  skills,
  experience,
  portfolio_links,
  created_at,
  updated_at,
  last_active_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'expert1@potential.com',
  'Kim Marketing Expert',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=expert1',
  '+82-10-1111-2222',
  'Digital Growth Agency',
  'CEO & Head of Strategy',
  'Helping startups scale through data-driven marketing strategies. 10+ years of experience in digital marketing, growth hacking, and brand building for Korean and global markets.',
  'Seoul, South Korea',
  'expert',
  'approved',
  95,
  25,
  ARRAY['marketing', 'growth-hacking', 'brand-strategy', 'performance-marketing'],
  ARRAY['seo', 'sem', 'social-media', 'content-marketing', 'analytics', 'branding'],
  '[{"title": "CEO", "company": "Digital Growth Agency", "startDate": "2019-01", "endDate": null, "description": "Founded and leading a digital marketing agency"}, {"title": "Marketing Director", "company": "Major Tech Company", "startDate": "2015-06", "endDate": "2018-12", "description": "Led marketing for APAC region"}]'::jsonb,
  '[{"title": "Agency Website", "url": "https://digitalgrowth.kr"}, {"title": "LinkedIn", "url": "https://linkedin.com/in/kimmarketing"}]'::jsonb,
  NOW() - INTERVAL '45 days',
  NOW(),
  NOW() - INTERVAL '2 hours'
);

-- Profile 4: Expert 2 - Development (expert2@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  network_count,
  expertise,
  skills,
  experience,
  portfolio_links,
  created_at,
  updated_at,
  last_active_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'expert2@potential.com',
  'Park Development Expert',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=expert2',
  '+82-10-3333-4444',
  'TechBuild Solutions',
  'CTO & Co-founder',
  'Full-stack developer and technical architect with expertise in building scalable web and mobile applications. Specialized in React, Node.js, and cloud infrastructure.',
  'Pangyo, South Korea',
  'expert',
  'approved',
  90,
  18,
  ARRAY['development', 'architecture', 'mobile', 'cloud'],
  ARRAY['react', 'nodejs', 'typescript', 'aws', 'react-native', 'postgresql', 'devops'],
  '[{"title": "CTO", "company": "TechBuild Solutions", "startDate": "2020-03", "endDate": null, "description": "Leading technical development and architecture"}, {"title": "Senior Developer", "company": "Startup X", "startDate": "2017-01", "endDate": "2020-02", "description": "Built core platform from scratch"}]'::jsonb,
  '[{"title": "GitHub", "url": "https://github.com/parkdev"}, {"title": "Portfolio", "url": "https://parkdev.io"}]'::jsonb,
  NOW() - INTERVAL '40 days',
  NOW(),
  NOW() - INTERVAL '30 minutes'
);

-- Profile 5: Member 2 (member2@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  network_count,
  expertise,
  skills,
  collaboration_needs,
  experience,
  created_at,
  updated_at,
  last_active_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'member2@potential.com',
  'Lee Startup Founder',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=member2',
  '+82-10-5555-6666',
  'FoodTech Korea',
  'Founder',
  'Building the future of food delivery with AI-powered logistics. Pre-seed startup looking to disrupt the Korean food tech market.',
  'Busan, South Korea',
  'member',
  'approved',
  60,
  3,
  ARRAY['foodtech', 'logistics', 'ai', 'startups'],
  ARRAY['business-development', 'operations', 'fundraising'],
  '[{"type": "development", "description": "Looking for technical co-founder"}, {"type": "finance", "description": "Need help with financial modeling for fundraising"}]'::jsonb,
  '[{"title": "Founder", "company": "FoodTech Korea", "startDate": "2024-01", "endDate": null, "description": "Building AI-powered food delivery platform"}]'::jsonb,
  NOW() - INTERVAL '20 days',
  NOW(),
  NOW() - INTERVAL '5 hours'
);

-- Profile 6: Pending member (pending@potential.com)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  company_name,
  job_title,
  bio,
  location,
  role,
  approval_status,
  profile_completeness,
  expertise,
  skills,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-4789-abcd-666666666666',
  'pending@potential.com',
  'Choi New Applicant',
  NULL,
  '+82-10-7777-8888',
  'New Venture',
  'Aspiring Entrepreneur',
  'Recent graduate looking to start my entrepreneurial journey. Interested in sustainability and green tech.',
  'Daejeon, South Korea',
  'member',
  'pending',
  40,
  ARRAY['sustainability', 'greentech'],
  ARRAY['research', 'analysis'],
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- =============================================================================
-- CREATE EXPERT PROFILES
-- =============================================================================

-- Expert Profile 1: Marketing Expert (Kim)
INSERT INTO expert_profiles (
  id,
  user_id,
  business_name,
  business_registration_number,
  category,
  subcategories,
  service_description,
  specialty,
  price_range_min,
  price_range_max,
  service_regions,
  portfolio_url,
  portfolio_files,
  status,
  verification_documents,
  verified_at,
  verified_by,
  is_featured,
  is_available,
  view_count,
  contact_count,
  created_at,
  updated_at,
  submitted_at
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'Digital Growth Agency',
  '123-45-67890',
  'marketing',
  ARRAY['digital-marketing', 'growth-hacking', 'brand-strategy'],
  'We help startups achieve sustainable growth through data-driven marketing strategies. Our services include:\n\n- Performance Marketing (Google Ads, Facebook Ads, Naver Ads)\n- SEO/SEM optimization\n- Content Marketing Strategy\n- Brand Identity Development\n- Social Media Management\n- Analytics & Reporting\n\nWe have helped 50+ startups scale their user acquisition and improve ROI.',
  ARRAY['startup-marketing', 'growth-hacking', 'performance-ads', 'content-strategy', 'brand-building'],
  5000000,
  50000000,
  ARRAY['Seoul', 'Pangyo', 'Busan', 'Remote'],
  'https://digitalgrowth.kr/portfolio',
  ARRAY['portfolio/marketing-case-study-1.pdf', 'portfolio/marketing-case-study-2.pdf'],
  'approved',
  ARRAY['documents/business-registration.pdf', 'documents/certifications.pdf'],
  NOW() - INTERVAL '40 days',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  TRUE,
  TRUE,
  150,
  25,
  NOW() - INTERVAL '45 days',
  NOW(),
  NOW() - INTERVAL '43 days'
);

-- Expert Profile 2: Development Expert (Park)
INSERT INTO expert_profiles (
  id,
  user_id,
  business_name,
  business_registration_number,
  category,
  subcategories,
  service_description,
  specialty,
  price_range_min,
  price_range_max,
  service_regions,
  portfolio_url,
  portfolio_files,
  status,
  verification_documents,
  verified_at,
  verified_by,
  is_featured,
  is_available,
  view_count,
  contact_count,
  created_at,
  updated_at,
  submitted_at
) VALUES (
  'e2222222-2222-2222-2222-222222222222',
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'TechBuild Solutions',
  '234-56-78901',
  'development',
  ARRAY['web-development', 'mobile-development', 'cloud-architecture'],
  'Full-service software development agency specializing in startup MVPs and scalable solutions.\n\nOur Services:\n- Web Application Development (React, Next.js, Vue)\n- Mobile App Development (React Native, Flutter)\n- Backend Development (Node.js, Python, Go)\n- Cloud Infrastructure (AWS, GCP, Azure)\n- DevOps & CI/CD Setup\n- Technical Consulting & Architecture Review\n\nWe have delivered 30+ successful projects for startups ranging from pre-seed to Series B.',
  ARRAY['mvp-development', 'react', 'react-native', 'nodejs', 'cloud-architecture', 'devops'],
  10000000,
  200000000,
  ARRAY['Seoul', 'Pangyo', 'Remote'],
  'https://techbuild.io/work',
  ARRAY['portfolio/dev-case-study-1.pdf', 'portfolio/dev-case-study-2.pdf'],
  'approved',
  ARRAY['documents/business-registration.pdf', 'documents/aws-certification.pdf'],
  NOW() - INTERVAL '35 days',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  TRUE,
  TRUE,
  200,
  35,
  NOW() - INTERVAL '40 days',
  NOW(),
  NOW() - INTERVAL '38 days'
);

-- =============================================================================
-- CREATE POSTS
-- =============================================================================

-- Post 1: By Sample User
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'Just launched our MVP! After 6 months of hard work, Sample Startup Inc. is finally live. We''re building EdTech solutions to make learning more accessible. Would love to get feedback from the community!

#startup #edtech #mvplaunch #entrepreneurship',
  ARRAY['https://picsum.photos/seed/post1/800/600'],
  5,
  3,
  FALSE,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- Post 2: By Expert 1 (Marketing Expert)
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  '5 Marketing Mistakes Early-Stage Startups Make:

1. Spending on paid ads before product-market fit
2. Ignoring SEO because "it takes too long"
3. Not tracking proper metrics (vanity vs actionable)
4. Trying to be on every social platform
5. Underestimating the power of content marketing

What other mistakes have you seen? Drop them in the comments!

#startupmarketing #growthhacking #marketingtips',
  ARRAY[]::text[],
  12,
  5,
  TRUE,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Post 3: By Expert 2 (Development Expert)
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'Tech Stack Recommendation for Early-Stage Startups (2024 Edition):

Frontend: Next.js + TypeScript
Backend: Supabase (PostgreSQL + Auth + Storage)
Hosting: Vercel
State Management: Zustand or TanStack Query
Styling: Tailwind CSS + shadcn/ui

This stack lets you ship fast, scale well, and keep costs low. Perfect for MVP development.

Happy to answer questions about technical decisions!

#techstack #startup #development #mvp',
  ARRAY['https://picsum.photos/seed/post3/800/600'],
  18,
  7,
  FALSE,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Post 4: By Member 2
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'Looking for a technical co-founder for FoodTech Korea!

We''re building an AI-powered food delivery optimization platform. Already have:
- Validated problem with 100+ restaurant interviews
- LOIs from 20 restaurants
- Pre-seed funding secured

Need someone who can lead product development. Equity split negotiable.

DM if interested or know someone who might be!

#cofounder #foodtech #startup #hiring',
  ARRAY[]::text[],
  8,
  4,
  FALSE,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Post 5: By Admin (Announcement)
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  'Welcome to The Potential Community!

We''re excited to have you here. This platform is designed to connect Korean startup founders with verified experts and valuable support programs.

Here''s how to get started:
1. Complete your profile (aim for 80%+ completeness)
2. Browse and bookmark experts in areas you need help
3. Check out the Support Programs section for funding opportunities
4. Engage with the community through posts

Feel free to reach out if you have any questions!

#welcome #community #announcement',
  ARRAY['https://picsum.photos/seed/welcome/800/600'],
  25,
  10,
  TRUE,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
);

-- Post 6: Recent post by Sample User
INSERT INTO posts (author_id, content, media_urls, like_count, comment_count, is_pinned, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'Just had an amazing coffee chat with @Kim from Digital Growth Agency through The Potential!

Got great insights on:
- When to start investing in paid acquisition
- How to build a content strategy on a bootstrap budget
- Key metrics to track at our stage

Highly recommend reaching out to experts on this platform. The quality of advice is top-notch!

#networking #coffeechat #startup #marketing',
  ARRAY[]::text[],
  6,
  2,
  FALSE,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- =============================================================================
-- CREATE COMMENTS
-- =============================================================================

-- Comments on Post 1 (MVP Launch)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  1,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  NULL,
  'Congratulations on the launch! EdTech is a great space right now. What''s your primary user acquisition strategy?',
  2,
  NOW() - INTERVAL '7 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '7 days' + INTERVAL '2 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  1,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  1,
  'Thanks! We''re focusing on content marketing and partnerships with educational institutions initially. Planning to add paid acquisition once we validate our retention metrics.',
  1,
  NOW() - INTERVAL '7 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '7 days' + INTERVAL '4 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  1,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  NULL,
  'Awesome! Would love to connect. I''m also in the early stages with my FoodTech startup. Maybe we can share learnings!',
  1,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
);

-- Comments on Post 2 (Marketing Mistakes)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  NULL,
  'This is gold! I was definitely guilty of #1 in my previous startup. Burned through a lot of budget before realizing we didn''t have PMF yet.',
  3,
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  NULL,
  'I''d add: Not having proper attribution tracking set up before running campaigns. Seen so many startups unable to identify which channels actually work.',
  4,
  NOW() - INTERVAL '5 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '5 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  5,
  'Great point! Attribution is crucial. I always recommend setting up UTM tracking and proper analytics before any marketing spend.',
  2,
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  NULL,
  'What about trying to copy big company marketing strategies? I see a lot of early startups trying to do things that only work at scale.',
  2,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  7,
  'Absolutely! Startup marketing requires scrappy, creative approaches that big companies can''t or won''t do. That''s actually your advantage.',
  1,
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours'
);

-- Comments on Post 3 (Tech Stack)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  3,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  NULL,
  'We''re using almost this exact stack! Supabase has been a game-changer for us. The real-time features are amazing.',
  3,
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  3,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  NULL,
  'What about mobile development? Would you recommend React Native over Flutter for a startup MVP?',
  1,
  NOW() - INTERVAL '3 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '3 days' + INTERVAL '4 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  3,
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  10,
  'It depends on your team! If you have JavaScript/TypeScript expertise, React Native is great and allows code sharing with a Next.js web app. Flutter is excellent if you''re starting fresh and want a more opinionated framework.',
  4,
  NOW() - INTERVAL '3 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '3 days' + INTERVAL '5 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  3,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  NULL,
  'From a marketing perspective, I love this stack because it makes it easy to implement proper analytics and A/B testing.',
  2,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Comments on Post 4 (Co-founder search)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  4,
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  NULL,
  'Interesting opportunity! What''s your technical vision for the AI component? Happy to chat if you want to discuss architecture.',
  2,
  NOW() - INTERVAL '2 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '3 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  4,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  13,
  'Thanks! I''ll send you a collaboration request. Would love to get your thoughts on the technical approach.',
  1,
  NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '5 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  4,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  NULL,
  'Great traction for a pre-seed stage! Have you considered using TechBuild Solutions? They helped us with our MVP.',
  1,
  NOW() - INTERVAL '1 day' + INTERVAL '10 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '10 hours'
);

-- Comments on Post 5 (Welcome announcement)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  5,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  NULL,
  'Excited to be part of this community! The platform looks great.',
  5,
  NOW() - INTERVAL '29 days',
  NOW() - INTERVAL '29 days'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  5,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  NULL,
  'Great to be here as a verified expert. Looking forward to helping startups grow!',
  4,
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
);

-- Comments on Post 6 (Coffee chat experience)
INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  6,
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  NULL,
  'It was great chatting with you! Happy to help anytime. Good luck with the content strategy!',
  2,
  NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
  NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
);

INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES (
  6,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  NULL,
  'Sounds useful! I should schedule a coffee chat too. Any other experts you''d recommend?',
  1,
  NOW() - INTERVAL '20 hours',
  NOW() - INTERVAL '20 hours'
);

-- =============================================================================
-- CREATE SUPPORT PROGRAMS
-- =============================================================================

-- Program 1: Government Funding
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  1,
  'K-Startup Grand Challenge 2024',
  'Join Korea''s premier startup acceleration program. The K-Startup Grand Challenge brings together the world''s most promising startups to South Korea for an intensive 3-month acceleration program with funding, mentorship, and market access.

Program Highlights:
- Up to 200M KRW in grant funding
- Free office space at Pangyo Startup Campus
- Visa and settlement support
- Access to Korean market and corporate partners
- Demo Day with top VCs and investors',
  'Ministry of SMEs and Startups',
  'funding',
  'Up to 200,000,000 KRW',
  'Global startups with scalable tech products. Must be willing to establish Korean entity.',
  ARRAY['Grant funding', 'Free office space', 'Mentorship', 'Visa support', 'Networking events', 'Demo Day'],
  'https://www.k-startupgc.org',
  'https://picsum.photos/seed/program1/800/400',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '60 days',
  NOW() + INTERVAL '90 days',
  NOW() + INTERVAL '180 days',
  'published',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  450,
  85,
  NOW() - INTERVAL '35 days',
  NOW(),
  NOW() - INTERVAL '30 days'
);

-- Program 2: Mentoring Program
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  2,
  'Seoul Startup Mentoring Program',
  'Connect with successful entrepreneurs and industry experts through Seoul''s flagship mentoring program. Get personalized guidance on business strategy, fundraising, and growth.

What You''ll Get:
- 6-month 1-on-1 mentorship with experienced founders
- Monthly group workshops
- Access to mentor network
- Quarterly progress reviews
- Certificate upon completion',
  'Seoul Business Agency',
  'mentoring',
  'Free (Mentorship valued at 10M KRW)',
  'Early-stage startups based in Seoul. Must have MVP or launched product.',
  ARRAY['1-on-1 mentorship', 'Group workshops', 'Network access', 'Progress tracking'],
  'https://sba.seoul.kr/mentoring',
  'https://picsum.photos/seed/program2/800/400',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '45 days',
  NOW() + INTERVAL '225 days',
  'published',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  280,
  65,
  NOW() - INTERVAL '20 days',
  NOW(),
  NOW() - INTERVAL '15 days'
);

-- Program 3: Education Program
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  3,
  'Startup CEO Academy',
  'Intensive 8-week program designed to equip first-time founders with essential business skills. Learn from successful Korean entrepreneurs and gain practical knowledge in finance, legal, HR, and operations.

Curriculum:
- Week 1-2: Business Model & Strategy
- Week 3-4: Finance & Accounting Basics
- Week 5-6: Legal & HR Essentials
- Week 7-8: Operations & Scaling

Classes held every Saturday at COEX.',
  'Korea Startup Forum',
  'education',
  'Free (with 100,000 KRW deposit, refunded upon completion)',
  'First-time founders or aspiring entrepreneurs in Korea.',
  ARRAY['Expert-led workshops', 'Practical templates', 'Peer networking', 'Completion certificate'],
  'https://kstartupforum.org/academy',
  'https://picsum.photos/seed/program3/800/400',
  NOW() - INTERVAL '10 days',
  NOW() + INTERVAL '20 days',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '90 days',
  'published',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  180,
  45,
  NOW() - INTERVAL '12 days',
  NOW(),
  NOW() - INTERVAL '10 days'
);

-- Program 4: Networking Event
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  4,
  'Startup Connect: Founder Mixer Q1 2024',
  'Join 200+ startup founders, investors, and experts for an evening of networking. This quarterly event brings together the Korean startup ecosystem for meaningful connections.

Event Schedule:
- 18:00 - Registration & Welcome Drinks
- 18:30 - Lightning Talks (5 startups, 5 minutes each)
- 19:30 - Speed Networking Session
- 20:30 - Open Networking & Refreshments
- 22:00 - Close

Venue: D.CAMP, Yeoksam',
  'D.CAMP',
  'networking',
  '50,000 KRW (includes food & drinks)',
  'Startup founders, employees, investors, and ecosystem supporters.',
  ARRAY['Network with 200+ attendees', 'Lightning talk opportunity', 'Speed networking', 'Food & drinks included'],
  'https://dcamp.kr/events/founder-mixer',
  'https://picsum.photos/seed/program4/800/400',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days',
  'published',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  320,
  75,
  NOW() - INTERVAL '7 days',
  NOW(),
  NOW() - INTERVAL '5 days'
);

-- Program 5: Co-working Space
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  5,
  'Pangyo Startup Campus Residency',
  'Free co-working and office space for qualified startups at Korea''s premier tech hub. Located in Pangyo Techno Valley, surrounded by major tech companies like Kakao, Naver, and NCSoft.

Space Options:
- Hot desk (free for 6 months)
- Dedicated desk (free for 6 months)
- Private office (subsidized rate)

Amenities include meeting rooms, event space, cafeteria, gym, and networking lounges.',
  'Gyeonggi-do Government',
  'space',
  'Free (6-month residency)',
  'Tech startups less than 7 years old with innovative product/service.',
  ARRAY['Free workspace', '24/7 access', 'Meeting rooms', 'Event space', 'Networking opportunities'],
  'https://pangyo-startup.kr/residency',
  'https://picsum.photos/seed/program5/800/400',
  NOW() - INTERVAL '45 days',
  NOW() + INTERVAL '15 days',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '210 days',
  'published',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  520,
  120,
  NOW() - INTERVAL '50 days',
  NOW(),
  NOW() - INTERVAL '45 days'
);

-- Program 6: Archived Program
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at,
  published_at
) OVERRIDING SYSTEM VALUE VALUES (
  6,
  'TIPS Program Round 2023',
  'Tech Incubator Program for Startup Korea (TIPS) provides comprehensive support for deep-tech startups. This program has now closed for 2023.',
  'Ministry of SMEs and Startups',
  'funding',
  'Up to 500,000,000 KRW',
  'Deep-tech startups with R&D focus.',
  ARRAY['R&D funding', 'Accelerator partnership', 'Follow-on support'],
  'https://tips.or.kr',
  'https://picsum.photos/seed/program6/800/400',
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '120 days',
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '30 days',
  'archived',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  890,
  200,
  NOW() - INTERVAL '200 days',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '180 days'
);

-- Program 7: Draft Program
INSERT INTO support_programs (
  title,
  description,
  organization,
  category,
  amount,
  eligibility,
  benefits,
  external_url,
  image_url,
  application_start,
  application_deadline,
  program_start,
  program_end,
  status,
  created_by,
  view_count,
  bookmark_count,
  created_at,
  updated_at
) OVERRIDING SYSTEM VALUE VALUES (
  7,
  'Green Tech Accelerator 2024',
  'Upcoming accelerator program focused on sustainability and green technology startups. Details to be announced.',
  'Korea Environmental Industry Association',
  'funding',
  'TBA',
  'Startups focused on environmental/sustainability solutions.',
  ARRAY['Funding TBA', 'Mentorship', 'Industry connections'],
  'https://keia.kr/greentech',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'draft',
  'a1b2c3d4-e5f6-4789-abcd-222222222222',
  0,
  0,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- =============================================================================
-- CREATE COLLABORATION REQUESTS
-- =============================================================================

-- Request 1: Coffee chat from Sample User to Marketing Expert (Accepted)
INSERT INTO collaboration_requests (
  sender_id,
  recipient_id,
  expert_profile_id,
  type,
  subject,
  message,
  contact_info,
  status,
  response_message,
  responded_at,
  created_at,
  updated_at
) OVERRIDING SYSTEM VALUE VALUES (
  1,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'e1111111-1111-1111-1111-111111111111',
  'coffee_chat',
  'Marketing Strategy Discussion',
  'Hi Kim,

I''m the founder of Sample Startup Inc. and we just launched our EdTech MVP. I''m looking for guidance on marketing strategy for early-stage startups.

Specifically, I''d love to discuss:
- When to start investing in paid acquisition
- Content marketing strategies on a limited budget
- Key metrics to track at our stage

Would you be available for a 30-minute call next week?

Thanks!
Sample User',
  'Email: user@potential.com | Kakao: sampleuser',
  'accepted',
  'Hi Sample User! I''d be happy to chat. I''ll send you a calendar link to book a time that works for you. Looking forward to it!',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days'
);

-- Request 2: Collaboration request from Member 2 to Development Expert (Pending)
INSERT INTO collaboration_requests (
  sender_id,
  recipient_id,
  expert_profile_id,
  type,
  subject,
  message,
  contact_info,
  status,
  created_at,
  updated_at
) OVERRIDING SYSTEM VALUE VALUES (
  2,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'e2222222-2222-2222-2222-222222222222',
  'collaboration',
  'Technical Co-founder / Development Partner Discussion',
  'Hi Park,

I''m Lee, founder of FoodTech Korea. We''re building an AI-powered food delivery optimization platform and I''m looking for a technical partner.

About us:
- Pre-seed funded
- Validated with 100+ restaurant interviews
- 20 LOIs from potential customers

I''d love to discuss:
- Technical architecture for our platform
- Potential collaboration or advisory role
- Your experience with similar projects

Are you open to a longer conversation about this opportunity?

Best regards,
Lee',
  'Email: member2@potential.com | Phone: +82-10-5555-6666',
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Request 3: Coffee chat from Sample User to Development Expert (Declined)
INSERT INTO collaboration_requests (
  sender_id,
  recipient_id,
  expert_profile_id,
  type,
  subject,
  message,
  contact_info,
  status,
  response_message,
  responded_at,
  created_at,
  updated_at
) OVERRIDING SYSTEM VALUE VALUES (
  3,
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'e2222222-2222-2222-2222-222222222222',
  'coffee_chat',
  'Quick Tech Stack Review',
  'Hi Park,

I''m using a tech stack similar to what you recommended (Next.js + Supabase) and would love to get your quick review of our architecture decisions.

Would you have 15 minutes for a quick call?

Thanks!',
  'Email: user@potential.com',
  'declined',
  'Hi! Thanks for reaching out. Unfortunately, I''m fully booked this month with ongoing projects. I''d recommend posting your architecture questions in the community feed - I try to answer those when I can. Good luck!',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '10 days'
);

-- Request 4: Coffee chat from Member 2 to Marketing Expert (Pending)
INSERT INTO collaboration_requests (
  sender_id,
  recipient_id,
  expert_profile_id,
  type,
  subject,
  message,
  contact_info,
  status,
  created_at,
  updated_at
) OVERRIDING SYSTEM VALUE VALUES (
  4,
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'e1111111-1111-1111-1111-111111111111',
  'coffee_chat',
  'FoodTech Marketing Strategy',
  'Hi Kim,

I''m building FoodTech Korea and would love to get your insights on marketing in the food delivery space. Saw your post on marketing mistakes and it really resonated!

Would you have time for a quick chat?

Thanks,
Lee',
  'Email: member2@potential.com',
  'pending',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
);

-- =============================================================================
-- CREATE LIKES
-- =============================================================================

-- Likes on Post 1 (MVP Launch)
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 1, NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'post', 1, NOW() - INTERVAL '7 days' + INTERVAL '2 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 1, NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4789-abcd-222222222222', 'post', 1, NOW() - INTERVAL '6 days' + INTERVAL '5 hours'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 1, NOW() - INTERVAL '5 days');

-- Likes on Post 2 (Marketing Mistakes) - Most liked
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 2, NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'post', 2, NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 2, NOW() - INTERVAL '5 days' + INTERVAL '3 hours'),
('a1b2c3d4-e5f6-4789-abcd-222222222222', 'post', 2, NOW() - INTERVAL '4 days');

-- Likes on Post 3 (Tech Stack)
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 3, NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 3, NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 3, NOW() - INTERVAL '3 days' + INTERVAL '3 hours'),
('a1b2c3d4-e5f6-4789-abcd-222222222222', 'post', 3, NOW() - INTERVAL '2 days');

-- Likes on Post 4 (Co-founder search)
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 4, NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'post', 4, NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 4, NOW() - INTERVAL '1 day');

-- Likes on Post 5 (Welcome - Admin post)
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 5, NOW() - INTERVAL '29 days'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 5, NOW() - INTERVAL '28 days'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'post', 5, NOW() - INTERVAL '28 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 5, NOW() - INTERVAL '20 days');

-- Likes on Post 6 (Coffee chat experience)
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 6, NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'post', 6, NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 6, NOW() - INTERVAL '20 hours');

-- Likes on Comments
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'comment', 1, NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'comment', 1, NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'comment', 4, NOW() - INTERVAL '5 days' + INTERVAL '4 hours'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'comment', 4, NOW() - INTERVAL '5 days' + INTERVAL '5 hours'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'comment', 5, NOW() - INTERVAL '5 days' + INTERVAL '6 hours'),
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'comment', 5, NOW() - INTERVAL '5 days' + INTERVAL '7 hours'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'comment', 11, NOW() - INTERVAL '3 days' + INTERVAL '6 hours'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'comment', 11, NOW() - INTERVAL '3 days' + INTERVAL '7 hours');

-- =============================================================================
-- CREATE BOOKMARKS
-- =============================================================================

-- Expert Profile Bookmarks
INSERT INTO bookmarks (user_id, bookmarkable_type, bookmarkable_id, created_at) VALUES
-- Sample User bookmarked both experts
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'expert_profile', 1, NOW() - INTERVAL '20 days'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'expert_profile', 2, NOW() - INTERVAL '18 days'),
-- Member 2 bookmarked both experts
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'expert_profile', 1, NOW() - INTERVAL '15 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'expert_profile', 2, NOW() - INTERVAL '14 days');

-- Support Program Bookmarks
INSERT INTO bookmarks (user_id, bookmarkable_type, bookmarkable_id, created_at) VALUES
-- Sample User bookmarked funding and mentoring programs
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'support_program', 1, NOW() - INTERVAL '25 days'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'support_program', 2, NOW() - INTERVAL '15 days'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'support_program', 5, NOW() - INTERVAL '10 days'),
-- Member 2 bookmarked funding and space programs
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'support_program', 1, NOW() - INTERVAL '18 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'support_program', 4, NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'support_program', 5, NOW() - INTERVAL '12 days'),
-- Experts also bookmark programs
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'support_program', 4, NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4789-abcd-444444444444', 'support_program', 4, NOW() - INTERVAL '4 days');

-- Post Bookmarks
INSERT INTO bookmarks (user_id, bookmarkable_type, bookmarkable_id, created_at) VALUES
-- Sample User bookmarked tech stack and marketing posts
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 2, NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4789-abcd-111111111111', 'post', 3, NOW() - INTERVAL '3 days'),
-- Member 2 bookmarked several posts
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 2, NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 3, NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4789-abcd-555555555555', 'post', 5, NOW() - INTERVAL '20 days'),
-- Marketing expert bookmarked tech stack post
('a1b2c3d4-e5f6-4789-abcd-333333333333', 'post', 3, NOW() - INTERVAL '2 days');

-- =============================================================================
-- CREATE NOTIFICATIONS
-- =============================================================================

-- Member Approval Notifications
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'member_approved',
  'Welcome to The Potential!',
  'Your membership has been approved. You now have full access to the platform.',
  'profile',
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  '{"approved_by": "a1b2c3d4-e5f6-4789-abcd-222222222222"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '29 days',
  NOW() - INTERVAL '30 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'member_approved',
  'Welcome to The Potential!',
  'Your membership has been approved. You now have full access to the platform.',
  'profile',
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  '{"approved_by": "a1b2c3d4-e5f6-4789-abcd-222222222222"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '19 days',
  NOW() - INTERVAL '20 days'
);

-- Expert Approval Notifications
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'expert_approved',
  'Expert Profile Approved!',
  'Congratulations! Your expert profile has been verified. You can now receive collaboration requests.',
  'expert_profile',
  'e1111111-1111-1111-1111-111111111111',
  '{"approved_by": "a1b2c3d4-e5f6-4789-abcd-222222222222"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '39 days',
  NOW() - INTERVAL '40 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'expert_approved',
  'Expert Profile Approved!',
  'Congratulations! Your expert profile has been verified. You can now receive collaboration requests.',
  'expert_profile',
  'e2222222-2222-2222-2222-222222222222',
  '{"approved_by": "a1b2c3d4-e5f6-4789-abcd-222222222222"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '34 days',
  NOW() - INTERVAL '35 days'
);

-- Comment Notifications
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'new_comment',
  'New comment on your post',
  'Kim Marketing Expert commented on your post: "Congratulations on the launch! EdTech is a great space..."',
  'post',
  '1',
  '{"comment_id": 1, "commenter_id": "a1b2c3d4-e5f6-4789-abcd-333333333333", "commenter_name": "Kim Marketing Expert"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '7 days' + INTERVAL '2 hours'
),
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'new_comment',
  'New comment on your post',
  'Lee Startup Founder commented on your post: "Awesome! Would love to connect..."',
  'post',
  '1',
  '{"comment_id": 3, "commenter_id": "a1b2c3d4-e5f6-4789-abcd-555555555555", "commenter_name": "Lee Startup Founder"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '6 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'new_comment',
  'New comment on your post',
  'Sample User commented on your post: "This is gold! I was definitely guilty of #1..."',
  'post',
  '2',
  '{"comment_id": 4, "commenter_id": "a1b2c3d4-e5f6-4789-abcd-111111111111", "commenter_name": "Sample User"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours'
),
(
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'new_comment',
  'New comment on your post',
  'Lee Startup Founder commented on your post: "What about mobile development? Would you recommend..."',
  'post',
  '3',
  '{"comment_id": 10, "commenter_id": "a1b2c3d4-e5f6-4789-abcd-555555555555", "commenter_name": "Lee Startup Founder"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '3 days' + INTERVAL '4 hours'
);

-- Like Notifications
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'new_like',
  'Your post was liked',
  'Kim Marketing Expert liked your post.',
  'post',
  '1',
  '{"liker_id": "a1b2c3d4-e5f6-4789-abcd-333333333333", "liker_name": "Kim Marketing Expert"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '7 days' + INTERVAL '1 hour'
),
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'new_like',
  'Your post was liked',
  'Sample User liked your post.',
  'post',
  '2',
  '{"liker_id": "a1b2c3d4-e5f6-4789-abcd-111111111111", "liker_name": "Sample User"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '5 days' + INTERVAL '1 hour'
),
(
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'new_like',
  'Your post was liked',
  'Sample User liked your post.',
  'post',
  '3',
  '{"liker_id": "a1b2c3d4-e5f6-4789-abcd-111111111111", "liker_name": "Sample User"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '3 days' + INTERVAL '1 hour'
);

-- Collaboration Request Notifications
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'new_collaboration_request',
  'New Coffee Chat Request',
  'Sample User sent you a coffee chat request: "Marketing Strategy Discussion"',
  'collaboration_request',
  '1',
  '{"sender_id": "a1b2c3d4-e5f6-4789-abcd-111111111111", "sender_name": "Sample User", "request_type": "coffee_chat"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '5 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'collaboration_accepted',
  'Coffee Chat Request Accepted',
  'Kim Marketing Expert accepted your coffee chat request.',
  'collaboration_request',
  '1',
  '{"recipient_id": "a1b2c3d4-e5f6-4789-abcd-333333333333", "recipient_name": "Kim Marketing Expert"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '3 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-444444444444',
  'new_collaboration_request',
  'New Collaboration Request',
  'Lee Startup Founder sent you a collaboration request: "Technical Co-founder / Development Partner Discussion"',
  'collaboration_request',
  '2',
  '{"sender_id": "a1b2c3d4-e5f6-4789-abcd-555555555555", "sender_name": "Lee Startup Founder", "request_type": "collaboration"}'::jsonb,
  FALSE,
  NULL,
  NOW() - INTERVAL '1 day'
),
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'collaboration_declined',
  'Coffee Chat Request Declined',
  'Park Development Expert declined your coffee chat request.',
  'collaboration_request',
  '3',
  '{"recipient_id": "a1b2c3d4-e5f6-4789-abcd-444444444444", "recipient_name": "Park Development Expert"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '10 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'new_collaboration_request',
  'New Coffee Chat Request',
  'Lee Startup Founder sent you a coffee chat request: "FoodTech Marketing Strategy"',
  'collaboration_request',
  '4',
  '{"sender_id": "a1b2c3d4-e5f6-4789-abcd-555555555555", "sender_name": "Lee Startup Founder", "request_type": "coffee_chat"}'::jsonb,
  FALSE,
  NULL,
  NOW() - INTERVAL '12 hours'
);

-- System Announcement
INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata, is_read, read_at, created_at) VALUES
(
  'a1b2c3d4-e5f6-4789-abcd-111111111111',
  'system_announcement',
  'New Support Programs Available',
  'Check out the latest funding and mentoring programs we''ve added to the platform!',
  'support_program',
  NULL,
  '{"programs_count": 5}'::jsonb,
  FALSE,
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-555555555555',
  'system_announcement',
  'New Support Programs Available',
  'Check out the latest funding and mentoring programs we''ve added to the platform!',
  'support_program',
  NULL,
  '{"programs_count": 5}'::jsonb,
  FALSE,
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  'a1b2c3d4-e5f6-4789-abcd-333333333333',
  'system_announcement',
  'Platform Update: Coffee Chat Feature',
  'We''ve improved the coffee chat experience. You can now schedule directly through the platform!',
  NULL,
  NULL,
  '{"feature": "coffee_chat_scheduling"}'::jsonb,
  TRUE,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '7 days'
);

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Users created (all with password: password123):
-- 1. user@potential.com - Regular approved member
-- 2. admin@potential.com - Platform administrator
-- 3. expert1@potential.com - Verified marketing expert
-- 4. expert2@potential.com - Verified development expert
-- 5. member2@potential.com - Regular approved member
-- 6. pending@potential.com - Pending member (awaiting approval)
--
-- Data created:
-- - 6 user profiles (4 approved, 1 admin, 1 pending)
-- - 2 expert profiles (both verified)
-- - 6 posts with varied content
-- - 20 comments with nested replies
-- - 7 support programs (5 published, 1 archived, 1 draft)
-- - 4 collaboration requests (1 accepted, 1 declined, 2 pending)
-- - 30+ likes on posts and comments
-- - 14 bookmarks (experts, programs, posts)
-- - 20+ notifications of various types
--
-- To run this seed:
-- npx supabase db reset (this runs seed.sql automatically after migrations)
-- OR
-- psql -h <host> -U postgres -d postgres -f supabase/seed.sql
-- =============================================================================
