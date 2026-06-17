---
name: css-styling
description: "이유식 홈페이지의 CSS3 스타일을 작성한다. '스타일 입혀줘', 'CSS 작성해줘', '디자인해줘', '색깔 바꿔줘', '레이아웃 꾸며줘', '반응형 만들어줘' 등의 요청 시 반드시 이 스킬을 사용할 것. CLAUDE.local.md CSS 컨벤션을 엄격히 적용한다."
---

# CSS Styling Skill — 이유식 홈페이지 스타일링

CLAUDE.local.md CSS 컨벤션을 기반으로 스타일을 작성한다.

## CSS 컨벤션 (위반 시 QA에서 반려됨)

| 항목 | 규칙 | 예시 |
|------|------|------|
| 클래스명 | camelCase | `.recipeCard`, `.heroSection` |
| 색상 | hex 코드 직접 작성 | `color: #333333;` |
| 간격 | rem 단위 | `padding: 2rem 4rem;` |
| CSS 변수 | 사용 금지 | `var(--primary)` 작성 금지 |
| clamp() | 사용 금지 | `gap: 2rem;` 으로 대체 |
| CSS 주석 | 어디 컨텐츠인지만 기록 | `/* 헤더 */`, `/* 레시피 카드 */` |
| rem 변환 주석 | 작성 금지 | `/* 32px */` 같은 주석 금지 |

## 권장 컬러 팔레트

실제 디자인 요구사항이 있으면 그것을 우선하고, 없으면 아래 팔레트를 사용한다.

```css
/* 메인 강조색: 따뜻한 오렌지 */
#ff8c42

/* 보조 강조색: 건강한 그린 */
#4caf50

/* 배경: 따뜻한 화이트 */
#fffdf7

/* 기본 텍스트 */
#333333

/* 보조 텍스트 */
#777777

/* 구분선/테두리 */
#e8e8e8
```

## 글로벌 스타일 (index.css)

```css
/* 글로벌 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #333333;
  background-color: #fffdf7;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

## 레이아웃 패턴

### 최대 너비 컨테이너

```css
/* 레이아웃 컨테이너 */
.container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 2rem;
}
```

### 그리드 레이아웃 (레시피 카드 등)

```css
/* 레시피 그리드 */
.recipeGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* 모바일 */
@media (max-width: 768px) {
  .recipeGrid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
```

## 반응형 기준점

| 구간 | 기준 | 대응 |
|------|------|------|
| 모바일 | ~ 767px | 1열 레이아웃, 햄버거 메뉴 |
| 태블릿 | 768px ~ 1023px | 2열 레이아웃 |
| 데스크톱 | 1024px ~ | 3열 레이아웃 |

## 파일 구조

```
src/
├── index.css              # 글로벌 스타일, 리셋, 타이포그래피
├── App.css                # 앱 레벨 레이아웃
├── components/
│   ├── layout/
│   │   ├── Header.css
│   │   └── Footer.css
│   ├── sections/
│   │   ├── HeroSection.css
│   │   └── RecipeHighlight.css
│   └── common/
│       └── RecipeCard.css
└── pages/
    ├── HomePage.css
    └── RecipePage.css
```

## 트랜지션 기본값

```css
/* 버튼/카드 호버 전환 */
transition: all 0.3s ease;
```
