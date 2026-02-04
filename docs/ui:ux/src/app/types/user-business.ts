import { UserCategory } from '../constants/categories';
import { EntrepreneurStage, Stage5Type } from '../constants/stages';

/**
 * 유저의 비즈니스/직종 정보
 * 한 유저가 여러 개의 비즈니스를 운영할 수 있도록 설계
 */
export interface UserBusiness {
  id: string;
  userId: string;
  category: UserCategory; // 직종 (예: ENTREPRENEUR, CREATOR 등)
  stage: EntrepreneurStage; // 창업 단계 (0-6)
  stage5Type?: Stage5Type; // Stage 5인 경우 투자형/매출형 구분
  isMain: boolean; // 대표 비즈니스 여부 (가입 시 선택한 첫 번째)
  createdAt: string;
  updatedAt: string;
}

/**
 * 유저 프로필 (멀티 비즈니스 지원)
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title?: string;
  company?: string;
  bio?: string;
  locationHub?: string;
  expertise: string[];
  businesses: UserBusiness[]; // 여러 개의 비즈니스 보유 가능
  createdAt: string;
  updatedAt: string;
}

/**
 * 비즈니스 추가 요청 데이터
 */
export interface AddBusinessRequest {
  category: UserCategory;
  stage: EntrepreneurStage;
  stage5Type?: Stage5Type;
}

/**
 * 비즈니스 업데이트 요청 데이터
 */
export interface UpdateBusinessRequest {
  id: string;
  stage: EntrepreneurStage;
  stage5Type?: Stage5Type;
}
