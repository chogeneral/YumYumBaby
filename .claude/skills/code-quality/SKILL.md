---
name: code-quality
description: "이유식 홈페이지 코드의 품질을 검증한다. '코드 검토해줘', '컨벤션 확인해줘', '시맨틱 마크업 맞는지 봐줘', 'QA 해줘', '코드 리뷰해줘' 등의 요청 시 반드시 이 스킬을 사용할 것. CLAUDE.local.md 컨벤션 준수 여부를 교차 검증한다."
---

# Code Quality Skill — 코드 품질 검증

src/ 디렉토리의 .jsx와 .css 파일을 읽고 CLAUDE.local.md 컨벤션 준수 여부를 검증한다.

## 검증 순서

1. `src/` 디렉토리 내 모든 `.jsx` 파일 목록 수집
2. `src/` 디렉토리 내 모든 `.css` 파일 목록 수집
3. 각 파일을 Read로 읽어 체크리스트 항목 검증
4. `_workspace/03_qa/review-report.md`에 결과 기록

## JSX 검증 체크리스트

### 필수 통과 (High — 위반 시 즉시 수정 필요)

- 작은따옴표('') 문자열 없음 — `'text'` 형태는 `"text"`로 교체 필요
- 세미콜론 누락 없음 — 모든 구문 끝에 `;` 확인
- h1이 로고/사이트명에만 사용됨 (페이지 내 h1 개수 1개)
- 헤딩 계층 순서 논리적 (h1 → h2 → h3, 단계 건너뜀 없음)

### 권장 통과 (Medium)

- 들여쓰기 스페이스 2칸 (탭 문자 `\t` 없음)
- 컴포넌트명 PascalCase
- 변수/함수명 camelCase
- 이벤트 핸들러 `handle` 접두사
- 이미지 태그 alt 속성 존재
- nav, main, article, section, footer 적절히 사용

### 선택 권장 (Low)

- 한국어 주석으로 WHY 설명
- 컴포넌트당 50줄 이내

## CSS 검증 체크리스트

### 필수 통과 (High)

- hex 색상 직접 사용 (CSS 변수 `var(--*)` 없음)
- rem 단위 사용 (간격에 px 단위 없음 — font-size 제외)
- clamp() 함수 없음

### 권장 통과 (Medium)

- 클래스명 camelCase
- rem 변환 주석 없음 (`/* 32px */` 형태 주석)
- CSS 주석은 컨텐츠 위치만 기록

## 교차 검증: JSX ↔ CSS 정합성

JSX 파일에서 사용된 className 목록과 CSS 파일의 클래스 정의를 비교한다.

- JSX에서 사용했지만 CSS에 정의 없는 className → "미정의 클래스" 목록
- CSS에 정의했지만 JSX에서 사용하지 않는 클래스 → "미사용 클래스" 목록

## 보고서 출력 형식

```markdown
# QA 검증 보고서

## 요약
- 검증 파일: JSX N개, CSS N개
- High 이슈: N건
- Medium 이슈: N건
- Low 이슈: N건

## High 이슈 (즉시 수정 필요)

### [파일명.jsx] 줄 N
- 이슈: 작은따옴표 사용 — `'레시피'` → `"레시피"` 로 수정 필요

## Medium 이슈

...

## 교차 정합성

### 미정의 클래스 (JSX에서 사용, CSS에 없음)
- `.recipeTitle` — RecipeCard.jsx 줄 12

### 미사용 클래스 (CSS에 정의, JSX에서 사용 안 함)
- `.cardWrapper` — RecipeCard.css 줄 45
```
