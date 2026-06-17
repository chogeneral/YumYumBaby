---
name: ui-design
description: "이유식 홈페이지의 UI 구조, 컴포넌트 계층, 페이지 레이아웃을 설계한다. '컴포넌트 구조 잡아줘', '페이지 레이아웃 설계', '어떤 컴포넌트가 필요해?', '화면 구성해줘' 등의 요청 시 반드시 이 스킬을 사용할 것."
---

# UI Design Skill — 이유식 홈페이지 UI 설계

이유식 홈페이지의 페이지 구조와 React 컴포넌트 계층을 설계한다.

## 설계 원칙

시맨틱 마크업이 설계의 출발점이다. JSX가 HTML로 렌더링될 때 의미 있는 태그 계층을 만들어야 SEO와 접근성이 향상되므로, 컴포넌트 설계 단계부터 HTML 태그를 지정한다.

## 표준 이유식 홈페이지 구조

요청에 별도 구조가 없으면 아래 기본 구조를 사용한다.

### 페이지 목록

| 페이지 | 경로 | 핵심 콘텐츠 |
|--------|------|------------|
| 홈 | `/` | 히어로, 소개, 추천 레시피 |
| 레시피 목록 | `/recipes` | 필터(월령/재료), 카드 그리드 |
| 레시피 상세 | `/recipes/:id` | 재료, 만드는 법, 영양 정보 |
| 월령별 가이드 | `/guide` | 단계별 이유식 가이드 |
| 소개 | `/about` | 사이트 소개 |

### 글로벌 컴포넌트 계층

```
App
├── Header (h1: 로고)
│   ├── Logo (h1 — 사이트 전체에서 1번만 사용)
│   └── Nav (nav)
│       └── NavItem
├── main (라우터에 따라 페이지 컴포넌트 렌더링)
│   └── [페이지 컴포넌트]
└── Footer (footer)
    ├── FooterNav
    └── FooterCopyright
```

### 홈 페이지 컴포넌트 계층

```
HomePage
├── HeroSection (section)
│   ├── h2: 메인 슬로건
│   └── HeroCTA (button/link)
├── IntroSection (section)
│   ├── h2: 섹션 제목
│   └── IntroContent
├── RecipeHighlight (section)
│   ├── h2: 섹션 제목
│   └── RecipeCardGrid
│       └── RecipeCard (article)
│           ├── h3: 레시피 이름
│           └── RecipeInfo
└── GuideSection (section)
    ├── h2: 섹션 제목
    └── GuideCardGrid
        └── GuideCard (article)
            └── h3: 월령 단계명
```

## 컴포넌트 명세 출력 형식

설계 결과는 아래 형식으로 `_workspace/01_ui-plan/component-tree.md`에 작성한다.

```markdown
## [컴포넌트명]

- **파일:** `src/components/[경로]/[ComponentName].jsx`
- **HTML 태그:** `<section>` / `<article>` / `<nav>` 등
- **Props:**
  - `propName` (타입): 설명
- **상태(State):**
  - `stateName`: 역할
- **자식 컴포넌트:** ComponentA, ComponentB
- **역할:** 한 줄 설명
```

## 레이아웃 명세 출력 형식

`_workspace/01_ui-plan/layout-spec.md`에 페이지별 레이아웃을 기록한다.

```markdown
## [페이지명] 레이아웃

- **최대 너비:** 1200rem 기준
- **그리드:** 컬럼 수, gap
- **주요 섹션:** 섹션별 높이/구조 설명
- **모바일 분기점:** 768px 이하 변경 사항
```
