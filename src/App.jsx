import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Baby,
  Utensils,
  Info,
  X,
  LogOut,
  ChevronLeft
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { babyFoodStages, babyFoodRecipes, recipeMedia } from "./data/babyFoodData";
import { supabase } from "./lib/supabase";

// 한국 공휴일 (2024~2027). 달력에서 일요일과 함께 빨간색으로 표시됩니다.
const KOREAN_HOLIDAYS = new Set([
  // 신정
  "2024-01-01", "2025-01-01", "2026-01-01", "2027-01-01",
  // 설날 연휴
  "2024-02-09", "2024-02-10", "2024-02-11",
  "2025-01-28", "2025-01-29", "2025-01-30",
  "2026-01-28", "2026-01-29", "2026-01-30",
  "2027-02-16", "2027-02-17", "2027-02-18",
  // 삼일절
  "2024-03-01", "2025-03-01", "2026-03-01", "2027-03-01",
  // 어린이날
  "2024-05-05", "2025-05-05", "2026-05-05", "2027-05-05",
  // 부처님오신날
  "2024-05-15", "2026-05-24", "2027-05-13",
  // 현충일
  "2024-06-06", "2025-06-06", "2026-06-06", "2027-06-06",
  // 광복절
  "2024-08-15", "2025-08-15", "2026-08-15", "2027-08-15",
  // 추석 연휴
  "2024-09-16", "2024-09-17", "2024-09-18",
  "2025-10-05", "2025-10-06", "2025-10-07", "2025-10-08",
  "2026-09-24", "2026-09-25", "2026-09-26",
  "2027-10-14", "2027-10-15", "2027-10-16",
  // 개천절
  "2024-10-03", "2025-10-03", "2026-10-03", "2027-10-03",
  // 한글날
  "2024-10-09", "2025-10-09", "2026-10-09", "2027-10-09",
  // 크리스마스
  "2024-12-25", "2025-12-25", "2026-12-25", "2027-12-25",
]);

