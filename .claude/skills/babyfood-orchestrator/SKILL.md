---
name: babyfood-orchestrator
description: "이유식 홈페이지 개발 에이전트 팀을 조율하는 오케스트레이터. '이유식 홈페이지 만들어줘', '페이지 추가해줘', '컴포넌트 개발해줘', '전체 개발 시작해줘' 등 이유식 홈페이지 개발 요청 시 반드시 이 스킬을 사용할 것. 후속 작업: 이유식 홈페이지 수정, 페이지 추가, 디자인 변경, 부분 재개발, 업데이트, 보완, 다시 만들어줘, 이전 결과 개선 요청 시에도 반드시 이 스킬을 사용."
---

# BabyFood Orchestrator — 이유식 홈페이지 개발 총괄

이유식 홈페이지 개발 에이전트 팀(ui-planner, react-developer, style-artist, qa-reviewer)을 조율하여 완성된 React + CSS3 코드를 생성하는 통합 스킬.

## 실행 모드: 하이브리드

| Phase | 모드 | 이유 |
|-------|------|------|
| Phase 1 (설계) | 서브 에이전트 | ui-planner 단독 설계, 팀 통신 불필요 |
| Phase 2 (구현) | 에이전트 팀 | react-developer ↔ style-artist 실시간 className 협업 |
| Phase 3 (QA) | 서브 에이전트 | qa-reviewer 독립 검증 |

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| ui-planner | ui-planner | UI 구조 설계 | ui-design | `_workspace/01_ui-plan/` |
| react-developer | react-developer | React 컴포넌트 구현 | react-component | `src/*.jsx` |
| style-artist | style-artist | CSS3 스타일링 | css-styling | `src/*.css` |
| qa-reviewer | qa-reviewer | 코드 품질 검증 | code-quality | `_workspace/03_qa/review-report.md` |

---

## 워크플로우

### Phase 0: 컨텍스트 확인

기존 산출물 존재 여부를 확인하여 실행 모드를 결정한다.

1. `_workspace/` 디렉토리 존재 여부 확인
2. 실행 모드 결정:
   - **`_workspace/` 미존재** → 초기 실행. Phase 1 진행
   - **`_workspace/` 존재 + 부분 수정 요청** → 부분 재실행. 해당 에이전트만 재호출하고 기존 산출물 중 수정 대상만 덮어씀
   - **`_workspace/` 존재 + 새 기능/페이지 추가** → 새 실행. 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 Phase 1 진행

### Phase 1: 설계 (서브 에이전트 모드)

**실행 모드:** 서브 에이전트

1. `_workspace/00_input/` 폴더 생성 후 사용자 요청 내용 저장
2. ui-planner 서브 에이전트 호출:

   ```
   Agent(
     subagent_type: "ui-planner",
     model: "opus",
     prompt: "이유식 홈페이지 UI를 설계하라.
       요청: [사용자 요청 내용]
       참조: CLAUDE.local.md 컨벤션 (시맨틱 마크업, h1 → 로고)
       출력:
       - _workspace/01_ui-plan/component-tree.md (컴포넌트 계층)
       - _workspace/01_ui-plan/layout-spec.md (레이아웃 명세)
       스킬 참조: .claude/skills/ui-design/SKILL.md"
   )
   ```

3. `_workspace/01_ui-plan/` 파일 Read로 설계 결과 수집
4. 설계 결과를 사용자에게 요약 보고하고, 계속 진행 여부 확인

### Phase 2: 구현 (에이전트 팀 모드)

**실행 모드:** 에이전트 팀

1. 팀 구성:

   ```
   TeamCreate(
     team_name: "babyfood-dev-team",
     members: [
       {
         name: "react-developer",
         agent_type: "react-developer",
         model: "opus",
         prompt: "이유식 홈페이지 React 컴포넌트를 구현하라.
           설계 참조: _workspace/01_ui-plan/component-tree.md, _workspace/01_ui-plan/layout-spec.md
           컨벤션 참조: .claude/skills/react-component/SKILL.md
           구현 완료된 컴포넌트마다 style-artist에게 SendMessage로 className 구조 전달.
           모든 구현 완료 시 리더에게 '구현 완료' 메시지 전송."
       },
       {
         name: "style-artist",
         agent_type: "style-artist",
         model: "opus",
         prompt: "이유식 홈페이지 CSS3 스타일을 작성하라.
           레이아웃 참조: _workspace/01_ui-plan/layout-spec.md
           컨벤션 참조: .claude/skills/css-styling/SKILL.md
           react-developer로부터 className 구조를 수신하면 즉시 해당 CSS 파일 작성.
           모든 스타일 완료 시 리더에게 '스타일링 완료' 메시지 전송."
       }
     ]
   )
   ```

