# 더포텐셜(The Potential) 메인 홈 대시보드 설계안

## 1. 디자인 시스템 개요

### 컬러 팔레트
- **배경**: Pure Black (#000000)
- **포인트 컬러**: Electric Blue (#0079FF)
- **카드 배경**: #121212 (Primary), #1C1C1E (Secondary)
- **텍스트**: White (#FFFFFF), Muted (#8B95A1)
- **보더**: rgba(255, 255, 255, 0.08)

### 타이포그래피
- **폰트**: Pretendard Variable
- **제목 (H1)**: 2.5rem (40px), ExtraBold (800), letter-spacing: -0.02em
- **제목 (H2)**: 2rem (32px), Bold (700), letter-spacing: -0.01em
- **섹션 타이틀**: 1.25rem (20px), ExtraBold (800)
- **본문**: 0.875-1rem (14-16px), Regular-Semibold (400-600)
- **캡션**: 0.75rem (12px), Medium (500)

### Border Radius (24px 이상 큰 곡률)
- **카드**: 24px (rounded-3xl)
- **버튼**: 16px (rounded-2xl)
- **로고/아바타**: 24px (rounded-3xl)

---

## 2. 메인 홈 화면 구조 (Wireframe)

```
┌─────────────────────────────────────────┐
│          HEADER (64px)                  │
│  [TP Logo] The Potential    [🔔] [👤]  │
├─────────────────────────────────────────┤
│                                         │
│  MAIN CONTENT (Padding: 20px)           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  WELCOME SECTION                  │  │
│  │  ✨ WELCOME BACK                  │  │
│  │  안녕하세요, 김창업님!              │  │
│  │  오늘도 성장하는 하루를...          │  │
│  │  [지원사업 둘러보기 →]             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  나에게 맞는 지원사업    [전체보기] │  │
│  │  마감 임박한 공고를 확인하세요      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ◄──── 가로 스크롤 ────►                │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Card1│ │Card2│ │Card3│              │
│  │D-3  │ │D-7  │ │D-14 │              │
│  │초기창│ │청년창│ │챌린지│              │
│  └─────┘ └─────┘ └─────┘              │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔥 실시간 쓰레드      [전체보기]   │  │
│  │  지금 가장 핫한 창업가들의 고민     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [👤] 박스타트  2시간 전          │    │
│  │ 첫 직원 채용 시 가장 중요하게...  │    │
│  │ 💬 23  ❤️ 45                    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ [👤] 이개발  5시간 전            │    │
│  │ 법인 설립 vs 개인사업자...       │    │
│  │ 💬 18  ❤️ 32                    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📚 인사이트 아티클    [전체보기]   │  │
│  │  읽어볼 만한 콘텐츠                │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ◄──── 가로 스크롤 ────►                │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │투자  │ │개발  │ │법률  │              │
│  │초기자│ │MVP론│ │법률체│              │
│  └─────┘ └─────┘ └─────┘              │
│                                         │
│  ┌──────────┐ ┌──────────┐             │
│  │진행중 3개 │ │네트워킹   │             │
│  │📈        │ │127명 ✨  │             │
│  └──────────┘ └──────────┘             │
│                                         │
├─────────────────────────────────────────┤
│    BOTTOM NAVIGATION (80px)             │
│  [홈] [지원사업] [쓰레드] [클럽] [프로필]│
└─────────────────────────────────────────┘
```

---

## 3. 여백(Spacing) 및 레이아웃 가이드

### 컨테이너 여백
- **메인 컨테이너 좌우**: 20px (px-5)
- **상단 여백**: 24px (pt-6)
- **하단 여백**: 32px (pb-8)
- **Bottom Navigation 오프셋**: 96px (pb-24)

### 섹션 간 간격
- **섹션 사이**: 24px (space-y-6)
- **카드 사이 (가로 스크롤)**: 16px (gap-4)
- **리스트 아이템 사이**: 12px (space-y-3)

### 카드 내부 패딩
- **지원사업 카드**: 24px (p-6)
- **쓰레드 카드**: 20px (p-5)
- **Stats 카드**: 20px (p-5)
- **Welcome Section**: 32px (p-8)

### 타이틀 섹션 구조
```css
Section Header:
  - Title (20px font, extrabold)
  - Subtitle (12px font, muted)
  - Margin Bottom: 16px (mb-4)
```

---

## 4. 토스 스타일 깔끔함을 위한 기술적 가이드

### 1) **여백의 일관성**
- 8px 단위 시스템 사용 (8, 12, 16, 20, 24, 32px)
- 카드 내부 패딩은 20px 이상
- 섹션 간 간격은 24px 고정

### 2) **폰트 계층 구조**
```
Welcome Title: 48px (3xl), ExtraBold
Section Title: 20px (xl), ExtraBold
Card Title: 18px (lg), Bold
Body Text: 14px (sm), Regular/Semibold
Caption: 12px (xs), Medium
```

### 3) **컬러 사용 원칙**
- **Primary Action**: #0079FF (Electric Blue)
- **Deadline/Urgent**: Orange-400 (#FB923C)
- **Success/Growth**: Emerald-400 (#34D399)
- **Secondary Info**: Cyan-400 (#22D3EE)
- **Destructive**: Red (#FF453A)

### 4) **Border & Shadow**
- Border: 0.5px, rgba(255,255,255,0.08)
- Hover Border: rgba(0,121,255,0.4)
- Glow Shadow: 0 0 20px rgba(0,121,255,0.4)
- Card Shadow: shadow-lg shadow-primary/20

### 5) **애니메이션 타이밍**
- Stagger Children: 0.1s delay
- Spring Stiffness: 100-500
- Spring Damping: 12-30
- Hover Scale: 1.01-1.02
- Tap Scale: 0.98-0.99

---

## 5. 마이크로 인터랙션 가이드

### 1) **카드 스크롤 인 애니메이션**
```javascript
// 카드가 화면에 나타날 때
initial: { opacity: 0, y: 20 }
animate: { 
  opacity: 1, 
  y: 0,
  transition: {
    type: 'spring',
    stiffness: 100,
    damping: 12
  }
}
```

### 2) **카드 호버 효과**
```javascript
whileHover: { scale: 1.02 }
whileTap: { scale: 0.98 }
// CSS: transition-all duration-200
// Border: border-primary/40
```

### 3) **하단 네비게이션 활성 상태**
- Layout ID 기반 Shared Element Transition
- Active Tab: Scale 1.1, Y -2
- Glow Effect: blur-lg opacity-40
- 상단 인디케이터: 48px width, 4px height

### 4) **가로 스크롤 카드**
- Staggered Entrance: delay idx * 0.1s
- Smooth Scroll: scrollbar-hide
- Edge Fade: -mx-5 px-5 (negative margin)

### 5) **버튼 인터랙션**
```css
Primary Button:
  - Background: #0079FF
  - Hover: #0079FF/90
  - Shadow: shadow-lg shadow-primary/20
  - Rounded: 16px
  - Height: 48px
  - Font: Semibold

Ghost Button:
  - Hover: bg-primary/10
  - Text: text-primary
```

---

## 6. 반응형 디자인 (Responsive)

### 모바일 우선 (375px+)
```css
Container: px-5 (20px)
Card Width (가로 스크롤): 300px (지원사업), 280px (아티클)
Grid: 1 column
```

### 태블릿 (768px+)
```css
Container: px-8
Card Width: 320px
Grid: 2 columns
```

### 데스크톱 (1024px+)
```css
Container: max-w-7xl mx-auto
Card Width: 340px
Grid: 3-4 columns
Header Search: visible
```

---

## 7. 애니메이션 시퀀스 타임라인

```
0ms    - Container Fade In 시작
100ms  - Welcome Section Slide Up
200ms  - 지원사업 섹션 Slide Up
300ms  - 첫 번째 지원사업 카드 Slide In
400ms  - 두 번째 지원사업 카드 Slide In
500ms  - 세 번째 지원사업 카드 Slide In
600ms  - 실시간 쓰레드 섹션 Slide Up
700ms  - 첫 번째 쓰레드 Slide Up
800ms  - 두 번째 쓰레드 Slide Up
900ms  - 세 번째 쓰레드 Slide Up
1000ms - 인사이트 아티클 섹션 Slide Up
1100ms - 아티클 카드들 Staggered Slide In
1200ms - Quick Stats Slide Up
```

---

## 8. 구현된 컴포넌트 구조

```
/src/app/
├── App.tsx                      # 메인 앱 컨테이너
├── components/
│   ├── Header.tsx               # 상단 헤더 (모바일 최적화)
│   ├── BottomNavigation.tsx     # 하단 네비게이션 (5개 메뉴)
│   ├── Dashboard.tsx            # 메인 홈 대시보드
│   ├── SupportPrograms.tsx      # 지원사업 페이지
│   ├── ThreadFeed.tsx           # 쓰레드 페이지
│   ├── ArticleInsights.tsx      # 아티클 페이지
│   ├── PrivateClubs.tsx         # 클럽 페이지
│   └── BusinessProfile.tsx      # 프로필 페이지
```

---

## 9. 핵심 디자인 원칙 요약

### ✅ DO (해야 할 것)
- 24px 이상 큰 곡률 사용
- 넓은 여백 (최소 20px 패딩)
- Bold 계층 구조 (ExtraBold 타이틀)
- Electric Blue 포인트 컬러
- 부드러운 Spring 애니메이션
- Glow 효과로 하이엔드 느낌
- 가로 스크롤로 많은 정보 압축
- 토스처럼 내용 중심 (군더더기 없이)

### ❌ DON'T (하지 말아야 할 것)
- 8px 이하 작은 border-radius
- 좁은 패딩 (16px 미만)
- 복잡한 메뉴 구조
- Flat한 애니메이션 (Linear)
- 과도한 색상 사용
- 작은 폰트 사이즈 (12px 미만 본문)
- 세로 스크롤만 사용
- 장식적 요소 과다

---

## 10. 다음 단계: 비즈니스 프로필 화면

메인 대시보드 구현이 완료되었으므로, 다음은 **'사업가 프로필' 화면**으로 넘어갈 예정입니다.

프로필 화면에서는:
- 사업가 개인 소개
- 사업 이력 및 전문성
- 관심사 및 협업 희망 분야
- 네트워킹 히스토리
- 참여 클럽 및 활동

을 동일한 디자인 시스템으로 구축할 것입니다.