// 애플리케이션의 전체 기능과 라우팅, 회원 관리를 수행하는 메인 App 컴포넌트입니다.
export default function App() {
  // --- 상태 관리 정의 ---
  const [currentTab, setCurrentTab] = useState("home");

  // Supabase Auth 세션 객체 — 로그인 여부 판단의 단일 진실 공급원
  const [supabaseSession, setSupabaseSession] = useState(null);

  // profiles 테이블에서 가져온 아기 정보 — 세션과 별도로 관리하여 DB 데이터를 UI에 반영
  const [userProfile, setUserProfile] = useState(null);

  // 앱 최초 로딩 시 세션 복구 중임을 나타냄 — 복구 완료 전에 UI를 렌더링하면 깜빡임 발생
  const [authLoading, setAuthLoading] = useState(true);

  // 레시피 목록 — Supabase DB에서 fetch, 실패 시 정적 데이터 유지
  const [recipes, setRecipes] = useState(babyFoodRecipes);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // 회원가입 폼 — Supabase Auth는 email+password 기반이므로 email 필드 포함
  const [registerForm, setRegisterForm] = useState({
    email: "",
    parentName: "",
    babyName: "",
    babyBirth: "",
    password: ""
  });

  // 로그인 폼 — Supabase signInWithPassword 는 email 기준으로 인증
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  // 비밀번호 재설정 모달 — Supabase PASSWORD_RECOVERY 이벤트 수신 시 노출
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // 아이디 찾기 폼 — 부모 이름 + 아기 이름으로 이메일 조회
  const [findEmailForm, setFindEmailForm] = useState({ parentName: "", babyName: "" });
  // null: 초기 상태, "notFound": 미조회, string: 찾은 이메일
  const [findEmailResult, setFindEmailResult] = useState(null);

  // 비밀번호 찾기 폼 — 이메일로 재설정 메일 발송
  const [findPasswordForm, setFindPasswordForm] = useState({ email: "" });
  const [findPasswordSent, setFindPasswordSent] = useState(false);

  // 회원정보 수정 폼 — 수정 페이지 진입 시 현재 userProfile 값으로 초기화
  const [editProfileForm, setEditProfileForm] = useState({ username: "", babyName: "", babyBirth: "" });

  const [calcDate, setCalcDate] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeFilter, setRecipeFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [stageTab, setStageTab] = useState("early");
  // 초기 탭 내부에서 1단계/2단계를 전환하기 위한 서브탭 상태입니다.
  const [earlySubTab, setEarlySubTab] = useState("early1");

  // 레시피의 stage와 subStage를 기반으로 태그에 적용할 CSS 클래스명을 반환합니다.
  // 초기 이유식은 1단계(early1)와 2단계(early2)를 시각적으로 구분하기 위해 별도 클래스를 사용합니다.
  const getStageTagClass = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "tagEarly1" : "tagEarly2";
    }
    if (recipe.stage === "middle") return "tagMiddle";
    if (recipe.stage === "late") return "tagLate";
    return "tagComplete";
  };

  // 레시피의 stage와 subStage를 기반으로 태그에 표시할 한국어 라벨을 반환합니다.
  const getStageTagText = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "초기 1단계" : "초기 2단계";
    }
    if (recipe.stage === "middle") return "중기";
    if (recipe.stage === "late") return "후기";
    return "완료기";
  };

  // 레시피 상세 모달용 라벨 — "이유식" 접미사가 붙은 형태를 반환합니다.
  const getStageTagTextFull = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "초기 1단계 이유식" : "초기 2단계 이유식";
    }
    if (recipe.stage === "middle") return "중기 이유식";
    if (recipe.stage === "late") return "후기 이유식";
    return "완료기 이유식";
  };

  // 초기 1단계 레시피의 이유식 도입 권장 순서입니다.
  // 곡물(쌀→찹쌀→오트밀) → 순한 채소(애호박→감자→고구마→단호박)
  // → 녹색 채소(브로콜리→양배추→시금치→청경채→비타민)
  // → 기타 채소(당근→완두콩→콜리플라워→오이) → 과일(바나나→아보카도)
  const EARLY1_FEED_ORDER = {
    recipeEarly01: 1,
    recipeEarly17: 2,
    recipeEarly13: 3,
    recipeEarly02: 4,
    recipeEarly06: 5,
    recipeEarly04: 6,
    recipeEarly05: 7,
    recipeEarly03: 8,
    recipeEarly18: 9,
    recipeEarly10: 10,
    recipeEarly12: 11,
    recipeEarly16: 12,
    recipeEarly07: 13,
    recipeEarly09: 14,
    recipeEarly20: 15,
    recipeEarly21: 16,
    recipeEarly11: 17,
    recipeEarly19: 18,
  };

  // 초기 2단계 레시피의 이유식 도입 권장 순서입니다.
  // 육류 단독(소고기→닭고기) → 소고기+채소 조합 → 소고기+과일 조합
  // → 닭고기+채소 조합 → 채소·과일 복합 → 곡물 변형+고기 → 3재료 복합
  const EARLY2_FEED_ORDER = {
    // 육류 단독 도입 — 철분 보충을 위해 가장 먼저 도입
    recipeEarly15: 1,
    recipeEarly14: 2,
    // 소고기 + 채소 조합 — 익숙한 채소부터 조합
    recipeEarly34: 3,
    recipeEarly25: 4,
    recipeEarly33: 5,
    recipeEarly28: 6,
    recipeEarly40: 7,
    recipeEarly32: 8,
    // 소고기 + 과일 조합 — 비타민C가 철분 흡수를 도움
    recipeEarly50: 9,
    recipeEarly35: 10,
    recipeEarly08: 11,
    recipeEarly37: 12,
    // 닭고기 + 채소·과일 조합
    recipeEarly27: 13,
    recipeEarly41: 14,
    recipeEarly49: 15,
    recipeEarly38: 16,
    // 채소·과일 복합 미음 — 고기 없는 조합
    recipeEarly22: 17,
    recipeEarly26: 18,
    recipeEarly29: 19,
    recipeEarly31: 20,
    recipeEarly39: 21,
    recipeEarly42: 22,
    recipeEarly24: 23,
    recipeEarly30: 24,
    recipeEarly36: 25,
    // 곡물 변형 + 고기 조합
    recipeEarly43: 26,
    recipeEarly44: 27,
    recipeEarly45: 28,
    recipeEarly46: 29,
    // 3가지 재료 복합 미음
    recipeEarly23: 30,
    recipeEarly47: 31,
    recipeEarly48: 32,
  };

  // 비로그인 상태에서 보호된 탭 진입 시도 시 로그인 후 이동할 탭을 임시 저장합니다.
  const [pendingTab, setPendingTab] = useState(null);

  // 메뉴 추천 날짜 — 오늘 날짜를 기본값으로 하며, 날짜 변경 시 일별 다른 메뉴를 추천합니다.
  const [menuPickerDate, setMenuPickerDate] = useState(new Date().toISOString().split("T")[0]);

  // 달력에서 현재 보고 있는 월의 시작일 — 월 이동 시 단계·메뉴가 해당 월 기준으로 재계산됩니다.
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());


  // --- Supabase 데이터 fetch 함수 ---

  // 로그인한 유저의 babyFoodProfiles 테이블 행을 조회합니다.
  // onAuthStateChange 내부에서도 호출되므로 별도 함수로 분리합니다.
  const fetchUserProfile = async (userId) => {
    // 프로필이 없을 경우 406 에러 방지를 위해 maybeSingle 사용
    const { data, error } = await supabase
      .from("babyFoodProfiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      setUserProfile(data);
    }
  };

  // --- 앱 마운트 시 세션 복구 및 실시간 구독 ---
  useEffect(() => {
    // 새로고침 후 기존 세션을 복구합니다.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      if (session) fetchUserProfile(session.user.id);
      setAuthLoading(false);
    });

    // 로그인/로그아웃 이벤트를 실시간으로 감지합니다.
    // PASSWORD_RECOVERY 이벤트는 재설정 메일의 링크 클릭 시 Supabase가 발생시킵니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseSession(session);
      if (event === "PASSWORD_RECOVERY") {
        setShowPasswordResetModal(true);
        setPasswordResetSuccess(false);
      } else if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제 — 메모리 누수 방지
    return () => subscription.unsubscribe();
  }, []);

  // --- 비즈니스 로직 함수 정의 ---

  // 아기의 생일을 기준으로 오늘까지의 생후 개월 수를 계산합니다.
  const calculateMonths = (birthDateString) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    return months < 0 ? 0 : months;
  };

  // 개월 수에 맞는 이유식 단계를 결정합니다.
  // 후기(10~11개월)와 완료기(12~23개월)를 별도 stageId로 분리하여 레시피 필터와 UI 태그가 각 단계에 맞게 표시되도록 합니다.
  const determineStage = (months) => {
    if (months < 4) {
      return {
        stageId: "none",
        stageName: "이유식 준비기",
        description: "아직 이유식을 시작하기에 이른 시기입니다. 만 4개월까지는 모유나 분유만을 섭취하는 것이 좋습니다."
      };
    } else if (months >= 4 && months <= 6) {
      return {
        stageId: "early",
        stageName: "초기",
        description: "부드럽고 묽은 미음으로 알레르기 반응을 확인하며 이유식을 시작하는 시기입니다."
      };
    } else if (months >= 7 && months <= 9) {
      return {
        stageId: "middle",
        stageName: "중기",
        description: "잇몸으로 음식 알갱이를 으깨 먹는 훈련을 하고, 철분 흡수를 위해 소고기 등 육류를 섭취하는 시기입니다."
      };
    } else if (months >= 10 && months <= 11) {
      return {
        stageId: "late",
        stageName: "후기",
        description: "무른밥·진밥 형태로 아침/점심/저녁 하루 세 번 규칙적으로 다양한 음식을 먹기 시작하는 시기입니다."
      };
    } else if (months >= 12 && months <= 23) {
      return {
        stageId: "complete",
        stageName: "완료기",
        description: "이유식을 마무리하고 가족 식사(유아식)로 넘어가는 전환 단계입니다. 진밥·잡곡밥 위주로 다양한 반찬을 함께 제공하며 스스로 먹는 습관을 길러줍니다."
      };
    } else {
      return {
        stageId: "graduation",
        stageName: "이유식 완료 및 유아식 시기",
        description: "이유식 단계를 졸업하여 어른들과 비슷한 식사를 할 수 있는 유아식 단계입니다. 저염식 반찬을 추천합니다."
      };
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!calcDate) {
      alert("아기 태어난 날을 선택해주세요.");
      return;
    }
    const months = calculateMonths(calcDate);
    const stageInfo = determineStage(months);
    setCalcResult({ months, ...stageInfo });
  };

  // 회원가입 폼의 각 입력 필드 값이 바뀔 때 상태를 업데이트하고, 브라우저의 커스텀 에러 상태(invalid)를 초기화하는 공용 이벤트 핸들러입니다.
  const handleRegisterChange = (e, field) => {
    // 사용자가 텍스트를 수정하기 시작하면 에러 메시지를 지워 브라우저 경고 상태를 해제합니다.
    e.target.setCustomValidity("");
    setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Supabase Auth 회원가입 — 트리거 없이 앱에서 직접 profiles 행을 생성합니다.
  // signUp으로 계정 생성 후, 반환된 user.id를 사용하여 profiles 테이블에 직접 INSERT합니다.
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { email, parentName, babyName, babyBirth, password } = registerForm;

    if (!email || !parentName || !babyName || !babyBirth || !password) {
      alert("모든 정보를 정확하게 입력해 주세요.");
      return;
    }

    // 이메일이 표준적인 형식(예: user@example.com)에 부합하는지 검사하기 위한 정규식입니다.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 이메일 입력 필드의 DOM 요소를 가져와 브라우저 기본 툴팁(말풍선)을 띄우기 위해 준비합니다.
    const emailInput = document.getElementById("regEmail");

    // 입력된 이메일이 올바른 형식인지 검사하고, 아닐 경우 브라우저 툴팁으로 에러를 안내합니다.
    if (!emailRegex.test(email)) {
      emailInput.setCustomValidity("올바른 이메일 형식이 아닙니다.");
      emailInput.reportValidity(); // 화면에 에러 말풍선 툴팁을 유지시킵니다. (onChange 시 해제됨)
      return;
    }

    // 부모 이름과 아기 이름이 자음/모음이 결합된 올바른 한글로만 구성되어 있는지 검사하기 위한 정규식입니다.
    const koreanRegex = /^[가-힣]+$/;

    // 부모 이름 입력 필드의 DOM 요소를 가져옵니다.
    const parentNameInput = document.getElementById("regParentName");

    // 부모 이름에 한글만 입력되었는지 유효성을 검사합니다.
    if (!koreanRegex.test(parentName)) {
      parentNameInput.setCustomValidity("부모 이름은 한글로만 입력해 주세요.");
      parentNameInput.reportValidity(); // 화면에 에러 말풍선 툴팁을 유지시킵니다.
      return;
    }

    // 우리 아기 이름 입력 필드의 DOM 요소를 가져옵니다.
    const babyNameInput = document.getElementById("regBabyName");

    // 아기 이름에 한글만 입력되었는지 유효성을 검사합니다.
    if (!koreanRegex.test(babyName)) {
      babyNameInput.setCustomValidity("우리아기 이름은 한글로만 입력해 주세요.");
      babyNameInput.reportValidity(); // 화면에 에러 말풍선 툴팁을 유지시킵니다.
      return;
    }

    // 비밀번호 입력 필드의 DOM 요소를 가져옵니다.
    const passwordInput = document.getElementById("regPassword");

    // 비밀번호가 최소 6자 이상으로 올바르게 설정되었는지 사전 검사합니다.
    if (password.length < 6) {
      passwordInput.setCustomValidity("비밀번호는 최소 6자 이상이어야 합니다.");
      passwordInput.reportValidity(); // 화면에 에러 말풍선 툴팁을 유지시킵니다.
      return;
    }

    // 1단계: Supabase Auth에 계정만 생성 (메타데이터 없이 순수 인증만 처리)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error("회원가입 상세 오류:", error);
      const msg = error.message || error.code || String(error.status) || "Supabase 연결 오류 — 콘솔을 확인하세요.";
      alert(`회원가입 오류: ${msg}`);
      return;
    }

    // 이미 가입된 이메일이면 identities 배열이 비어 있음
    if (data?.user?.identities?.length === 0) {
      alert("이미 가입된 이메일입니다. 로그인을 이용해 주세요.");
      setAuthMode("login");
      return;
    }

    // 2단계: 생성된 user의 id로 babyFoodProfiles 테이블에 직접 행을 삽입합니다.
    // DB 트리거 대신 앱에서 직접 처리하여 500 에러를 방지합니다.
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from("babyFoodProfiles")
        .insert({
          id: data.user.id,
          username: parentName,
          babyName: babyName,
          babyBirth: babyBirth,
          email: email
        });

      if (profileError) {
        console.error("프로필 생성 오류:", profileError);
      }
    }

    alert("회원가입이 완료되었습니다! 이메일 인증 후 로그인해 주세요.");
    setRegisterForm({ email: "", parentName: "", babyName: "", babyBirth: "", password: "" });
    setAuthMode("login");
  };

  // Supabase Auth 로그인 — 세션 복구는 onAuthStateChange 가 자동 처리합니다.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(`로그인 오류: ${error.message}`);
      return;
    }

    setShowAuthModal(false);
    setLoginForm({ email: "", password: "" });
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
      if (pendingTab === "recipes") {
        setRecipeFilter("all");
        setSearchQuery("");
      }
    } else {
      setCurrentTab("home");
    }
  };

  // Supabase Auth 로그아웃 — 서버 세션 무효화 + 로컬 세션 제거를 한 번에 처리합니다.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentTab("home");
  };

  // 회원 탈퇴 — babyFoodProfiles 행 삭제 후 로그아웃합니다.
  // auth.users 행의 완전한 삭제는 Supabase Admin API 권한이 필요하므로 프로필만 제거합니다.
  const handleWithdrawal = async () => {
    if (!supabaseSession) return;
    if (!confirm("정말로 탈퇴하시겠습니까? 등록된 모든 아기 정보와 계정이 영구 삭제됩니다.")) return;

    const { error } = await supabase
      .from("babyFoodProfiles")
      .delete()
      .eq("id", supabaseSession.user.id);

    if (error) {
      alert(`탈퇴 처리 중 오류가 발생했습니다: ${error.message}`);
      return;
    }

    await supabase.auth.signOut();
    setCurrentTab("home");
    alert("탈퇴 처리가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
  };

  // 새 비밀번호와 확인 비밀번호를 검증한 뒤 Supabase Auth를 통해 비밀번호를 갱신합니다.
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwordResetForm;
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }
    if (newPassword.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert(`비밀번호 변경 오류: ${error.message}`);
      return;
    }
    setPasswordResetSuccess(true);
    setPasswordResetForm({ newPassword: "", confirmPassword: "" });
  };

  // 회원정보 수정 — babyFoodProfiles 테이블의 username, babyName, babyBirth를 갱신합니다.
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    const { username, babyName, babyBirth } = editProfileForm;

    // 회원가입과 동일한 한글 유효성 검사 패턴 재사용
    const koreanRegex = /^[가-힣]+$/;
    if (!koreanRegex.test(username)) {
      alert("부모 이름은 한글로만 입력해 주세요.");
      return;
    }
    if (!koreanRegex.test(babyName)) {
      alert("아기 이름은 한글로만 입력해 주세요.");
      return;
    }

    const { error } = await supabase
      .from("babyFoodProfiles")
      .update({ username, babyName, babyBirth })
      .eq("id", supabaseSession.user.id);

    if (error) {
      alert(`수정 오류: ${error.message}`);
      return;
    }

    // 수정 후 userProfile 상태를 DB에서 즉시 재조회하여 마이페이지에 반영
    await fetchUserProfile(supabaseSession.user.id);
    setCurrentTab("myPage");
    alert("회원정보가 수정되었습니다.");
  };

  // babyFoodProfiles에서 부모 이름 + 아기 이름으로 가입 이메일을 조회합니다.
  const handleFindEmail = async (e) => {
    e.preventDefault();
    const { parentName, babyName } = findEmailForm;
    const { data, error } = await supabase
      .from("babyFoodProfiles")
      .select("email")
      .eq("username", parentName)
      .eq("babyName", babyName)
      .maybeSingle();
    if (error) {
      alert("조회 중 오류가 발생했습니다.");
      return;
    }
    setFindEmailResult(data?.email || "notFound");
  };

  // Supabase Auth 비밀번호 재설정 메일을 발송합니다.
  const handleFindPassword = async (e) => {
    e.preventDefault();
    const { email } = findPasswordForm;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(`오류가 발생했습니다: ${error.message}`);
      return;
    }
    setFindPasswordSent(true);
  };

  // 검색어 + 단계 필터로 레시피 목록을 걸러냅니다.
  const getFilteredRecipes = () => {
    return recipes.filter(recipe => {
      const matchesSearch = searchQuery === "" ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = recipeFilter === "all" || recipe.stage === recipeFilter;
      return matchesSearch && matchesStage;
    });
  };

  // 로그인 상태에서 아기 생일을 기준으로 현재 이유식 단계를 계산합니다.
  const getBabyCurrentStage = () => {
    if (!userProfile) return null;
    const months = calculateMonths(userProfile.babyBirth);
    const stageDetails = determineStage(months);
    return { months, ...stageDetails };
  };

  const babyInfo = getBabyCurrentStage();

  // 특정 기준일(targetDate) 기준으로 생후 개월 수를 계산합니다. (달력 월 이동 시 해당 월 기준 단계 계산에 사용)
  const calculateMonthsAtDate = (birthDateString, targetDate) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    let months = (targetDate.getFullYear() - birthDate.getFullYear()) * 12 +
                 (targetDate.getMonth() - birthDate.getMonth());
    if (targetDate.getDate() < birthDate.getDate()) months--;
    return months < 0 ? 0 : months;
  };

  // Date 객체로부터 "YYYY-MM-DD" 문자열을 로컬 타임존 기준으로 생성합니다.
  const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 특정 Date 객체에 해당하는 단계별 메뉴 배열을 반환합니다. (달력 타일 렌더링에 사용)
  const getDayMenus = (date) => {
    if (!userProfile?.babyBirth) return [];
    // 타일 날짜 기준 생후 개월 수로 단계 결정 — 월 이동 시 해당 월의 단계 메뉴가 표시됨
    const months = calculateMonthsAtDate(userProfile.babyBirth, date);
    const stageInfo = determineStage(months);
    if (stageInfo.stageId === "none" || stageInfo.stageId === "graduation") return [];

    const stageRecipes = recipes.filter(r => r.stage === stageInfo.stageId);
    if (!stageRecipes.length) return [];

    const daySeed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    const mealCount = stageInfo.stageId === "early" ? 1 : stageInfo.stageId === "middle" ? 2 : 3;
    return Array.from({ length: mealCount }, (_, i) =>
      stageRecipes[(daySeed + i) % stageRecipes.length]
    );
  };

  // 선택한 날짜의 전체 추천 메뉴(라벨 포함)를 반환합니다.
  const getMenuRecommendation = () => {
    if (!userProfile?.babyBirth || !menuPickerDate) return null;
    const months = calculateMonths(userProfile.babyBirth);
    const stageInfo = determineStage(months);

    if (stageInfo.stageId === "none" || stageInfo.stageId === "graduation") {
      return { months, ...stageInfo, meals: [] };
    }

    const stageRecipes = recipes.filter(r => r.stage === stageInfo.stageId);
    if (!stageRecipes.length) return null;

    const dateObj = new Date(menuPickerDate + "T12:00:00");
    const daySeed = Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));

    const mealLabels = {
      early: ["오전 (하루 1회)"],
      middle: ["오전 (1회)", "오후 (2회)"],
      late: ["아침 (1회)", "점심 (2회)", "저녁 (3회)"],
      complete: ["아침 (1회)", "점심 (2회)", "저녁 (3회)"]
    };

    const labels = mealLabels[stageInfo.stageId];
    const meals = labels.map((label, i) => ({
      label,
      recipe: stageRecipes[(daySeed + i) % stageRecipes.length]
    }));

    return { months, ...stageInfo, meals };
  };

  const menuRecommendation = getMenuRecommendation();

  // 세션 복구 중에는 빈 화면 대신 로딩 표시 — 복구 전 렌더링으로 인한 로그인 버튼 깜빡임 방지
  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#fffdf7" }}>
        <div style={{ textAlign: "center", color: "#ff8c42" }}>
          <Baby size={40} />
          <p style={{ marginTop: "1.6rem", fontSize: "1.6rem", color: "#888888" }}>잠시만 기다려 주세요...</p>
        </div>
      </div>
    );
  }

  // --- 화면 렌더링 코드 시작 ---
  return (
    <div className="appContainer">
      {/* 1. 상단 공통 네비게이션 헤더 */}
      <header className="appHeader" id="appHeader">
        {/* 로고에 h1 적용 — 페이지 내 유일한 h1, 시맨틱 마크업 기준 */}
        <h1 className="headerLogo" onClick={() => setCurrentTab("home")}>
          <Baby size={28} />
          <span>베베레시피</span>
        </h1>

        <nav className="headerNav">
          {/* 사용자의 요청에 따라 GNB 네비게이션에서 홈 메뉴 이동 버튼을 삭제하였습니다. */}
          <span
            className={`navLink ${currentTab === "recipes" ? "navLinkActive" : ""}`}
            onClick={() => {
              if (!supabaseSession) {
                setPendingTab("recipes");
                setAuthMode("login");
                setShowAuthModal(true);
              } else {
                setCurrentTab("recipes");
                setRecipeFilter("all");
                setSearchQuery("");
              }
            }}
          >
            우리아기 이유식
          </span>
          <span
            className={`navLink ${currentTab === "reviews" ? "navLinkActive" : ""}`}
            onClick={() => setCurrentTab("reviews")}
          >
            레시피 후기
          </span>
          {supabaseSession && userProfile && (
            <span
              className={`navLink ${currentTab === "myPage" ? "navLinkActive" : ""}`}
              onClick={() => setCurrentTab("myPage")}
            >
              마이페이지
            </span>
          )}
        </nav>

        <div>
          {supabaseSession && userProfile ? (
            <div className="headerUserInfo">
              <span className="headerUserText">
                <strong>{userProfile.babyName}</strong> 아기 방
              </span>
              <button className="headerLogoutBtn" onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: "0.4rem", verticalAlign: "middle" }} />
                로그아웃
              </button>
            </div>
          ) : (
            <button
              className="headerAuthBtn"
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
            >
              회원가입 / 로그인
            </button>
          )}
        </div>
      </header>

      {/* 2. 메인 페이지 콘텐츠 영역 */}
      <main className="mainContent">

        {/* 메인 홈 탭 (home) */}
        {currentTab === "home" && (
          <div>
            {/* 히어로 배너 */}
            <div className="heroBanner">
              <span className="heroTag">우리 아기 건강 지킴이</span>
              {/* h1은 로고에서 이미 사용 — 슬로건은 h2 */}
              <h2 className="heroTitle">
                아기 생일 맞춤형으로 만나는 <span>이유식 추천 & 가이드</span>
              </h2>

              <div className="heroSearchBox">
                <input
                  type="text"
                  placeholder="예) 감자 미음, 소고기, 단호박..."
                  className="heroSearchInput"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // 홈에서 바로 검색 결과 표시 — 탭 전환 없음
                    }
                  }}
                />
                <button
                  className="heroSearchBtn"
                  onClick={() => {
                    // 홈에서 바로 검색 결과 표시 — 탭 전환 없음
                  }}
                >
                  <Search size={20} />
                </button>
              </div>
            </div>


            {/* 검색어가 있을 때만 검색 결과 섹션 표시 */}
            {searchQuery && (() => {
              const results = recipes.filter(recipe => {
                const q = searchQuery.toLowerCase();
                return (
                  recipe.name.toLowerCase().includes(q) ||
                  recipe.description.toLowerCase().includes(q) ||
                  recipe.ingredients.toLowerCase().includes(q)
                );
              });
              return (
                <section className="recipesSection">
                  <h2 className="sectionTitle">
                    &ldquo;{searchQuery}&rdquo; 검색 결과
                    <span style={{ fontSize: "1.4rem", fontWeight: 400, color: "#888888", marginLeft: "1rem" }}>
                      {results.length}건
                    </span>
                  </h2>
                  {results.length > 0 ? (
                    <div className="recipesGrid">
                      {results.map(recipe => (
                        <div
                          key={recipe.id}
                          className="recipeCard"
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          <span className={`recipeStageTag ${getStageTagClass(recipe)}`}>
                            {getStageTagText(recipe)}
                          </span>
                          <h3 className="recipeCardName">{recipe.name}</h3>
                          <p className="recipeCardDesc">{recipe.description}</p>
                          <div className="recipeCardFooter">
                            <span>재료: {recipe.ingredients.split(",")[0]}...</span>
                            <span>레시피 보기 <ChevronRight size={14} /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: "center", fontSize: "1.5rem", color: "#aaaaaa", padding: "4rem 0" }}>
                      &ldquo;{searchQuery}&rdquo;에 해당하는 레시피를 찾을 수 없습니다.
                    </p>
                  )}
                </section>
              );
            })()}

            {/* 검색어가 없을 때만 기존 가이드 + 레시피 미리보기 표시 */}
            {!searchQuery && (
            <>

            {/* 초기 중기 말기 이유식 기초 가이드 정보 */}
            <section className="stagesSection">
              <div className="stagesContainer">
                <h2 className="sectionTitle">이유식 단계별 핵심 정보 가이드</h2>

                <div className="stageTabWrapper">
                  {babyFoodStages.map(stage => (
                    <button
                      key={stage.id}
                      className={`stageTab ${stageTab === stage.id ? "stageTabActive" : ""}`}
                      onClick={() => setStageTab(stage.id)}
                    >
                      {stage.title}
                    </button>
                  ))}
                </div>

                {babyFoodStages.filter(s => s.id === stageTab).map(stage => {
                  // 초기 탭에서는 subStages가 있으면 서브탭으로 전환하여 1단계/2단계를 구분합니다.
                  // 중기/후기/완료기에서는 기존과 동일하게 stage 데이터를 직접 보여줍니다.
                  const hasSubStages = stage.subStages && stage.subStages.length > 0;
                  const displayData = hasSubStages
                    ? stage.subStages.find(sub => sub.id === earlySubTab) || stage.subStages[0]
                    : stage;

                  return (
                  <div key={stage.id}>
                    {/* 초기 탭에서만 서브탭(1단계/2단계) 표시 */}
                    {hasSubStages && (
                      <div className="earlySubTabWrapper">
                        {stage.subStages.map(sub => (
                          <button
                            key={sub.id}
                            className={`earlySubTab ${earlySubTab === sub.id ? "earlySubTabActive" : ""}`}
                            onClick={() => setEarlySubTab(sub.id)}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="stageDetailCard">
                      <div className="stageInfoLeft">
                        <span className="stageInfoPeriod">{displayData.period}</span>
                        <h3 className="stageInfoTitle">{displayData.title || stage.title} 가이드</h3>
                        <p className="stageInfoDesc">{displayData.description}</p>

                        <div className="stageSummaryGrid">
                          <div className="summaryItem">
                            <div className="summaryLabel">권장 섭취 횟수</div>
                            <div className="summaryVal">{displayData.dailyCount}</div>
                          </div>
                          <div className="summaryItem">
                            <div className="summaryLabel">음식의 굳기/질감</div>
                            <div className="summaryVal">{displayData.texture}</div>
                          </div>
                          {/* 초기 서브탭에서만 1회 권장량 표시 */}
                          {displayData.amount && (
                            <div className="summaryItem">
                              <div className="summaryLabel">1회 권장량</div>
                              <div className="summaryVal">{displayData.amount}</div>
                            </div>
                          )}
                          {displayData.keyIngredients && (
                            <div className="summaryItem">
                              <div className="summaryLabel">핵심 식재료</div>
                              <div className="summaryVal">{displayData.keyIngredients}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="stageInfoRight">
                        <h4 className="guideTitle">단계별 중요 영양 & 조리 수칙</h4>
                        <ul className="guideList">
                          {displayData.guidelines.map((line, idx) => (
                            <li key={idx} className={`guideItem${line.startsWith("[알레르기 체크]") ? " guideItemAlert" : ""}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* 인기 레시피 6개 미리보기 */}
            <section className="recipesSection">
              <h2 className="sectionTitle">이유식 메뉴 & 레시피</h2>
              <p style={{ textAlign: "center", fontSize: "1.4rem", color: "#666666", marginTop: "1rem" }}>
                아기들이 가장 선호하고 부모님들이 자주 끓이는 필수 레시피 모음입니다.
              </p>

              <div className="recipesGrid">
                {/* 메인 페이지 가이드의 선택된 탭 단계(stageTab)에 부합하는 이유식 레시피들만 필터링하고, 초기(early) 탭일 때는 1단계를 먼저 보여줍니다. */}
                {recipes && Array.isArray(recipes) && recipes
                  .filter(recipe => recipe?.stage === stageTab)
                  .sort((a, b) => {
                    // 초기 이유식 탭에서 1단계를 2단계보다 앞에 두고,
                    // 1단계 내에서는 이유식 도입 권장 순서(곡물→채소→과일)로 정렬합니다.
                    if (stageTab === "early") {
                      const subOrder = { early1: 0, early2: 1 };
                      const subDiff = (subOrder[a.subStage] ?? 1) - (subOrder[b.subStage] ?? 1);
                      if (subDiff !== 0) return subDiff;
                      // 같은 단계 내에서 이유식 도입 권장 순서대로 정렬합니다.
                      const orderMap = a.subStage === "early1" ? EARLY1_FEED_ORDER : EARLY2_FEED_ORDER;
                      return (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99);
                    }
                    return 0;
                  })
                  .map(recipe => (
                  <div
                    key={recipe.id}
                    className="recipeCard"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <span className={`recipeStageTag ${getStageTagClass(recipe)}`}>
                      {getStageTagText(recipe)}
                    </span>
                    <h3 className="recipeCardName">{recipe.name}</h3>
                    <p className="recipeCardDesc">{recipe.description}</p>
                    <div className="recipeCardFooter">
                      <span>재료: {recipe.ingredients.split(",")[0]}...</span>
                      <span>레시피 보기 <ChevronRight size={14} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            </>
            )}

          </div>
        )}

        {/* 이유식 레시피 목록 및 검색 탭 (recipes) */}
        {currentTab === "recipes" && (
          <div>
            {/* 타이틀 영역을 포함하는 상단 섹션입니다. 맞춤 추천 카드를 100% 폭으로 분리하기 위해 상단/하단 recipesSection을 나누었습니다. */}
            <div className="recipesSection" style={{ paddingBottom: "0rem" }}>
              <h2 className="sectionTitle" style={{ marginBottom: "1rem" }}>이유식 레시피 라이브러리</h2>
              <p style={{ textAlign: "center", fontSize: "1.4rem", color: "#666666", marginBottom: "3rem" }}>
                다양한 재료를 조합하여 아기의 미각을 건강하게 일깨워 줄 수 있는 레시피들입니다.
              </p>
            </div>

            {/* 로그인 상태일 때만 노출되는 맞춤 추천 카드 */}
            {/* 화면 좌우를 가득 채우는 100% 너비의 배경을 가진 섹션 영역을 제공하여 다른 콘텐츠 영역과 확실하게 시각적으로 구분되도록 customRecommendSection 및 customRecommendContainer 클래스를 입힌 구조로 변경하였습니다. */}
            {supabaseSession && userProfile && babyInfo && (
              <div className="customRecommendSection">
                <div className="customRecommendContainer">
                  <div className="customRecommendCard">
                    <div className="calcHeader">
                      <Baby className="calcIcon" size={24} style={{ color: "#ff8e72" }} />
                      <h2 className="calcTitle">{userProfile.babyName} 아기를 위한 맞춤 추천</h2>
                    </div>
                    <div className="calcDesc">
                      아기의 생년월일(<strong>{userProfile.babyBirth}</strong>) 기준 현재 생후 <strong>{babyInfo.months}개월</strong> 입니다.
                    </div>
                    <div className="calcResultBox" style={{ backgroundColor: "#ffffff", borderLeftColor: "#ff8e72" }}>
                      <div className="resultText">
                        현재 권장 단계는 <strong>[{babyInfo.stageName}]</strong> 입니다. <br />
                        <span style={{ fontSize: "1.4rem", color: "#666666", marginTop: "0.4rem", display: "block" }}>
                          {babyInfo.description}
                        </span>
                      </div>
                      {babyInfo.stageId !== "none" && babyInfo.stageId !== "graduation" && (
                        <button
                          className="resultActionBtn"
                          onClick={() => setRecipeFilter(babyInfo.stageId)}
                        >
                          {babyInfo.stageName} 레시피만 보기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 데이트피커 기반 오늘의 이유식 메뉴 추천 */}
            <div className="menuPickerSection">
              <div className="menuPickerContainer">
                <div className="menuPickerHeader">
                  <Utensils size={22} color="#ff8e72" />
                  <h3 className="menuPickerTitle">오늘의 이유식 메뉴 추천</h3>
                </div>
                {/* 현재 보는 월 기준 생후 개월 수를 계산하여 설명 문구에 반영 */}
                {(() => {
                  const viewMonths = userProfile?.babyBirth
                    ? calculateMonthsAtDate(userProfile.babyBirth, calendarViewDate)
                    : null;
                  const viewYear = calendarViewDate.getFullYear();
                  const viewMonth = calendarViewDate.getMonth() + 1;
                  return (
                    <p className="menuPickerDesc">
                      아기 생년월일(<strong>{userProfile?.babyBirth}</strong>) 기준
                      {" "}<strong>{viewYear}년 {viewMonth}월</strong> 기준 생후 <strong>{viewMonths}개월</strong>입니다.
                      날짜를 선택하면 해당 날의 추천 메뉴를 확인할 수 있습니다.
                    </p>
                  );
                })()}

                {/* 현재 보는 월 기준 이유식 단계 요약 카드 */}
                {(() => {
                  if (!userProfile?.babyBirth) return null;
                  const months = calculateMonthsAtDate(userProfile.babyBirth, calendarViewDate);
                  const stageInfo = determineStage(months);
                  const stageData = babyFoodStages.find(s => s.id === stageInfo.stageId);
                  if (!stageData) return null;
                  return (
                    <div className="stageInfoCard">
                      <div className="stageInfoBadge">{stageData.title} 이유식</div>
                      <ul className="stageInfoList">
                        <li className="stageInfoItem">
                          <span className="stageInfoLabel">시기</span>
                          <span className="stageInfoValue">{stageData.period}</span>
                        </li>
                        <li className="stageInfoItem">
                          <span className="stageInfoLabel">횟수</span>
                          <span className="stageInfoValue">{stageData.dailyCount}</span>
                        </li>
                        <li className="stageInfoItem">
                          <span className="stageInfoLabel">형태</span>
                          <span className="stageInfoValue">{stageData.texture}</span>
                        </li>
                        <li className="stageInfoItem">
                          <span className="stageInfoLabel">주재료</span>
                          <span className="stageInfoValue">{stageData.keyIngredients}</span>
                        </li>
                      </ul>
                    </div>
                  );
                })()}

                <div className="menuCalendarWrapper">
                  <Calendar
                    value={new Date(menuPickerDate + "T12:00:00")}
                    onChange={(date) => setMenuPickerDate(toLocalDateStr(date))}
                    onActiveStartDateChange={({ activeStartDate }) => {
                      // 월 이동 버튼 클릭 시 현재 보는 월을 갱신 — 단계·메뉴·정보 카드가 해당 월 기준으로 재계산됨
                      if (activeStartDate) setCalendarViewDate(activeStartDate);
                    }}
                    locale="ko-KR"
                    calendarType="gregory"
                    formatDay={(locale, date) => date.getDate()}
                    tileClassName={({ date, view }) => {
                      if (view !== "month") return null;
                      const dateStr = toLocalDateStr(date);
                      const isToday = dateStr === toLocalDateStr(new Date());
                      const isSelected = dateStr === menuPickerDate;
                      // 토요일(6) · 일요일(0) · 한국 공휴일이면 휴일로 표시
                      const isHoliday = date.getDay() === 0 || date.getDay() === 6 || KOREAN_HOLIDAYS.has(dateStr);

                      if (isToday) return isHoliday ? "calTodayTile calHolidayTile" : "calTodayTile";
                      if (isSelected) return isHoliday ? "calSelectedTile calHolidayTile" : "calSelectedTile";
                      return isHoliday ? "calHolidayTile" : null;
                    }}
                    tileContent={({ date, view }) => {
                      if (view !== "month") return null;
                      const dayMenus = getDayMenus(date);
                      if (!dayMenus.length) return null;
                      return (
                        <div className="calTileMenus">
                          {dayMenus.map((recipe, i) => (
                            <span
                              key={i}
                              className="calTileMenuName calTileMenuNameClickable"
                              onClick={(e) => {
                                // 달력 타일 자체의 날짜 선택 이벤트와 충돌 방지
                                e.stopPropagation();
                                setSelectedRecipe(recipe);
                              }}
                            >
                              {recipe.name.length > 7 ? recipe.name.slice(0, 7) + "…" : recipe.name}
                            </span>
                          ))}
                        </div>
                      );
                    }}
                  />
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 레시피 후기 탭 (reviews) */}
        {currentTab === "reviews" && (
          <div>
            {/* 후기 페이지 배너 */}
            <div className="reviewsBanner">
              <span className="heroTag">이유식 레시피 리뷰</span>
              <h2 className="reviewsBannerTitle">레시피 후기</h2>
              <p className="reviewsBannerDesc">
                직접 만들어 본 이유식 후기를 공유해요. 엄마·아빠들의 솔직한 경험이 큰 도움이 됩니다.
              </p>
            </div>



          </div>
        )}

        {/* 마이페이지 정보 관리 탭 (myPage) */}
        {currentTab === "myPage" && supabaseSession && userProfile && (
          <section className="myPageSection">
            <div className="myPageCard">
              <div className="myPageHeader">
                <h2 className="myPageTitle">마이페이지 (회원 정보 관리)</h2>
                <div className="myPageHeaderActions">
                  <button
                    className="editProfileBtn"
                    onClick={() => {
                      // 현재 userProfile 값으로 수정 폼을 초기화한 뒤 수정 페이지로 이동
                      setEditProfileForm({
                        username: userProfile.username,
                        babyName: userProfile.babyName,
                        babyBirth: userProfile.babyBirth
                      });
                      setCurrentTab("editProfile");
                    }}
                  >
                    회원정보 수정
                  </button>
                  <button
                    className="headerLogoutBtn"
                    onClick={handleLogout}
                    style={{ color: "#d32f2f", borderColor: "#ffcdd2" }}
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              <div className="myPageGrid">
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">부모 이름</span>
                  <span className="myPageInfoValue">{userProfile.username}</span>
                </div>
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">이메일</span>
                  <span className="myPageInfoValue">{supabaseSession.user.email}</span>
                </div>
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">우리 아기 이름</span>
                  <span className="myPageInfoValue">{userProfile.babyName}</span>
                </div>
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">아기 태어난 날</span>
                  <span className="myPageInfoValue">{userProfile.babyBirth}</span>
                </div>
                {babyInfo && (
                  <div className="myPageInfoItem" style={{ gridColumn: "1 / -1", backgroundColor: "#fffbfb", borderColor: "#ffe5dd" }}>
                    <span className="myPageInfoLabel" style={{ color: "#ff8e72", fontWeight: 600 }}>아기 성장에 따른 현재 단계 정보</span>
                    <span className="myPageInfoValue" style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>
                      생후 <span>{babyInfo.months}개월</span> · 권장 단계는 <span>{babyInfo.stageName}</span> 입니다.
                    </span>
                    <p style={{ fontSize: "1.35rem", color: "#666666", marginTop: "0.8rem", lineHeight: "1.5" }}>
                      {babyInfo.description}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", borderTop: "0.1rem solid #f0f0f0", paddingTop: "2.4rem" }}>
                <button
                  onClick={handleWithdrawal}
                  style={{ fontSize: "1.3rem", color: "#d32f2f", textDecoration: "underline", cursor: "pointer" }}
                >
                  회원 탈퇴하기
                </button>
              </div>
            </div>
          </section>
        )}
        {/* 회원정보 수정 탭 (editProfile) */}
        {currentTab === "editProfile" && supabaseSession && userProfile && (
          <section className="myPageSection">
            <div className="myPageCard">
              <div className="myPageHeader">
                <h2 className="myPageTitle">회원정보 수정</h2>
                <button className="headerLogoutBtn" onClick={() => setCurrentTab("myPage")}>
                  ← 마이페이지로
                </button>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="authForm">
                <div className="authFormGroup">
                  <label>이메일 (변경 불가)</label>
                  <input
                    className="authInput"
                    value={supabaseSession.user.email}
                    disabled
                    style={{ backgroundColor: "#f5f5f5", color: "#888888", cursor: "not-allowed" }}
                  />
                </div>

                <div className="authFormGroup">
                  <label htmlFor="editUsername">부모 이름</label>
                  <input
                    type="text"
                    id="editUsername"
                    className="authInput"
                    value={editProfileForm.username}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="authFormGroup">
                  <label htmlFor="editBabyName">아기 이름</label>
                  <input
                    type="text"
                    id="editBabyName"
                    className="authInput"
                    value={editProfileForm.babyName}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, babyName: e.target.value })}
                    required
                  />
                </div>

                <div className="authFormGroup">
                  <label htmlFor="editBabyBirth">아기 태어난 날</label>
                  <input
                    type="date"
                    id="editBabyBirth"
                    className="authInput"
                    value={editProfileForm.babyBirth}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, babyBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="editProfileActions">
                  <button
                    type="button"
                    className="editCancelBtn"
                    onClick={() => setCurrentTab("myPage")}
                  >
                    취소
                  </button>
                  <button type="submit" className="authSubmitBtn" style={{ flex: 1 }}>
                    수정 완료
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* 3. 하단 공통 푸터 영역 */}
      <footer className="appFooter">
        <div className="footerContainer">
          <div className="footerLogo">BebeRecipe</div>
          <p className="footerCopy">
            © 2026 베베레시피. All rights reserved. 본 레시피 서비스는 이유식 정보 가이드용으로 제공됩니다.
          </p>
        </div>
      </footer>

      {/* 4. 레시피 상세 정보 보기 팝업 모달 */}
      {selectedRecipe && (
        <div className="modalOverlay" onMouseDown={() => setSelectedRecipe(null)}>
          <div className="modalContent" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalCloseBtn" onClick={() => setSelectedRecipe(null)}>
              <X size={20} />
            </button>

            <div className="modalBody">
              <div className="modalHeader">
                <span className={`recipeStageTag ${getStageTagClass(selectedRecipe)}`} style={{ alignSelf: "flex-start" }}>
                  {getStageTagTextFull(selectedRecipe)}
                </span>
                <h2 className="modalTitle">{selectedRecipe.name}</h2>
                <p className="modalDesc">{selectedRecipe.description}</p>
              </div>

              <div className="ingredientsBox">
                <span className="ingredientsTitle">준비할 재료 (계량 가이드)</span>
                <p className="ingredientsList">{selectedRecipe.ingredients}</p>
              </div>

              <div className="instructionsBox">
                <h3 className="instructionsTitle">맛있게 끓이는 법</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="instructionStep">
                      <div className="stepContent">
                        <span className="stepNum">{idx + 1}</span>
                        <p className="stepText">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tipBox">
                <span className="tipTitle">
                  <Utensils size={18} />
                  Bebe 맘&대디를 위한 꿀팁!
                </span>
                <p className="tipText">{selectedRecipe.tips}</p>
              </div>

              {/* 유튜브 버튼 — 새 탭에서 자동재생(&autoplay=1) */}
              {recipeMedia[selectedRecipe.id]?.youtubeUrl && (
                <a
                  href={`${recipeMedia[selectedRecipe.id].youtubeUrl}&autoplay=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtubeBtn"
                >
                  ▶&nbsp; 유튜브에서 영상 보기
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. 로그인 & 회원가입 팝업 모달 */}
      {showAuthModal && (
        <div className="modalOverlay" onMouseDown={() => setShowAuthModal(false)}>
          <div className="authModalContent" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalCloseBtn" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            {/* 로그인 화면 모드 */}
            {authMode === "login" && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">로그인</h2>
                  <p className="authModalDesc">가입한 이메일로 마이룸에 입장하세요.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="authForm">
                  <div className="authFormGroup">
                    <label htmlFor="loginEmail">이메일</label>
                    <input
                      type="email"
                      id="loginEmail"
                      className="authInput"
                      placeholder="가입한 이메일을 입력하세요"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="loginPassword">비밀번호</label>
                    <input
                      type="password"
                      id="loginPassword"
                      className="authInput"
                      placeholder="비밀번호를 입력하세요"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="authSubmitBtn">로그인 완료</button>
                </form>

                <div className="authFindLinks">
                  <span className="authFindLink" onClick={() => { setAuthMode("findEmail"); setFindEmailResult(null); setFindEmailForm({ parentName: "", babyName: "" }); }}>
                    아이디 찾기
                  </span>
                  <span className="authFindDivider">|</span>
                  <span className="authFindLink" onClick={() => { setAuthMode("findPassword"); setFindPasswordSent(false); setFindPasswordForm({ email: "" }); }}>
                    비밀번호 찾기
                  </span>
                </div>

                <p className="authSwitchText">
                  아직 회원이 아니신가요?
                  <span className="authSwitchLink" onClick={() => setAuthMode("register")}>
                    회원가입 하기
                  </span>
                </p>
              </div>
            )}

            {/* 아이디 찾기 화면 모드 */}
            {authMode === "findEmail" && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">아이디 찾기</h2>
                  <p className="authModalDesc">가입 시 등록한 부모 이름과 아기 이름을 입력하세요.</p>
                </div>

                {!findEmailResult ? (
                  <form onSubmit={handleFindEmail} className="authForm">
                    <div className="authFormGroup">
                      <label htmlFor="findParentName">부모 이름</label>
                      <input
                        type="text"
                        id="findParentName"
                        className="authInput"
                        placeholder="가입 시 등록한 부모 이름"
                        value={findEmailForm.parentName}
                        onChange={(e) => setFindEmailForm({ ...findEmailForm, parentName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="authFormGroup">
                      <label htmlFor="findBabyName">아기 이름</label>
                      <input
                        type="text"
                        id="findBabyName"
                        className="authInput"
                        placeholder="가입 시 등록한 아기 이름"
                        value={findEmailForm.babyName}
                        onChange={(e) => setFindEmailForm({ ...findEmailForm, babyName: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="authSubmitBtn">아이디(이메일) 찾기</button>
                  </form>
                ) : (
                  <div className="authResultBox">
                    {findEmailResult === "notFound" ? (
                      <p className="authResultText">일치하는 계정 정보를 찾을 수 없습니다.<br />입력한 정보를 다시 확인해 주세요.</p>
                    ) : (
                      <>
                        <p className="authResultLabel">가입하신 이메일(아이디)은</p>
                        <p className="authResultEmail">{findEmailResult}</p>
                        <p className="authResultHint">위 이메일로 로그인해 주세요.</p>
                      </>
                    )}
                  </div>
                )}

                <p className="authSwitchText">
                  <span className="authSwitchLink" onClick={() => { setAuthMode("login"); setFindEmailForm({ parentName: "", babyName: "" }); setFindEmailResult(null); }}>
                    ← 로그인으로 돌아가기
                  </span>
                </p>
              </div>
            )}

            {/* 비밀번호 찾기 화면 모드 */}
            {authMode === "findPassword" && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">비밀번호 찾기</h2>
                  <p className="authModalDesc">가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 발송해 드립니다.</p>
                </div>

                {!findPasswordSent ? (
                  <form onSubmit={handleFindPassword} className="authForm">
                    <div className="authFormGroup">
                      <label htmlFor="findPwEmail">이메일</label>
                      <input
                        type="email"
                        id="findPwEmail"
                        className="authInput"
                        placeholder="가입한 이메일을 입력하세요"
                        value={findPasswordForm.email}
                        onChange={(e) => setFindPasswordForm({ ...findPasswordForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="authSubmitBtn">재설정 메일 발송</button>
                  </form>
                ) : (
                  <div className="authResultBox">
                    <p className="authResultLabel">비밀번호 재설정 이메일을 발송했습니다.</p>
                    <p className="authResultEmail">{findPasswordForm.email}</p>
                    <p className="authResultHint">메일함을 확인하여 비밀번호를 재설정해 주세요.<br />스팸함도 함께 확인해 주세요.</p>
                  </div>
                )}

                <p className="authSwitchText">
                  <span className="authSwitchLink" onClick={() => { setAuthMode("login"); setFindPasswordForm({ email: "" }); setFindPasswordSent(false); }}>
                    ← 로그인으로 돌아가기
                  </span>
                </p>
              </div>
            )}

            {/* 회원가입 화면 모드 */}
            {authMode === "register" && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">회원가입</h2>
                  <p className="authModalDesc">아기 정보를 입력하고 성장 맞춤 서비스를 시작해 보세요.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="authForm">
                  <div className="authFormGroup">
                    <label htmlFor="regEmail">이메일</label>
                    <input
                      type="email"
                      id="regEmail"
                      className="authInput"
                      placeholder="로그인에 사용할 이메일을 입력하세요"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterChange(e, "email")}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regParentName">부모 이름(엄마/아빠)</label>
                    <input
                      type="text"
                      id="regParentName"
                      className="authInput"
                      placeholder="가입자 성함을 입력하세요"
                      value={registerForm.parentName}
                      onChange={(e) => handleRegisterChange(e, "parentName")}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regBabyName">우리 아기 이름</label>
                    <input
                      type="text"
                      id="regBabyName"
                      className="authInput"
                      placeholder="예) 아롱이"
                      value={registerForm.babyName}
                      onChange={(e) => handleRegisterChange(e, "babyName")}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regBabyBirth">아기 태어난 날 (생일)</label>
                    <input
                      type="date"
                      id="regBabyBirth"
                      className="authInput"
                      value={registerForm.babyBirth}
                      onChange={(e) => handleRegisterChange(e, "babyBirth")}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regPassword">비밀번호</label>
                    <input
                      type="password"
                      id="regPassword"
                      className="authInput"
                      placeholder="비밀번호 설정 (6자 이상)"
                      value={registerForm.password}
                      onChange={(e) => handleRegisterChange(e, "password")}
                      required
                    />
                  </div>
                  <button type="submit" className="authSubmitBtn">가입하기</button>
                </form>

                <p className="authSwitchText">
                  이미 가입한 회원이신가요?
                  <span className="authSwitchLink" onClick={() => setAuthMode("login")}>
                    로그인 하기
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. 비밀번호 재설정 모달 — PASSWORD_RECOVERY 이벤트 수신 시 자동 노출 */}
      {showPasswordResetModal && (
        <div className="modalOverlay">
          <div className="authModalContent" onMouseDown={(e) => e.stopPropagation()}>
            <div className="authModalBody">
              <div className="authModalHeader">
                <h2 className="authModalTitle">비밀번호 재설정</h2>
                <p className="authModalDesc">새로운 비밀번호를 입력해 주세요.</p>
              </div>

              {!passwordResetSuccess ? (
                <form onSubmit={handlePasswordReset} className="authForm">
                  <div className="authFormGroup">
                    <label htmlFor="newPassword">새 비밀번호</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="authInput"
                      placeholder="새 비밀번호 (6자 이상)"
                      value={passwordResetForm.newPassword}
                      onChange={(e) => setPasswordResetForm({ ...passwordResetForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="authInput"
                      placeholder="새 비밀번호를 다시 입력하세요"
                      value={passwordResetForm.confirmPassword}
                      onChange={(e) => setPasswordResetForm({ ...passwordResetForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="authSubmitBtn">비밀번호 변경 완료</button>
                </form>
              ) : (
                <div className="authResultBox">
                  <p className="authResultLabel">비밀번호가 성공적으로 변경되었습니다.</p>
                  <p className="authResultHint">새 비밀번호로 로그인해 주세요.</p>
                  <button
                    className="authSubmitBtn"
                    style={{ marginTop: "0.8rem" }}
                    onClick={() => {
                      setShowPasswordResetModal(false);
                      setPasswordResetSuccess(false);
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                  >
                    로그인 하러 가기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