2. 작업 등록:

   ```
   TaskCreate(tasks: [
     { title: "글로벌 스타일 작성", assignee: "style-artist", description: "index.css, App.css 작성" },
     { title: "Header 컴포넌트 구현", assignee: "react-developer", description: "h1 로고, nav 포함" },
     { title: "Header CSS 작성", assignee: "style-artist", depends_on: ["Header 컴포넌트 구현"] },
     { title: "홈 페이지 섹션 구현", assignee: "react-developer", depends_on: ["Header 컴포넌트 구현"] },
     { title: "홈 페이지 CSS 작성", assignee: "style-artist", depends_on: ["홈 페이지 섹션 구현"] },
     { title: "Footer 컴포넌트 구현", assignee: "react-developer" },
     { title: "Footer CSS 작성", assignee: "style-artist", depends_on: ["Footer 컴포넌트 구현"] },
     { title: "구현 노트 작성", assignee: "react-developer", description: "_workspace/02_react-dev/implementation-notes.md" }
   ])
   ```

3. 팀원 자체 조율 모니터링 (팀원 간 SendMessage로 className 공유)
4. 양쪽 팀원에게서 "완료" 메시지 수신 시 Phase 3 진행
5. TeamDelete로 팀 정리

### Phase 3: QA 검증 (서브 에이전트 모드)

**실행 모드:** 서브 에이전트

```
Agent(
  subagent_type: "qa-reviewer",
  model: "opus",
  prompt: "이유식 홈페이지 코드 품질을 검증하라.
    검증 대상: src/ 디렉토리 전체 (.jsx, .css 파일)
    컨벤션 참조: .claude/skills/code-quality/SKILL.md
    출력: _workspace/03_qa/review-report.md"
)
```

### Phase 4: 결과 보고

1. `_workspace/03_qa/review-report.md` Read
2. High 이슈가 있으면 사용자에게 이슈 목록 보고
3. 최종 파일 목록과 구조 요약 보고
4. `_workspace/` 디렉토리 보존 (감사 추적용)

---

## 데이터 흐름

```
사용자 요청
    ↓
[리더: Phase 0 컨텍스트 확인]
    ↓
[ui-planner 서브] → _workspace/01_ui-plan/*.md
    ↓
[리더: 설계 결과 보고 → 진행 확인]
    ↓
TeamCreate(react-developer + style-artist)
    ↓
react-developer ←SendMessage→ style-artist
(className 공유 / 실시간 협업)
    ↓
src/*.jsx + src/*.css 생성
    ↓
TeamDelete
    ↓
[qa-reviewer 서브] → _workspace/03_qa/review-report.md
    ↓
[리더: 결과 보고]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| ui-planner 실패 | 기본 이유식 홈페이지 구조로 대체 후 계속 진행 |
| react-developer 중지 | SendMessage로 상태 확인 → 재시작 또는 리더가 직접 구현 |
| style-artist 중지 | SendMessage로 상태 확인 → 재시작 또는 임시 스타일로 진행 |
| qa-reviewer 실패 | 보고서 없이 구현 완료 상태로 보고, 추후 별도 QA 수행 권고 |
| 팀원 간 className 충돌 | react-developer가 기준 제안, style-artist가 수용하도록 리더가 조정 |

## 테스트 시나리오

### 정상 흐름

1. 사용자: "이유식 홈페이지 만들어줘"
2. Phase 0: `_workspace/` 없음 → 초기 실행
3. Phase 1: ui-planner가 component-tree.md, layout-spec.md 생성
4. 리더: 설계 결과 보고 → 사용자 확인
5. Phase 2: react-developer + style-artist 팀이 src/ 파일들 생성
6. Phase 3: qa-reviewer가 review-report.md 생성
7. Phase 4: 최종 보고 (파일 목록 + QA 결과 요약)

### 에러 흐름

1. Phase 2에서 style-artist가 react-developer의 className 수신 전에 작업 시작
2. style-artist가 SendMessage로 className 확인 요청
3. react-developer가 Header.jsx 완료 후 SendMessage로 className 목록 전달
4. style-artist가 Header.css 작성 재개
5. 정상 흐름으로 복귀
