---
name: react-component
description: "이유식 홈페이지의 React 컴포넌트를 JavaScript로 구현한다. '컴포넌트 만들어줘', '기능 구현해줘', '페이지 만들어줘', 'JSX 작성', 'React 코드 짜줘' 등의 요청 시 반드시 이 스킬을 사용할 것. CLAUDE.local.md 컨벤션을 엄격히 적용한다."
---

# React Component Skill — 이유식 홈페이지 컴포넌트 구현

CLAUDE.local.md 코드 컨벤션을 기반으로 React 컴포넌트를 작성한다.

## 코드 컨벤션 (위반 시 QA에서 반려됨)

| 항목 | 규칙 | 예시 |
|------|------|------|
| 들여쓰기 | 스페이스 2칸 | `  const name = "홍길동";` |
| 세미콜론 | 반드시 사용 | `import React from "react";` |
| 따옴표 | 큰따옴표("") | `className="recipeCard"` |
| 변수/함수명 | camelCase | `recipeList`, `handleCardClick` |
| 컴포넌트명 | PascalCase | `RecipeCard`, `HeroSection` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSubmit`, `handleMenuToggle` |
| 주석 | 한국어, WHY 설명 | `// 레시피 카드를 클릭하면 상세 페이지로 이동` |

## 컴포넌트 파일 템플릿

```jsx
import React from "react";
import "./ComponentName.css";

// [컴포넌트 역할 한 줄 설명]
function ComponentName({ propA, propB }) {
  return (
    <section className="componentName">
      <h2>{propA}</h2>
    </section>
  );
}

export default ComponentName;
```

## 시맨틱 마크업 규칙

시맨틱 태그를 사용하면 검색 엔진과 스크린 리더가 콘텐츠 구조를 이해하므로, JSX에서도 div 대신 의미 있는 태그를 사용한다.

| 컴포넌트 유형 | 사용할 HTML 태그 |
|-------------|---------------|
| 사이트 로고 | `<h1>` (페이지당 1번) |
| 내비게이션 | `<nav>` |
| 페이지 주요 콘텐츠 | `<main>` |
| 독립적 콘텐츠 블록 | `<article>` |
| 관련 콘텐츠 묶음 | `<section>` |
| 사이트 하단 | `<footer>` |
| 섹션 소제목 | `<h2>` ~ `<h6>` (계층 순서 유지) |

## 파일 구조

```
src/
├── components/
│   ├── common/        # 재사용 공통 컴포넌트 (Button, Card 등)
│   ├── layout/        # 레이아웃 컴포넌트 (Header, Footer, Nav)
│   └── sections/      # 페이지 섹션 컴포넌트
├── pages/             # 페이지 컴포넌트 (HomePage, RecipePage 등)
├── hooks/             # 커스텀 훅
└── utils/             # 유틸리티 함수
```

## 상태 관리 원칙

컴포넌트 내부에서만 쓰는 데이터는 로컬 상태(useState)를 사용한다. 여러 컴포넌트가 공유하는 데이터는 상위 컴포넌트로 올리거나(lifting state up) Context API를 사용한다.

## 이미지 처리

```jsx
// 이미지는 반드시 alt 속성을 포함 — 접근성 필수
<img src={recipe.imageUrl} alt={`${recipe.name} 이유식 사진`} />
```
