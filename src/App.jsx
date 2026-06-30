import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Quill 픽셀 단위 폰트 사이즈를 사용하도록 등록합니다.
const QuillSize = Quill.import("attributors/style/size");
QuillSize.whitelist = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "36px"];
Quill.register(QuillSize, true);
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
import { encryptData, decryptData, maskEmail } from "./lib/crypto";

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

// 후기 페이지당 표시 개수
const REVIEW_PAGE_SIZE = 10;

// 애플리케이션의 전체 기능과 라우팅, 회원 관리를 수행하는 메인 App 컴포넌트입니다.
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Quill 에디터 인스턴스 참조 — 이미지 삽입 시 커서 위치를 가져오기 위해 사용합니다.
  const quillRef = useRef(null);

  // HTML 태그를 제거하여 게시판 목록의 내용 미리보기에 사용합니다.
  const stripHtml = useCallback((html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }, []);

  // 서비스 운영 정책상 금지된 욕설 목록입니다.
  const PROFANITY_LIST = [
    "시발", "씨발", "ㅅㅂ", "개새끼", "개새", "새끼", "미친놈", "미친년", "병신",
    "ㅂㅅ", "존나", "ㅈㄴ", "년놈", "씹", "ㅆㅂ", "지랄", "ㅈㄹ", "빡대가리",
    "창녀", "보지", "자지", "딸딸이", "꺼져", "죽어", "뒤져", "닥쳐", "개소리",
    "fuck", "shit", "bitch", "asshole", "bastard"
  ];

  // 제목과 내용에 금지 욕설이 포함되어 있는지 검사합니다.
  const containsProfanity = (text) => {
    const lower = text.toLowerCase();
    return PROFANITY_LIST.some(word => lower.includes(word.toLowerCase()));
  };

  // 이미지 아이콘 클릭 시 파일 선택 → Supabase Storage 업로드 → 에디터에 삽입합니다.
  const handleQuillImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !quillRef.current) return;

      // 이미지 파일 형식 검사 (jpg, jpeg, png, gif, webp만 허용)
      const allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"];
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(ext)) {
        setBoardWriteError("jpg, jpeg, png, gif, webp 형식의 이미지만 업로드할 수 있습니다.");
        return;
      }

      // 이미지 용량 검사 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        setBoardWriteError("이미지 크기는 5MB 이하만 업로드할 수 있습니다.");
        return;
      }

      const fileName = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("review-images")
        .upload(fileName, file);
      if (error) {
        setBoardWriteError("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      setBoardWriteError("");
      const { data: urlData } = supabase.storage
        .from("review-images")
        .getPublicUrl(data.path);
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, "image", urlData.publicUrl);
      editor.setSelection(range.index + 1);
    };
  }, []);

  // Quill 툴바 설정 — imageHandler를 핸들러로 등록합니다.
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ["image"],
        [{ size: ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "36px"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }],
        [{ align: [] }],
        [{ list: "bullet" }],
        ["clean"],
      ],
      handlers: {
        image: handleQuillImage,
      },
    },
  }), [handleQuillImage]);

  const quillFormats = [
    "size", "bold", "italic", "underline", "strike",
    "color", "align", "list", "image",
  ];

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

  // 레시피 후기 목록, 페이지, 총 개수, 입력값, 등록 중 여부 (모달 내 후기용)
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalCount, setReviewTotalCount] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // 레시피 후기 탭 게시판 — 전체 후기를 페이지 단위로 조회합니다.
  const [boardReviews, setBoardReviews] = useState([]);
  const [boardPage, setBoardPage] = useState(1);
  const [boardTotalCount, setBoardTotalCount] = useState(0);
  const [boardLoading, setBoardLoading] = useState(false);

  // 게시판 뷰 전환 — "list": 목록, "write": 글쓰기 폼, "detail": 상세보기
  const [boardView, setBoardView] = useState("list");
  // 상세보기에서 표시할 선택된 게시글 데이터를 보관합니다.
  const [selectedBoardReview, setSelectedBoardReview] = useState(null);
  const [boardWriteCategory, setBoardWriteCategory] = useState("레시피 후기");
  const [boardWriteTitle, setBoardWriteTitle] = useState("");
  const [boardWriteContent, setBoardWriteContent] = useState("");
  const [boardWriteSubmitting, setBoardWriteSubmitting] = useState(false);
  const [boardWriteError, setBoardWriteError] = useState("");
  // 현재 수정 중인 게시글의 ID를 보관합니다. null인 경우 신규 작성, 값이 있으면 수정 모드로 작동합니다.
  const [boardEditId, setBoardEditId] = useState(null);
  // 후기 게시판 상세페이지의 댓글 목록 데이터 상태입니다.
  const [boardComments, setBoardComments] = useState([]);
  // 댓글 입력 창의 입력 텍스트 값을 보관하는 상태입니다.
  const [boardCommentText, setBoardCommentText] = useState("");
  // 비밀 댓글 작성 여부를 결정하는 체크박스 상태입니다.
  const [boardCommentIsSecret, setBoardCommentIsSecret] = useState(false);
  // 댓글 등록 통신이 진행되는 동안 중복 클릭 및 등록을 막기 위한 로딩 상태입니다.
  const [boardCommentSubmitting, setBoardCommentSubmitting] = useState(false);
  // 내 후기글에 새 댓글이 달렸을 때 마이페이지 네비에 N 배지를 표시하기 위한 상태입니다.
  const [hasNewComment, setHasNewComment] = useState(false);
  // 대댓글(답글) 작성 모달 팝업의 노출 상태를 관리합니다.
  const [showReplyModal, setShowReplyModal] = useState(false);
  // 대댓글(답글)을 달고자 하는 부모 댓글의 정보를 객체 형태로 보관합니다.
  const [replyParentComment, setReplyParentComment] = useState(null);
  // 대댓글(답글) 입력 필드에 들어가는 입력 텍스트 상태입니다.
  const [boardReplyText, setBoardReplyText] = useState("");
  // 대댓글(답글)을 비밀 댓글로 작성할지 여부를 관리하는 상태 변수입니다. 
  // 원댓글이 비밀글인 경우 자동으로 상속되어 true 상태가 되며, 일반 댓글의 대댓글인 경우 사용자가 직접 선택할 수 있습니다.
  const [boardReplyIsSecret, setBoardReplyIsSecret] = useState(false);
  // 현재 수정 중인 댓글의 고유 ID를 관리합니다. null인 경우 수정 상태가 아닙니다.
  const [editingCommentId, setEditingCommentId] = useState(null);
  // 수정 중인 댓글의 텍스트 본문 내용을 보관하는 상태 변수입니다.
  const [editingCommentText, setEditingCommentText] = useState("");

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
    if (recipe.stage === "snack") {
      if (recipe.subStage === "snack1") return "tagMiddle";
      if (recipe.subStage === "snack2") return "tagLate";
      return "tagComplete";
    }
    return "tagComplete";
  };

  // 레시피의 stage와 subStage를 기반으로 태그에 표시할 한국어 라벨을 반환합니다.
  const getStageTagText = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "초기 1단계" : "초기 2단계";
    }
    if (recipe.stage === "middle") return "중기";
    if (recipe.stage === "late") return "후기";
    if (recipe.stage === "snack") {
      if (recipe.subStage === "snack1") return "중기 간식";
      if (recipe.subStage === "snack2") return "후기 간식";
      return "완료기 간식";
    }
    return "완료기";
  };

  // 레시피 상세 모달용 라벨 — "이유식" 접미사가 붙은 형태를 반환합니다.
  const getStageTagTextFull = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "초기 1단계 이유식" : "초기 2단계 이유식";
    }
    if (recipe.stage === "middle") return "중기 이유식";
    if (recipe.stage === "late") return "후기 이유식";
    if (recipe.stage === "snack") {
      if (recipe.subStage === "snack1") return "중기 간식";
      if (recipe.subStage === "snack2") return "후기 간식";
      return "완료기 간식";
    }
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

  // 중기 레시피 도입 권장 순서입니다.
  // 소고기(철분·뇌 발달) → 닭고기 → 달걀 → 두부 → 생선 → 잡곡 변형 → 채소·과일만
  const MIDDLE_FEED_ORDER = {
    recipeMiddle22: 1,  // 애호박소고기죽 — 소고기 기본 입문
    recipeMiddle04: 2,  // 시금치 소고기죽
    recipeMiddle01: 3,  // 브로콜리 쇠고기죽
    recipeMiddle19: 4,  // 소고기미역죽
    recipeMiddle25: 5,  // 당근양배추쇠고기죽
    recipeMiddle45: 6,  // 감자배추쇠고기죽
    recipeMiddle18: 7,  // 소고기청경채표고버섯죽
    recipeMiddle20: 8,  // 청경채김가루쇠고기죽
    recipeMiddle41: 9,  // 오이감자쇠고기죽
    recipeMiddle29: 10, // 미역버섯쇠고기죽
    recipeMiddle14: 11, // 사과당근쇠고기죽
    recipeMiddle42: 12, // 쇠고기아보카도배죽
    recipeMiddle43: 13, // 쇠고기콜리플라워가지김죽
    recipeMiddle16: 14, // 쇠고기귀리단호박죽 — 잡곡 조합 소고기
    recipeMiddle17: 15, // 현미단호박쇠고기죽
    recipeMiddle37: 16, // 찹현미단호박쇠고기죽
    recipeMiddle26: 17, // 쇠고기귀리타락죽
    recipeMiddle12: 18, // 찹쌀 닭죽 — 닭고기 기본 입문
    recipeMiddle15: 19, // 단호박양파닭죽
    recipeMiddle23: 20, // 닭고기당근죽
    recipeMiddle32: 21, // 배추닭죽
    recipeMiddle24: 22, // 닭고기청경채당근죽
    recipeMiddle35: 23, // 애호박버섯닭죽
    recipeMiddle21: 24, // 닭고기콜리플라워애호박죽
    recipeMiddle05: 25, // 닭고기감자비트죽
    recipeMiddle08: 26, // 닭고기아보카도고구마죽
    recipeMiddle07: 27, // 달걀 애호박 당근죽 — 달걀 노른자 입문
    recipeMiddle46: 28, // 배추시금치달걀죽
    recipeMiddle09: 29, // 두부 시금치죽 — 두부 입문
    recipeMiddle10: 30, // 두부브로콜리무죽
    recipeMiddle36: 31, // 연두부청경채무죽
    recipeMiddle03: 32, // 대구살당근애호박죽 — 흰살생선 입문
    recipeMiddle28: 33, // 단호박브로콜리죽 — 채소·과일만
    recipeMiddle27: 34, // 양송이고구마시금치죽
    recipeMiddle33: 35, // 새송이애호박양파죽
    recipeMiddle11: 36, // 양배추다시마쌀죽
    recipeMiddle40: 37, // 고구마사과죽
    recipeMiddle30: 38, // 배브로콜리감자죽
    recipeMiddle13: 39, // 아보카도사과양파죽
    recipeMiddle34: 40, // 수수단호박오이죽 — 잡곡 변형
    recipeMiddle39: 41, // 수수애호박양배추죽
    recipeMiddle31: 42, // 배찹쌀근대죽
    recipeMiddle38: 43, // 흑미연두부버섯죽
    recipeMiddle44: 44, // 콜리플라워고구마귀리죽
  };

  // 후기 레시피 도입 권장 순서입니다.
  // 소고기(철분) → 닭고기 → 두부 → 잡곡 → 치즈 조합
  const LATE_FEED_ORDER = {
    recipeLate09: 1,  // 쇠고기과일무른밥 — 소고기 기본 입문
    recipeLate10: 2,  // 쇠고기버섯볶은무른밥
    recipeLate11: 3,  // 쇠고기야채버섯볶은무른밥
    recipeLate16: 4,  // 쇠고기콜리플라워단호박무른밥
    recipeLate14: 5,  // 쇠고기아보카도배무른밥
    recipeLate06: 6,  // 닭고기당근시금치무른밥 — 닭고기 입문
    recipeLate13: 7,  // 닭고기양배추무른밥
    recipeLate04: 8,  // 찹쌀닭고기버섯무른밥
    recipeLate07: 9,  // 닭고기대추무른밥
    recipeLate15: 10, // 닭고기아보카도감자무른밥
    recipeLate18: 11, // 닭고기콜리플라워배적채무른밥
    recipeLate03: 12, // 연두부미역무른밥 — 두부 입문
    recipeLate12: 13, // 애호박연두부무른밥
    recipeLate08: 14, // 밤단호박차조무른밥 — 잡곡 변형
    recipeLate02: 15, // 야채치즈무른밥 — 치즈 조합
    recipeLate01: 16, // 과일치즈무른밥
    recipeLate05: 17, // 고구마시금치치즈무른밥
    recipeLate17: 18, // 콜리플라워감자치즈무른밥
  };

  // 완료기 레시피 도입 권장 순서입니다.
  // 쇠고기진밥 → 닭고기진밥 → 달걀·해산물 → 두부 → 국·찌개 → 반찬·특별식
  const COMPLETE_FEED_ORDER = {
    recipeComplete09: 1,  // 쇠고기영양진밥 — 소고기 기본 입문
    recipeComplete08: 2,  // 쇠고기사과볶은진밥
    recipeComplete11: 3,  // 쇠고기아보카도배추진밥
    recipeComplete17: 4,  // 쇠고기콜리플라워청경채진밥
    recipeComplete18: 5,  // 흑미닭고기영양진밥 — 닭고기 입문
    recipeComplete20: 6,  // 닭고기사과볶은진밥
    recipeComplete03: 7,  // 닭고기야채덮밥
    recipeComplete19: 8,  // 닭고기무감자진밥
    recipeComplete31: 9,  // 닭고기콜리플라워근대진밥
    recipeComplete14: 10, // 닭고기콜리플라워근대진밥(변형)
    recipeComplete12: 11, // 닭고기아보카도사과진밥
    recipeComplete21: 12, // 닭고기가지연두부진밥
    recipeComplete32: 13, // 닭고기무감자진밥(변형)
    recipeComplete01: 14, // 사과당근달걀진밥 — 달걀 입문
    recipeComplete16: 15, // 콜리플라워연두부비타민진밥 — 두부
    recipeComplete13: 16, // 새우아보카도브로콜리진밥 — 해산물 입문
    recipeComplete15: 17, // 게살아보카도버섯진밥
    recipeComplete02: 18, // 새우버섯볶은치즈진밥
    recipeComplete06: 19, // 쇠고기무국 — 국·찌개
    recipeComplete22: 20, // 쇠고기된장국
    recipeComplete07: 21, // 연두부된장국
    recipeComplete23: 22, // 버섯된장국
    recipeComplete24: 23, // 무아욱된장국
    recipeComplete10: 24, // 아기쇠고기장조림 — 반찬
    recipeComplete04: 25, // 꼬마김밥 — 특별식
    recipeComplete05: 26, // 아기떡볶이
  };

  // 간식 레시피 도입 권장 순서입니다.
  // 초기·중기 버무림류 → 후기 전·젤리류 → 완료기 견과 핑거푸드 순으로 정렬합니다.
  const SNACK_FEED_ORDER = {
    recipeSnack07: 1,  // 고구마브로콜리버무림 — 초기/중기 간식 입문
    recipeSnack01: 2,  // 바나나사과버무림
    recipeSnack06: 3,  // 아보카도바나나버무림
    recipeSnack08: 4,  // 감자오이버무림
    recipeSnack09: 5,  // 바나나검은콩버무림
    recipeSnack10: 6,  // 단호박건포도버무림
    recipeSnack12: 7,  // 바나나연두부달걀찜
    recipeSnack02: 8,  // 아기두유 — 후기 간식
    recipeSnack03: 9,  // 고구마새우전
    recipeSnack05: 10, // 밤고구마핑거볼
    recipeSnack11: 11, // 사과젤리
    recipeSnack04: 12, // 감자잣핑거볼 — 완료기 간식
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

  // 내 후기글에 마지막 확인 이후 새 댓글이 달렸는지 조회하여 N 배지 표시 여부를 설정합니다.
  // 마지막 확인 시각은 localStorage에 유저별로 보관합니다.
  const checkNewComments = async (userId) => {
    const storageKey = `notif_checked_${userId}`;
    const lastChecked = localStorage.getItem(storageKey) || new Date(0).toISOString();

    // 내가 작성한 후기글 ID 목록 조회
    const { data: myReviews } = await supabase
      .from("recipe_reviews")
      .select("id")
      .eq("user_id", userId);

    if (!myReviews?.length) return;

    const reviewIds = myReviews.map((r) => r.id);

    // 내 후기글에 달린 새 댓글 중 내가 직접 단 댓글은 제외
    const { data: newComments } = await supabase
      .from("review_comments")
      .select("id")
      .in("review_id", reviewIds)
      .neq("user_id", userId)
      .gt("created_at", lastChecked);

    setHasNewComment((newComments?.length ?? 0) > 0);
  };

  // --- 앱 마운트 시 세션 복구 및 실시간 구독 ---
  useEffect(() => {
    // 새로고침 후 기존 세션을 복구합니다.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        checkNewComments(session.user.id);
      }
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
        checkNewComments(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제 — 메모리 누수 방지
    return () => subscription.unsubscribe();
  }, []);

  // 레시피 모달이 열리면 해당 레시피의 후기를 1페이지부터 불러옵니다.
  // 모달이 닫히면(selectedRecipe === null) 후기 상태를 초기화합니다.
  useEffect(() => {
    if (selectedRecipe) {
      setReviewPage(1);
      setReviewText("");
      fetchReviews(selectedRecipe.id, 1);
    } else {
      setReviews([]);
      setReviewTotalCount(0);
    }
  }, [selectedRecipe?.id]);

  // 레시피 후기 탭을 열 때 목록 뷰로 초기화하고 1페이지를 불러옵니다.
  useEffect(() => {
    if (currentTab === "reviews") {
      setBoardPage(1);
      fetchBoardReviews(1);
    }
  }, [currentTab]);

  // URL 경로를 읽어 탭·뷰 상태를 초기화합니다. 브라우저 직접 접근 및 뒤로가기를 지원합니다.
  useEffect(() => {
    const path = location.pathname;
    if (path === "/reviews/write") {
      setCurrentTab("reviews");
      // 수정 모드가 아닌 신규 작성 모드인 경우에만 폼 값을 공백으로 초기화합니다.
      if (!boardEditId) {
        setBoardWriteCategory("레시피 후기");
        setBoardWriteTitle("");
        setBoardWriteContent("");
      }
      setBoardView("write");
    } else if (path === "/reviews/detail") {
      setCurrentTab("reviews");
      if (!selectedBoardReview) {
        setBoardView("list");
        setBoardEditId(null);
        navigate("/reviews");
      }
    } else if (path === "/reviews") {
      setCurrentTab("reviews");
      setBoardView("list");
      setBoardEditId(null);
    }
  }, [location.pathname]);

  // 상세보기할 후기글이 바뀔 때마다 해당 글에 귀속된 댓글 목록을 Supabase로부터 즉각 가져옵니다.
  useEffect(() => {
    if (selectedBoardReview?.id) {
      fetchBoardComments(selectedBoardReview.id);
    } else {
      setBoardComments([]);
    }
  }, [selectedBoardReview?.id]);

  // --- 후기(recipe_reviews) 관련 함수 ---

  // 특정 레시피의 후기를 페이지 단위로 Supabase에서 조회합니다.
  // PostgreSQL의 식별자 대소문자 매핑 에러를 방지하고 표준을 따르기 위해 테이블명을 recipe_reviews로 호출하도록 수정했습니다.
  const fetchReviews = async (recipeId, page) => {
    const from = (page - 1) * REVIEW_PAGE_SIZE;
    const to = from + REVIEW_PAGE_SIZE - 1;
    const { data, count, error } = await supabase
      .from("recipe_reviews")
      .select("*", { count: "exact" })
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error) {
      setReviews(data || []);
      setReviewTotalCount(count || 0);
    }
  };

  // 후기를 Supabase에 등록합니다. 등록 완료 후 1페이지로 이동하여 목록을 갱신합니다.
  // 비회원 작성 차단 정책에 맞게, 로그인된 회원 세션 정보를 기반으로 작성자의 id와 닉네임을 수집해 recipe_reviews 테이블에 인서트하도록 구현했습니다.
  const handleReviewSubmit = async () => {
    if (!reviewText.trim() || reviewSubmitting || !supabaseSession) return;
    setReviewSubmitting(true);
    const { error } = await supabase
      .from("recipe_reviews")
      .insert({
        recipe_id: selectedRecipe.id,
        user_id: supabaseSession.user.id,
        username: userProfile?.username || "회원",
        content: reviewText.trim()
      });
    if (!error) {
      setReviewText("");
      setReviewPage(1);
      await fetchReviews(selectedRecipe.id, 1);
    }
    setReviewSubmitting(false);
  };

  // 본인이 작성한 후기를 삭제합니다. 삭제 후 현재 페이지 또는 마지막 페이지로 이동합니다.
  // 에러 없는 정상적인 삭제 통신을 위해 테이블명을 recipe_reviews로 호출하고, 삭제 성공 시 바뀐 전체 후기 개수에 비례해 적절한 다음 페이지 데이터를 보여주도록 설계했습니다.
  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("후기를 삭제할까요?")) return;
    const { error } = await supabase
      .from("recipe_reviews")
      .delete()
      .eq("id", reviewId);
    if (!error) {
      const newTotal = reviewTotalCount - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / REVIEW_PAGE_SIZE));
      const nextPage = reviewPage > maxPage ? maxPage : reviewPage;
      setReviewPage(nextPage);
      await fetchReviews(selectedRecipe.id, nextPage);
    }
  };

  // 후기 페이지를 변경합니다.
  const handleReviewPageChange = async (newPage) => {
    setReviewPage(newPage);
    await fetchReviews(selectedRecipe.id, newPage);
  };

  // 게시판 글쓰기 폼에서 후기를 등록합니다. 성공 시 목록으로 돌아가 1페이지를 새로 불러옵니다.
  const handleBoardWriteSubmit = async (e) => {
    // 폼 제출 등으로 인해 페이지가 상단으로 자동 스크롤되거나 리프레시되는 기본 동작을 방지합니다.
    if (e) {
      e.preventDefault();
    }
    // Quill 에디터의 빈 상태는 "<p><br></p>"이므로 텍스트 기준으로 검사합니다.
    const titleText = boardWriteTitle.trim();
    const contentText = stripHtml(boardWriteContent).trim();
    setBoardWriteError("");

    if (!titleText) {
      setBoardWriteError("제목을 입력해주세요.");
      return;
    }
    if (titleText.length < 2) {
      setBoardWriteError("제목은 2자 이상 입력해주세요.");
      return;
    }
    if (!contentText) {
      setBoardWriteError("내용을 입력해주세요.");
      return;
    }
    if (contentText.length < 5) {
      setBoardWriteError("내용은 5자 이상 입력해주세요.");
      return;
    }
    if (containsProfanity(titleText) || containsProfanity(contentText)) {
      setBoardWriteError("욕설 및 비속어는 사용할 수 없습니다.");
      return;
    }
    if (boardWriteSubmitting || !supabaseSession) return;
    setBoardWriteSubmitting(true);

    if (boardEditId) {
      // boardEditId가 존재하면 기존 게시글을 수정(UPDATE)하는 로직을 수행합니다.
      const { data, error } = await supabase
        .from("recipe_reviews")
        .update({
          category: boardWriteCategory,
          title: boardWriteTitle.trim(),
          content: boardWriteContent.trim()
        })
        .eq("id", boardEditId)
        .select()
        .single();

      if (!error) {
        setBoardWriteCategory("레시피 후기");
        setBoardWriteTitle("");
        setBoardWriteContent("");
        setBoardEditId(null);
        
        // 수정 완료 후 상세 페이지 화면에 갱신된 데이터를 표시합니다.
        if (data) {
          setSelectedBoardReview(data);
        } else {
          setSelectedBoardReview(prev => prev ? {
            ...prev,
            category: boardWriteCategory,
            title: boardWriteTitle.trim(),
            content: boardWriteContent.trim()
          } : null);
        }
        
        setBoardView("detail");
        await fetchBoardReviews(boardPage);
        navigate("/reviews/detail");
      } else {
        // Supabase 수정 응답 에러를 콘솔에 기록하고 사용자에게 보여줍니다.
        console.error("게시글 수정 실패:", error);
        setBoardWriteError("수정에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      // boardEditId가 존재하지 않으면 새로운 게시글을 등록(INSERT)하는 로직을 수행합니다.
      const { error } = await supabase
        .from("recipe_reviews")
        .insert({
          user_id: supabaseSession.user.id,
          username: userProfile?.username || "회원",
          category: boardWriteCategory,
          title: boardWriteTitle.trim(),
          content: boardWriteContent.trim()
        });

      if (!error) {
        setBoardWriteCategory("레시피 후기");
        setBoardWriteTitle("");
        setBoardWriteContent("");
        setBoardPage(1);
        await fetchBoardReviews(1);
        navigate("/reviews");
      } else {
        // Supabase 등록 응답 에러를 콘솔에 기록하고 사용자에게 보여줍니다.
        console.error("게시글 등록 실패:", error);
        setBoardWriteError("등록에 실패했습니다. 다시 시도해주세요.");
      }
    }
    setBoardWriteSubmitting(false);
  };

  // 게시판 탭에서 전체 후기를 페이지 단위로 조회합니다.
  const fetchBoardReviews = async (page) => {
    setBoardLoading(true);
    const from = (page - 1) * REVIEW_PAGE_SIZE;
    const to = from + REVIEW_PAGE_SIZE - 1;
    // 각 레시피 후기에 연결된 댓글의 총 개수를 가져오기 위해 review_comments(id) 조인 쿼리를 함께 전송합니다.
    const { data, count, error } = await supabase
      .from("recipe_reviews")
      .select("*, review_comments(id)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error) {
      setBoardReviews(data || []);
      setBoardTotalCount(count || 0);
    }
    setBoardLoading(false);
  };

  // 게시글을 클릭하여 상세 페이지로 진입할 때 조회수를 1 카운트(증가) 시키는 비즈니스 로직입니다.
  const handleBoardReviewClick = async (review) => {
    // 로컬 상태를 우선 detail 뷰로 세팅하여 상세화면으로 빠른 전환을 유도합니다.
    setSelectedBoardReview(review);
    setBoardView("detail");
    navigate("/reviews/detail");

    // Supabase RPC 함수(increment_views)를 실행하여 RLS 보안 권한에 제약받지 않고 조회수를 안전하게 1 증가시킵니다.
    const { error: rpcError } = await supabase
      .rpc("increment_views", { review_id: review.id });

    if (!rpcError) {
      // 조회수가 갱신된 최신 후기 데이터 단건을 다시 불러옵니다.
      const { data: updatedReview, error: fetchError } = await supabase
        .from("recipe_reviews")
        .select("*, review_comments(id)")
        .eq("id", review.id)
        .single();

      if (!fetchError && updatedReview) {
        // 조회수가 갱신된 최신 데이터를 선택된 후기 상태 변수에 갱신 반영합니다.
        setSelectedBoardReview(updatedReview);
        // 목록에서의 조회수 실시간 동기화를 위해 현재 페이지의 전체 목록 데이터도 재패칭합니다.
        fetchBoardReviews(boardPage);
      }
    } else {
      console.error("조회수 카운팅 중 데이터베이스 통신 오류 발생:", rpcError);
    }
  };

  // 날짜 문자열을 YYYY.MM.DD 형식으로 변환합니다.
  const formatReviewDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  // 댓글의 날짜를 YYYY-MM-DD HH:mm 형식으로 세밀하게 포맷팅합니다.
  const formatCommentDate = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${date} ${hours}:${minutes}`;
  };

  // 특정 게시글의 모든 댓글 목록을 생성 일자 순으로 불러옵니다.
  const fetchBoardComments = async (reviewId) => {
    const { data, error } = await supabase
      .from("review_comments")
      .select("*")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });
    if (!error) {
      setBoardComments(data || []);
    } else {
      console.error("댓글 불러오기 오류:", error);
    }
  };

  // 작성한 댓글을 등록합니다. 일반 댓글(부모)과 대댓글(답글)을 하나의 함수에서 parentId 유무에 따라 안전하게 인서트합니다.
  const handleBoardCommentSubmit = async (reviewId, parentId = null, isSecretInput = false) => {
    // parentId가 있으면 대댓글 입력창 텍스트를 검증하고, 없으면 일반 댓글 텍스트를 검증합니다.
    const textToSubmit = parentId ? boardReplyText.trim() : boardCommentText.trim();
    if (!textToSubmit || boardCommentSubmitting) return;
    if (!supabaseSession) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    setBoardCommentSubmitting(true);
    
    // 일반 댓글은 boardCommentIsSecret 상태를 반영하고, 대댓글은 모달에서 전달받은 isSecretInput 값(부모 상속 혹은 사용자 선택)을 최종 비밀글 상태로 적용하여 데이터를 보호합니다.
    const isSecretValue = parentId ? isSecretInput : boardCommentIsSecret;

    const { error } = await supabase
      .from("review_comments")
      .insert({
        review_id: reviewId,
        user_id: supabaseSession.user.id,
        username: userProfile?.username || "회원",
        content: textToSubmit,
        is_secret: isSecretValue,
        parent_id: parentId
      });
    if (!error) {
      if (parentId) {
        // 대댓글 등록 성공 시 답글 입력값 및 비밀글 설정을 비우고 답글 모달 팝업을 닫습니다.
        setBoardReplyText("");
        setBoardReplyIsSecret(false);
        setReplyParentComment(null);
        setShowReplyModal(false);
      } else {
        // 일반 댓글 등록 성공 시 입력 창을 초기화합니다.
        setBoardCommentText("");
        setBoardCommentIsSecret(false);
      }
      await fetchBoardComments(reviewId);
    } else {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    }
    setBoardCommentSubmitting(false);
  };

  // 작성한 댓글을 삭제합니다. RLS 보안 규칙에 따라 본인 댓글만 삭제가 실행됩니다.
  const handleBoardCommentDelete = async (commentId, reviewId) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    const { error } = await supabase
      .from("review_comments")
      .delete()
      .eq("id", commentId);
    if (!error) {
      await fetchBoardComments(reviewId);
    } else {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제 권한이 없거나 오류가 발생했습니다.");
    }
  };

  // 작성한 댓글 또는 대댓글의 내용을 업데이트합니다. RLS 보안 규칙에 따라 본인 댓글만 수정이 실행됩니다.
  const handleBoardCommentUpdate = async (commentId, reviewId) => {
    const trimmedText = editingCommentText.trim();
    // 수정 내용이 비어 있거나 이미 전송 중인 경우 처리를 스킵합니다.
    if (!trimmedText || boardCommentSubmitting) return;

    setBoardCommentSubmitting(true);
    const { error } = await supabase
      .from("review_comments")
      .update({ content: trimmedText })
      .eq("id", commentId); // 수정 대상 댓글 고유 ID와 매치합니다.

    if (!error) {
      // 수정 완료 후 수정 모드 상태를 초기화합니다.
      setEditingCommentId(null);
      setEditingCommentText("");
      // 댓글 목록을 최신 버전으로 새로고침합니다.
      await fetchBoardComments(reviewId);
    } else {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정 권한이 없거나 데이터베이스 통신 오류가 발생했습니다.");
    }
    setBoardCommentSubmitting(false);
  };

  // 대댓글을 무제한(재귀형)으로 렌더링하기 위한 헬퍼 함수입니다.
  // 첫 대댓글은 기존 css 규격대로 여백을 넓게(4rem) 배치하고, 대대댓글(depth >= 2) 이상부터는 화면 가로폭 부족 현상을 고려하여 여백(1.5rem)을 다르게 지정합니다.
  const renderCommentNode = (comment, depth = 0) => {
    // 본인이 작성한 댓글인지 판단합니다.
    const isCommentOwner = supabaseSession && supabaseSession.user.id === comment.user_id;
    // 현재 상세페이지 게시글(후기글)의 작성자 본인인지 판단합니다.
    const isPostAuthor = supabaseSession && supabaseSession.user.id === selectedBoardReview.user_id;
    
    // 댓글 작성자 본인이거나 후기글 작성자인 경우, 혹은 비밀댓글이 아닌 경우에는 댓글 내용을 조회할 수 있도록 권한을 설정합니다.
    const canViewSecret = !comment.is_secret || isCommentOwner || isPostAuthor;
    const avatarChar = comment.username ? comment.username.charAt(0) : "회";

    // 현재 댓글의 ID를 parent_id로 삼는 자식 대댓글들을 필터링합니다.
    const childReplies = boardComments.filter((c) => c.parent_id === comment.id);

    // 현재 댓글 카드가 수정 모드 상태인지 판단합니다.
    const isEditing = editingCommentId === comment.id;

    return (
      <div key={comment.id} className="boardCommentGroup">
        {/* 뎁스가 1 이상(대댓글)일 경우, 흰색 배경 영역 상에서 꺾임 화살표(ㄴ)와 회색 카드가 수평으로 나란히 위치하도록 boardReplyWrapper로 감싸줍니다. */}
        <div className={depth > 0 ? "boardReplyWrapper" : ""}>
          {/* 대댓글(depth > 0)일 경우, 사용자가 요청한 시안과 동일하게 회색 카드 바깥(흰색 배경 영역) 좌측에 ㄴ자 화살표를 렌더링합니다. */}
          {depth > 0 && (
            <div className="boardReplyArrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2V10C4 11.1046 4.89543 12 6 12H13" stroke="#94a3b8" strokeWidth="2.0" strokeLinecap="round"/>
              </svg>
            </div>
          )}

          {/* 댓글 카드 영역 */}
          <div className={`boardCommentItem ${depth > 0 ? "boardReplyItem" : ""}`}>
            <div className={`boardCommentAvatar ${depth > 0 ? "boardReplyAvatar" : ""}`}>
              <span>{avatarChar}</span>
            </div>
            <div className="boardCommentBody">
              <div className="boardCommentMeta">
                <span className="boardCommentAuthorName">{comment.username}</span>
                {depth > 0 && <span className="boardReplyLabel">답글</span>}
                <span className="boardCommentDate">{formatCommentDate(comment.created_at)}</span>
              </div>
              {isEditing ? (
                // 인라인 수정 폼 영역: 수정 모드일 때 텍스트 영역을 입력 폼으로 치환합니다.
                <div className="boardCommentEditForm">
                  <textarea
                    className="boardCommentEditInput"
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                  />
                  <div className="boardCommentEditButtons">
                    <button
                      type="button"
                      className="boardCommentEditSaveBtn"
                      disabled={boardCommentSubmitting || !editingCommentText.trim()}
                      onClick={() => handleBoardCommentUpdate(comment.id, selectedBoardReview.id)}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="boardCommentEditCancelBtn"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingCommentText("");
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 댓글 내용 표시 영역
                <div className="boardCommentText">
                  {canViewSecret ? (
                    <>
                      {comment.is_secret && (
                        <span className="boardCommentSecretTag">🔒</span>
                      )}
                      {comment.content}
                    </>
                  ) : (
                    <span className="boardCommentSecretPlaceholder">🔒 비밀 댓글입니다.</span>
                  )}
                </div>
              )}
            </div>
            <div className="boardCommentActions">
              {!isEditing && supabaseSession && (
                <button
                  type="button"
                  className="boardCommentReplyBtn"
                  onClick={() => {
                    // 대댓글의 대상이 되는 부모 댓글 객체를 상태에 세팅합니다.
                    setReplyParentComment(comment);
                    // 답글 입력창을 공백으로 초기화합니다.
                    setBoardReplyText("");
                    // 부모 댓글의 비밀글 설정을 상속받아 비밀글 여부의 토글 기본값을 설정합니다.
                    setBoardReplyIsSecret(comment.is_secret);
                    // 대댓글 전용 모달 팝업을 오픈합니다.
                    setShowReplyModal(true);
                  }}
                >
                  답글
                </button>
              )}
              {!isEditing && isCommentOwner && (
                <>
                  <button
                    type="button"
                    className="boardCommentEditBtn"
                    onClick={() => {
                      // 선택된 댓글의 ID와 본문 내용을 수정 전용 상태 변수에 장착합니다.
                      setEditingCommentId(comment.id);
                      setEditingCommentText(comment.content);
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="boardCommentDeleteBtn"
                    onClick={() => handleBoardCommentDelete(comment.id, selectedBoardReview.id)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 자식 대댓글(답글) 리스트: 자식 리스트가 존재할 시 재귀적으로 노드를 출력합니다. */}
        {childReplies.length > 0 && (
          <div 
            className="boardReplyList" 
            style={{ marginLeft: depth > 0 ? "1.5rem" : "4.0rem" }}
          >
            {childReplies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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

  // 초기 탭이 선택될 때 아기 월령에 맞는 서브탭(1단계/2단계)을 자동으로 전환합니다.
  // 4개월은 early1(초기 1단계), 5~6개월은 early2(초기 2단계)로 이동시킵니다.
  // 비로그인이거나 초기 단계 범위(4~6개월)가 아니면 기본값(early1)을 유지합니다.
  useEffect(() => {
    if (stageTab !== "early" || !userProfile?.babyBirth) return;
    const months = calculateMonths(userProfile.babyBirth);
    if (months >= 4 && months <= 6) {
      setEarlySubTab(months <= 4 ? "early1" : "early2");
    }
  }, [stageTab, userProfile]);

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

  // 아기 월령에 따라 현재 적용 가능한 모든 이유식 단계를 배열로 반환합니다.
  // 5개월은 초기 1·2단계가 동시에 해당하고, 6·9·11개월은 현재 단계 + 다음 단계를 함께 반환합니다.
  const getApplicableStages = (months) => {
    if (months < 4 || months >= 24) return [];

    const results = [];
    const earlyStage = babyFoodStages.find(s => s.id === "early");
    const middleStage = babyFoodStages.find(s => s.id === "middle");
    const lateStage = babyFoodStages.find(s => s.id === "late");
    const completeStage = babyFoodStages.find(s => s.id === "complete");

    // 초기 1단계: 생후 4~5개월
    if (months >= 4 && months <= 5) {
      const sub = earlyStage.subStages.find(s => s.id === "early1");
      results.push({ stageId: "early", subStageId: "early1", stageName: sub.title, isUpcoming: false, stageData: earlyStage, subStageData: sub });
    }

    // 초기 2단계: 생후 5~6개월 (5개월에서 1단계와 겹침)
    if (months >= 5 && months <= 6) {
      const sub = earlyStage.subStages.find(s => s.id === "early2");
      results.push({ stageId: "early", subStageId: "early2", stageName: sub.title, isUpcoming: false, stageData: earlyStage, subStageData: sub });
    }

    // 6개월: 초기 마지막 달 → 중기 이유식 다음 단계 예고
    if (months === 6) {
      results.push({ stageId: "middle", subStageId: null, stageName: middleStage.title, isUpcoming: true, stageData: middleStage, subStageData: null });
    }

    // 중기: 생후 7~9개월
    if (months >= 7 && months <= 9) {
      results.push({ stageId: "middle", subStageId: null, stageName: middleStage.title, isUpcoming: false, stageData: middleStage, subStageData: null });
    }

    // 9개월: 중기 마지막 달 → 후기 이유식 다음 단계 예고
    if (months === 9) {
      results.push({ stageId: "late", subStageId: null, stageName: lateStage.title, isUpcoming: true, stageData: lateStage, subStageData: null });
    }

    // 후기: 생후 10~11개월
    if (months >= 10 && months <= 11) {
      results.push({ stageId: "late", subStageId: null, stageName: lateStage.title, isUpcoming: false, stageData: lateStage, subStageData: null });
    }

    // 11개월: 후기 마지막 달 → 완료기 이유식 다음 단계 예고
    if (months === 11) {
      results.push({ stageId: "complete", subStageId: null, stageName: completeStage.title, isUpcoming: true, stageData: completeStage, subStageData: null });
    }

    // 완료기: 생후 12~23개월
    if (months >= 12 && months <= 23) {
      results.push({ stageId: "complete", subStageId: null, stageName: completeStage.title, isUpcoming: false, stageData: completeStage, subStageData: null });
    }

    return results;
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
          email: await encryptData(email)
        });

      if (profileError) {
        console.error("프로필 생성 오류:", profileError);
      }
    }

    setRegisterForm({ email: "", parentName: "", babyName: "", babyBirth: "", password: "" });

    // 이메일 인증이 비활성화된 경우 signUp이 즉시 session을 반환하므로 자동 로그인 처리합니다.
    if (data.session) {
      setShowAuthModal(false);
      setCurrentTab("home");
      alert("회원가입이 완료되었습니다! 환영합니다.");
    } else {
      setAuthMode("login");
      alert("회원가입이 완료되었습니다! 이메일 인증 후 로그인해 주세요.");
    }
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
    if (!data?.email) {
      setFindEmailResult("notFound");
    } else {
      // DB에 암호화 저장된 이메일을 복호화하여 state에 저장
      const decrypted = await decryptData(data.email);
      setFindEmailResult(decrypted);
    }
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

  // 단계·서브스테이지에 해당하는 피드 오더 맵을 반환합니다.
  const getFeedOrderMap = (stageId, subStageId) => {
    if (stageId === "early") return subStageId === "early1" ? EARLY1_FEED_ORDER : EARLY2_FEED_ORDER;
    if (stageId === "middle") return MIDDLE_FEED_ORDER;
    if (stageId === "late") return LATE_FEED_ORDER;
    if (stageId === "complete") return COMPLETE_FEED_ORDER;
    if (stageId === "snack") return SNACK_FEED_ORDER;
    return {};
  };

  // 필터링된 레시피를 피드 오더 순서대로 정렬하여 반환합니다.
  const getSortedRecipesByOrder = (stageId, subStageId, filtered) => {
    const orderMap = getFeedOrderMap(stageId, subStageId);
    return [...filtered].sort((a, b) => (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999));
  };

  // 특정 Date 객체에 해당하는 단계별 메뉴 배열을 반환합니다. (달력 타일 렌더링에 사용)
  const getDayMenus = (date) => {
    if (!userProfile?.babyBirth) return [];
    // 타일 날짜 기준 생후 개월 수로 단계 결정 — 월 이동 시 해당 월의 단계 메뉴가 표시됨
    const months = calculateMonthsAtDate(userProfile.babyBirth, date);
    const stageInfo = determineStage(months);
    if (stageInfo.stageId === "none" || stageInfo.stageId === "graduation") return [];

    // 초기 단계인 경우 월령에 맞는 서브스테이지(1단계/2단계) 레시피만 추천합니다.
    const subStageId = months <= 4 ? "early1" : "early2";
    const filtered = recipes.filter(r =>
      r.stage === stageInfo.stageId &&
      (stageInfo.stageId !== "early" || r.subStage === subStageId)
    );
    if (!filtered.length) return [];

    // 먹어야 하는 순서대로 정렬한 뒤, daySeed로 오늘 위치를 결정합니다.
    const sorted = getSortedRecipesByOrder(stageInfo.stageId, subStageId, filtered);
    const daySeed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    const mealCount = stageInfo.stageId === "early" ? 1 : stageInfo.stageId === "middle" ? 2 : 3;
    return Array.from({ length: mealCount }, (_, i) =>
      sorted[(daySeed + i) % sorted.length]
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

    // 초기 단계인 경우 월령에 맞는 서브스테이지(1단계/2단계) 레시피만 추천합니다.
    const subStageId = months <= 4 ? "early1" : "early2";
    const filtered = recipes.filter(r =>
      r.stage === stageInfo.stageId &&
      (stageInfo.stageId !== "early" || r.subStage === subStageId)
    );
    if (!filtered.length) return null;

    // 먹어야 하는 순서대로 정렬한 뒤, daySeed로 오늘 위치를 결정합니다.
    const sorted = getSortedRecipesByOrder(stageInfo.stageId, subStageId, filtered);
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
      recipe: sorted[(daySeed + i) % sorted.length]
    }));

    return { months, ...stageInfo, meals };
  };

  const menuRecommendation = getMenuRecommendation();

  // 현재 탭과 단계 탭에 따라 SEO 메타 정보를 동적으로 계산합니다.
  // 구글/네이버 크롤러가 페이지별 키워드를 올바르게 색인하도록 각 뷰에 최적화된 값을 반환합니다.
  const seoMeta = useMemo(() => {
    const BASE_URL = "https://yummy.jaelab.kr";
    const SITE_NAME = "베베레시피";

    if (currentTab === "home") {
      const stageMetaMap = {
        early: {
          title: `초기 이유식 가이드 | ${SITE_NAME} — 생후 4~6개월 이유식 레시피`,
          description: "생후 4~6개월 초기 이유식 정보를 한눈에! 초기 이유식 만드는 법, 미음 레시피, 재료 도입 순서, 알레르기 체크리스트까지 베베레시피가 안내합니다.",
          keywords: "초기 이유식, 초기 이유식 레시피, 초기 이유식 만드는법, 4개월 이유식, 5개월 이유식, 6개월 이유식, 미음 레시피, 이유식 시작 시기, 이유식 알레르기",
          url: BASE_URL
        },
        middle: {
          title: `중기 이유식 가이드 | ${SITE_NAME} — 생후 7~9개월 이유식 레시피`,
          description: "생후 7~9개월 중기 이유식 만드는 법! 잘게 으깬 죽 레시피, 소고기 이유식, 닭고기 이유식, 철분 섭취 방법 등 중기 이유식 핵심 정보를 제공합니다.",
          keywords: "중기 이유식, 중기 이유식 레시피, 중기 이유식 만드는법, 7개월 이유식, 8개월 이유식, 9개월 이유식, 이유식 죽 레시피, 소고기 이유식, 이유식 철분",
          url: BASE_URL
        },
        late: {
          title: `후기 이유식 가이드 | ${SITE_NAME} — 생후 10~11개월 이유식 레시피`,
          description: "생후 10~11개월 후기 이유식 정보! 무른밥 만드는 법, 하루 3회 이유식 식단, 다양한 재료 조합 레시피로 아기 미각을 발달시켜 주세요.",
          keywords: "후기 이유식, 후기 이유식 레시피, 후기 이유식 만드는법, 10개월 이유식, 11개월 이유식, 무른밥 레시피, 이유식 3회, 이유식 식단표",
          url: BASE_URL
        },
        complete: {
          title: `완료기 이유식 가이드 | ${SITE_NAME} — 생후 12~24개월 이유식 레시피`,
          description: "생후 12~24개월 완료기 이유식에서 유아식으로의 전환! 진밥 레시피, 아기 국·찌개, 반찬 레시피와 함께 건강한 식습관을 만들어 주세요.",
          keywords: "완료기 이유식, 완료기 이유식 레시피, 12개월 이유식, 돌 이유식, 유아식 전환, 진밥 레시피, 아기 국 레시피, 아기 반찬, 아기 밥 레시피",
          url: BASE_URL
        },
        snack: {
          title: `아기 간식 레시피 | ${SITE_NAME} — 단계별 아기 간식 만드는 법`,
          description: "중기·후기·완료기 단계별 건강한 아기 간식 레시피! 고구마, 바나나, 두유, 전, 젤리 등 영양 가득한 아기 핑거푸드와 간식 만드는 법을 알려드립니다.",
          keywords: "아기 간식, 아기 간식 레시피, 이유식 간식, 아기 핑거푸드, 아기 스낵, 아기 고구마 간식, 아기 바나나 간식, 중기 간식, 후기 간식, 완료기 간식",
          url: BASE_URL
        }
      };

      return stageMetaMap[stageTab] || {
        title: `베베레시피 | 맞춤형 아기 이유식 추천 및 시기별 이유식 레시피 가이드`,
        description: "우리 아기를 위한 맞춤형 이유식 추천 및 단계별 이유식 레시피 가이드 플랫폼 베베레시피! 초기/중기/후기/완료기 이유식 식단 정보와 솔직한 요리 후기를 제공합니다.",
        keywords: "이유식, 이유식 추천, 아기 이유식 추천, 이유식 레시피, 초기 이유식, 중기 이유식, 후기 이유식, 완료기 이유식, 아기 이유식 가이드, 베베레시피",
        url: BASE_URL
      };
    }

    if (currentTab === "recipes") {
      return {
        title: `이유식 레시피 라이브러리 | ${SITE_NAME} — 단계별 이유식 레시피 모음`,
        description: "초기·중기·후기·완료기 이유식 레시피를 한 곳에서! 소고기 이유식, 닭고기 이유식, 야채 이유식 등 다양한 이유식 레시피를 단계별로 찾아보세요.",
        keywords: "이유식 레시피 모음, 단계별 이유식 레시피, 소고기 이유식 레시피, 닭고기 이유식, 야채 이유식, 이유식 만드는법, 이유식 재료, 이유식 검색",
        url: `${BASE_URL}/recipes`
      };
    }

    if (currentTab === "reviews") {
      return {
        title: `이유식 레시피 후기 게시판 | ${SITE_NAME}`,
        description: "베베레시피 회원들의 이유식 레시피 후기와 육아 정보를 공유하는 공간입니다. 실제 엄마·아빠들의 생생한 이유식 경험담을 읽어보세요.",
        keywords: "이유식 후기, 이유식 레시피 후기, 아기 이유식 후기, 이유식 후기 게시판, 이유식 공유, 육아 정보, 이유식 경험담",
        url: `${BASE_URL}/reviews`
      };
    }

    // 기본값 (myPage 등)
    return {
      title: `베베레시피 | 맞춤형 아기 이유식 추천 및 시기별 이유식 레시피 가이드`,
      description: "우리 아기를 위한 맞춤형 이유식 추천 및 단계별 이유식 레시피 가이드 플랫폼 베베레시피! 초기/중기/후기/완료기 이유식 식단 정보와 솔직한 요리 후기를 제공합니다.",
      keywords: "이유식, 이유식 추천, 아기 이유식 추천, 이유식 레시피, 초기 이유식, 중기 이유식, 후기 이유식, 완료기 이유식, 아기 이유식 가이드, 베베레시피",
      url: BASE_URL
    };
  }, [currentTab, stageTab]);

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
      {/* 탭 전환 시 구글·네이버 SEO 메타 태그를 동적으로 업데이트합니다. */}
      <Helmet>
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.description} />
        <meta name="keywords" content={seoMeta.keywords} />
        <link rel="canonical" href={seoMeta.url} />
        {/* 오픈그래프 — SNS 공유 및 네이버 블로그 공유 시 미리보기 카드 최적화 */}
        <meta property="og:title" content={seoMeta.title} />
        <meta property="og:description" content={seoMeta.description} />
        <meta property="og:url" content={seoMeta.url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://yummy.jaelab.kr/og-image.png" />
        <meta property="og:site_name" content="베베레시피" />
        {/* 트위터 카드 — 트위터/X 공유 시 미리보기 최적화 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMeta.title} />
        <meta name="twitter:description" content={seoMeta.description} />
        <meta name="twitter:image" content="https://yummy.jaelab.kr/og-image.png" />
      </Helmet>

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
            onClick={() => {
              // 레시피 후기 탭을 활성화합니다.
              setCurrentTab("reviews");
              // 상세화면이나 글쓰기 화면에 진입한 상태인 경우, 즉각 목록 화면으로 돌아가도록 boardView를 list로 초기화합니다.
              setBoardView("list");
            }}
          >
            레시피 후기
          </span>
          {supabaseSession && userProfile && (
            <span
              className={`navLink ${currentTab === "myPage" ? "navLinkActive" : ""}`}
              onClick={() => {
                // 마이페이지 진입 시 N 배지를 초기화하고 마지막 확인 시각을 갱신합니다.
                localStorage.setItem(`notif_checked_${supabaseSession.user.id}`, new Date().toISOString());
                setHasNewComment(false);
                setCurrentTab("myPage");
              }}
              style={{ position: "relative" }}
            >
              마이페이지
              {hasNewComment && <span className="navNewBadge">N</span>}
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

            {/* 단계별 레시피 미리보기 — 간식 탭 포함 모든 탭에서 표시합니다 */}
            {<section className="recipesSection">
              <h2 className="sectionTitle">{stageTab === "snack" ? "간식 레시피" : "이유식 메뉴 & 레시피"}</h2>
              <p style={{ textAlign: "center", fontSize: "1.4rem", color: "#666666", marginTop: "1rem" }}>
                {stageTab === "snack"
                  ? "MammaYou 채널의 단계별 아기 간식 레시피 모음입니다."
                  : "아기들이 가장 선호하고 부모님들이 자주 끓이는 필수 레시피 모음입니다."}
              </p>

              <div className="recipesGrid">
                {/* 메인 페이지 가이드의 선택된 탭 단계(stageTab)에 부합하는 이유식 레시피들만 필터링하고, 초기(early) 탭일 때는 1단계를 먼저 보여줍니다. */}
                {recipes && Array.isArray(recipes) && recipes
                  .filter(recipe => recipe?.stage === stageTab)
                  .sort((a, b) => {
                    // 각 단계별 이유식 도입 권장 순서대로 정렬합니다.
                    if (stageTab === "early") {
                      // 초기: 1단계(early1)를 2단계(early2)보다 앞에 두고, 각 단계 내 도입 순서로 정렬합니다.
                      const subOrder = { early1: 0, early2: 1 };
                      const subDiff = (subOrder[a.subStage] ?? 1) - (subOrder[b.subStage] ?? 1);
                      if (subDiff !== 0) return subDiff;
                      const orderMap = a.subStage === "early1" ? EARLY1_FEED_ORDER : EARLY2_FEED_ORDER;
                      return (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99);
                    }
                    if (stageTab === "middle") {
                      return (MIDDLE_FEED_ORDER[a.id] ?? 99) - (MIDDLE_FEED_ORDER[b.id] ?? 99);
                    }
                    if (stageTab === "late") {
                      return (LATE_FEED_ORDER[a.id] ?? 99) - (LATE_FEED_ORDER[b.id] ?? 99);
                    }
                    if (stageTab === "complete") {
                      return (COMPLETE_FEED_ORDER[a.id] ?? 99) - (COMPLETE_FEED_ORDER[b.id] ?? 99);
                    }
                    if (stageTab === "snack") {
                      return (SNACK_FEED_ORDER[a.id] ?? 99) - (SNACK_FEED_ORDER[b.id] ?? 99);
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
            </section>}

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

                {/* 현재 보는 월 기준 이유식 단계 요약 카드 — 겹치는 단계가 있으면 모두 표시 */}
                {/* 월 중간에 단계가 시작되는 경우는 마지막 날 기준으로, 졸업(24개월+)이 되는 달은 월초 기준으로 폴백합니다. */}
                {(() => {
                  if (!userProfile?.babyBirth) return null;
                  const lastDayOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0);
                  const monthsAtEnd = calculateMonthsAtDate(userProfile.babyBirth, lastDayOfMonth);
                  const monthsAtStart = calculateMonthsAtDate(userProfile.babyBirth, calendarViewDate);
                  const months = (monthsAtEnd >= 24 && monthsAtStart < 24) ? monthsAtStart : monthsAtEnd;
                  const stages = getApplicableStages(months);
                  if (!stages.length) return null;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                      {stages.map((stage, idx) => {
                        const displayData = stage.subStageData || stage.stageData;
                        return (
                          <div
                            key={idx}
                            className="stageInfoCard"
                            style={stage.isUpcoming ? { backgroundColor: "#fff9f6", borderColor: "#ffcbb7" } : {}}
                          >
                            <div
                              className="stageInfoBadge"
                              style={stage.isUpcoming ? { backgroundColor: "#ffb38a" } : {}}
                            >
                              {displayData.title || stage.stageData.title} 이유식
                            </div>
                            <ul className="stageInfoList">
                              <li className="stageInfoItem">
                                <span className="stageInfoLabel">시기</span>
                                <span className="stageInfoValue">{displayData.period}</span>
                              </li>
                              <li className="stageInfoItem">
                                <span className="stageInfoLabel">횟수</span>
                                <span className="stageInfoValue">{displayData.dailyCount}</span>
                              </li>
                              {displayData.amount && (
                                <li className="stageInfoItem">
                                  <span className="stageInfoLabel">1회 권장량</span>
                                  <span className="stageInfoValue">{displayData.amount}</span>
                                </li>
                              )}
                              <li className="stageInfoItem">
                                <span className="stageInfoLabel">형태</span>
                                <span className="stageInfoValue">{displayData.texture}</span>
                              </li>
                              {displayData.snack && (
                                <li className="stageInfoItem">
                                  <span className="stageInfoLabel">간식</span>
                                  <span className="stageInfoValue">{displayData.snack}</span>
                                </li>
                              )}
                              <li className="stageInfoItem">
                                <span className="stageInfoLabel">주재료</span>
                                <span className="stageInfoValue">{displayData.keyIngredients}</span>
                              </li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 사용자가 식단을 참고용으로만 인지하고 부담 없이 진행할 수 있도록 돕는 빨간색 안내 메시지입니다. */}
                <p style={{ color: "#d32f2f", fontSize: "1.4rem", fontWeight: 600, marginTop: "-1.6rem", marginBottom: "-1.6rem" }}>
                  추천 레시피는 단지 참고용 입니다. 꼭 이대로 안먹이셔도 됩니다.
                </p>

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

            {/* 후기 게시판 — boardView에 따라 목록/글쓰기 화면을 전환합니다 */}
            <section className="boardSection">
              <div className="boardContainer">

                {boardView === "list" && (
                  <>
                    <div className="boardHeader">
                      <h2 className="boardTitle">후기 게시판</h2>
                      <span className="boardCount">총 {boardTotalCount}개</span>
                    </div>

                    {boardLoading ? (
                      <div className="boardLoading">불러오는 중...</div>
                    ) : (
                      <>
                        {/* PC 버전 테이블 뷰: 데스크톱 해상도에서만 테이블 형태로 표출됩니다. */}
                        <table className="boardTable">
                          <colgroup>
                            <col className="colNum" />
                            <col className="colCategory" />
                            <col className="colRecipe" />
                            <col className="colAuthor" />
                            <col className="colDate" />
                            <col className="colViews" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th scope="col">번호</th>
                              <th scope="col">구분</th>
                              <th scope="col">제목</th>
                              <th scope="col">작성자</th>
                              <th scope="col">작성일</th>
                              <th scope="col">조회수</th>
                            </tr>
                          </thead>
                          <tbody>
                            {boardReviews.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="boardEmpty">
                                  아직 작성된 후기가 없습니다. 첫 후기를 남겨보세요!
                                </td>
                              </tr>
                            ) : (
                              boardReviews.map((review, idx) => {
                                const rowNum = boardTotalCount - ((boardPage - 1) * REVIEW_PAGE_SIZE) - idx;
                                const cat = review.category || "레시피 후기";
                                const badgeClass = cat === "신규 레시피 후기"
                                  ? "boardCategoryBadgeNew"
                                  : cat === "기타"
                                    ? "boardCategoryBadgeEtc"
                                    : "boardCategoryBadgeReview";
                                return (
                                  <tr key={review.id} className="boardRow">
                                    <td className="boardCellNum">{rowNum}</td>
                                    <td className="boardCellCategory">
                                      <span className={`boardCategoryBadge ${badgeClass}`}>
                                        {cat}
                                      </span>
                                    </td>
                                    <td className="boardCellRecipe">
                                      {/* 제목을 a 태그로 감싸서 클릭 시 상세페이지로 이동합니다 */}
                                      <a
                                        href="/reviews/detail"
                                        className="boardTitleLink"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleBoardReviewClick(review); // 조회수 증가 및 상세페이지 진입을 수행합니다.
                                        }}
                                      >
                                        {review.title || "(제목 없음)"}
                                      </a>
                                    </td>
                                    <td className="boardCellAuthor">{review.username}</td>
                                    <td className="boardCellDate">{formatReviewDate(review.created_at)}</td>
                                    <td className="boardCellViews">{review.views || 0}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>

                        {/* 모바일 버전 카드형 리스트 뷰: 모바일 해상도(768px 이하)에서만 이미지처럼 노출됩니다. */}
                        <div className="boardMobileList">
                          {boardReviews.length === 0 ? (
                            <div className="boardEmpty">아직 작성된 후기가 없습니다. 첫 후기를 남겨보세요!</div>
                          ) : (
                            boardReviews.map((review) => {
                              const cat = review.category || "레시피 후기";
                              // 조인 쿼리로 받아온 자식 댓글 목록 개수를 댓글 개수로 표시합니다.
                              const commentCount = review.review_comments?.length || 0;
                              return (
                                <div key={review.id} className="boardMobileItem">
                                  {/* 게시글 구분을 표시하는 카테고리 영역 */}
                                  <div className="boardMobileCategory">{cat}</div>
                                  {/* 굵고 명확한 블랙 타이틀 제목 링크 */}
                                  <div className="boardMobileTitle">
                                    <a
                                      href="/reviews/detail"
                                      className="boardMobileTitleLink"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleBoardReviewClick(review); // 조회수 증가 및 상세페이지 진입을 수행합니다.
                                      }}
                                    >
                                      {review.title || "(제목 없음)"}
                                    </a>
                                  </div>
                                  {/* 메타데이터 정보 행: 댓글수, 작성자, 작성일, 조회수를 한 줄에 나열합니다. */}
                                  <div className="boardMobileMeta">
                                    <span>댓글 {commentCount}</span>
                                    <span className="boardMobileMetaDivider">·</span>
                                    <span>{review.username}</span>
                                    <span className="boardMobileMetaDivider">·</span>
                                    <span>{formatReviewDate(review.created_at)}</span>
                                    <span className="boardMobileMetaDivider">·</span>
                                    <span>조회 {review.views || 0}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {boardTotalCount > REVIEW_PAGE_SIZE && (
                          <div className="boardPagination">
                            <button
                              className="boardPageBtn"
                              disabled={boardPage === 1}
                              onClick={() => { const p = boardPage - 1; setBoardPage(p); fetchBoardReviews(p); }}
                            >
                              이전
                            </button>
                            {Array.from(
                              { length: Math.ceil(boardTotalCount / REVIEW_PAGE_SIZE) },
                              (_, i) => i + 1
                            ).map(p => (
                              <button
                                key={p}
                                className={`boardPageBtn ${boardPage === p ? "boardPageBtnActive" : ""}`}
                                onClick={() => { setBoardPage(p); fetchBoardReviews(p); }}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              className="boardPageBtn"
                              disabled={boardPage === Math.ceil(boardTotalCount / REVIEW_PAGE_SIZE)}
                              onClick={() => { const p = boardPage + 1; setBoardPage(p); fetchBoardReviews(p); }}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* 글쓰기 버튼 */}
                    <div className="boardWriteArea">
                      {supabaseSession ? (
                        <button
                          className="boardWriteBtn"
                          onClick={() => {
                            setBoardWriteContent("");
                            navigate("/reviews/write");
                          }}
                        >
                          글쓰기
                        </button>
                      ) : (
                        <button
                          className="boardWriteBtn boardWriteBtnDisabled"
                          onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                        >
                          로그인 후 글쓰기
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* 상세보기 뷰 — 선택한 게시글의 전체 내용을 표시합니다 */}
                {boardView === "detail" && selectedBoardReview && (
                  <>
                    <div className="boardDetailCard">
                      <div className="boardDetailMeta">
                        <span className={`boardCategoryBadge ${
                          (selectedBoardReview.category || "레시피 후기") === "신규 레시피 후기"
                            ? "boardCategoryBadgeNew"
                            : (selectedBoardReview.category || "레시피 후기") === "기타"
                              ? "boardCategoryBadgeEtc"
                              : "boardCategoryBadgeReview"
                        }`}>
                          {selectedBoardReview.category || "레시피 후기"}
                        </span>
                        <span className="boardDetailDate">{formatReviewDate(selectedBoardReview.created_at)}</span>
                      </div>

                      <h2 className="boardDetailTitle">{selectedBoardReview.title || "(제목 없음)"}</h2>

                      <div className="boardDetailAuthor">
                        <span>작성자: {selectedBoardReview.username}</span>
                        <span className="boardDetailViews">조회수: {selectedBoardReview.views || 0}</span>
                      </div>

                      <div className="boardDetailDivider" />

                      {/* Quill 정렬 클래스 스타일이 깨지지 않도록 ql-editor를 추가하여 HTML 컨텐츠를 안전하게 렌더링합니다 */}
                      <div
                        className="boardDetailContent ql-editor"
                        dangerouslySetInnerHTML={{ __html: selectedBoardReview.content }}
                      />

                      {/* 하단 버튼 영역: 목록으로 버튼은 왼쪽에 배치하고, 본인 글인 경우 삭제 버튼을 우측에 렌더링합니다 */}
                      <div className="boardDetailActions">
                        <button
                          className="boardDetailBackBtn"
                          onClick={() => {
                            // 목록 페이지로 돌아가며 뷰 모드를 목록 리스트로 변경합니다.
                            setBoardView("list");
                            navigate("/reviews");
                          }}
                        >
                          목록
                        </button>
                        {supabaseSession && supabaseSession.user.id === selectedBoardReview.user_id && (
                          <div className="boardDetailOwnerActions">
                            <button
                              className="boardDetailDeleteBtn"
                              onClick={async () => {
                                if (!window.confirm("이 글을 삭제할까요?")) return;
                                const { error } = await supabase
                                  .from("recipe_reviews")
                                  .delete()
                                  .eq("id", selectedBoardReview.id);
                                if (!error) {
                                  // 삭제 성공 시 목록 상태로 되돌리고 리뷰를 갱신합니다.
                                  setSelectedBoardReview(null);
                                  setBoardView("list");
                                  setBoardPage(1);
                                  await fetchBoardReviews(1);
                                  navigate("/reviews");
                                } else {
                                  alert("삭제 권한이 없거나 오류가 발생했습니다.");
                                }
                              }}
                            >
                              삭제
                            </button>
                            <button
                              className="boardDetailEditBtn"
                              onClick={() => {
                                // 현재 상세보기 게시글 정보를 글쓰기/수정 폼의 상태값으로 로드하고 수정 모드를 켭니다.
                                setBoardEditId(selectedBoardReview.id);
                                setBoardWriteCategory(selectedBoardReview.category || "레시피 후기");
                                setBoardWriteTitle(selectedBoardReview.title || "");
                                setBoardWriteContent(selectedBoardReview.content || "");
                                setBoardView("write");
                                navigate("/reviews/write");
                              }}
                            >
                              수정
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 댓글 섹션: 후기 상세 페이지의 댓글 영역을 표시합니다 */}
                    <div className="boardCommentSection">
                      <h3 className="boardCommentSectionTitle">댓글</h3>

                      {/* 댓글 목록 영역 */}
                      <div className="boardCommentList">
                        {boardComments.length === 0 ? (
                          <div className="boardCommentEmpty">등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!</div>
                        ) : (
                          (() => {
                            // 대댓글 구조를 재귀적으로 그리기 위해 최상위 부모 댓글(parent_id가 없는 댓글)만 1차로 필터링하여 진입합니다.
                            const rootComments = boardComments.filter((c) => !c.parent_id);
                            return rootComments.map((rootComment) => renderCommentNode(rootComment, 0));
                          })()
                        )}
                      </div>

                      {/* 댓글 작성 폼 영역 */}
                      <div className="boardCommentFormContainer">
                        <div className="boardCommentFormRow">
                          <textarea
                            className="boardCommentInput"
                            placeholder={supabaseSession ? "댓글을 입력해 주세요." : "로그인 후 댓글을 작성할 수 있습니다."}
                            value={boardCommentText}
                            disabled={!supabaseSession}
                            onChange={(e) => setBoardCommentText(e.target.value)}
                          />
                          <button
                            type="button"
                            className="boardCommentSubmitBtn"
                            disabled={boardCommentSubmitting || !boardCommentText.trim() || !supabaseSession}
                            onClick={() => handleBoardCommentSubmit(selectedBoardReview.id)}
                          >
                            확인
                          </button>
                        </div>
                        <div className="boardCommentFormFooter">
                          <label className="boardCommentSecretLabel">
                            <input
                              type="checkbox"
                              checked={boardCommentIsSecret}
                              disabled={!supabaseSession}
                              onChange={(e) => setBoardCommentIsSecret(e.target.checked)}
                            />
                            <span className="boardCommentSecretText">비밀 댓글</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {boardView === "write" && (
                  <>
                    {/* 글쓰기/수정 폼 헤더 */}
                    <div className="boardWriteHeader">
                      <button
                        className="boardBackBtn"
                        onClick={() => {
                          if (boardEditId) {
                            // 수정 모드 중 이탈 시에는 수정 상태를 해제하고 보던 상세페이지로 복귀합니다.
                            setBoardEditId(null);
                            setBoardView("detail");
                            navigate("/reviews/detail");
                          } else {
                            navigate("/reviews");
                          }
                        }}
                      >
                        ← 목록으로
                      </button>
                      <h2 className="boardWriteTitle">{boardEditId ? "후기 수정" : "후기 작성"}</h2>
                    </div>

                    <div className="boardWriteForm">
                      {/* 구분 선택 */}
                      <div className="boardWriteField">
                        <select
                          id="writeCategorySelect"
                          className="boardWriteCategorySelect"
                          value={boardWriteCategory}
                          onChange={e => setBoardWriteCategory(e.target.value)}
                        >
                          <option value="레시피 후기">레시피 후기</option>
                          <option value="신규 레시피 후기">신규 레시피 후기</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>

                      {/* 제목 입력 */}
                      <div className="boardWriteField">
                        <input
                          id="writeTitleInput"
                          type="text"
                          className="boardWriteInput"
                          placeholder="제목을 입력해주세요. (최대 100자)"
                          maxLength={100}
                          value={boardWriteTitle}
                          onChange={e => setBoardWriteTitle(e.target.value)}
                        />
                      </div>

                      {/* 내용 작성 */}
                      <div className="boardWriteField">
                        <div className="boardQuillWrapper">
                          <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={boardWriteContent}
                            onChange={setBoardWriteContent}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="이유식을 만들어 본 솔직한 후기를 작성해주세요."
                          />
                        </div>
                      </div>

                      {/* 밸리데이션 에러 메시지 */}
                      {boardWriteError && (
                        <p className="boardWriteErrorMsg">{boardWriteError}</p>
                      )}

                      {/* 버튼 영역 */}
                      <div className="boardWriteActions">
                        <button
                          type="button"
                          className="boardWriteCancelBtn"
                          onClick={(e) => {
                            // 페이지 전환 시 브라우저의 원치 않는 기본 스크롤 동작을 예방합니다.
                            e.preventDefault();
                            if (boardEditId) {
                              // 수정 모드 중 취소할 때는 수정 상태를 해제하고 보던 상세페이지로 되돌아갑니다.
                              setBoardEditId(null);
                              setBoardView("detail");
                              navigate("/reviews/detail");
                            } else {
                              navigate("/reviews");
                            }
                          }}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className="boardWriteSubmitBtn"
                          disabled={boardWriteSubmitting}
                          onClick={(e) => handleBoardWriteSubmit(e)}
                        >
                          {boardWriteSubmitting ? (boardEditId ? "수정 중..." : "등록 중...") : (boardEditId ? "수정완료" : "등록하기")}
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </section>

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
                  <span className="myPageInfoValue">{maskEmail(supabaseSession.user.email)}</span>
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
                  유튜브에서 영상 보기
                </a>
              )}

              {/* 후기 섹션 */}
              <div className="reviewSection">

                {/* 로그인한 회원만 후기를 입력할 수 있도록 폼 노출 조건을 제어합니다. */}
                {supabaseSession ? (
                  <div className="reviewForm">
                    <textarea
                      className="reviewTextarea"
                      placeholder="이 레시피를 만들어 보셨나요? 후기를 남겨주세요! (300자 이내)"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      maxLength={300}
                      rows={3}
                    />
                    <div className="reviewFormFooter">
                      <span className="reviewCharCount">{reviewText.length}/300</span>
                      <button
                        className="reviewSubmitBtn"
                        onClick={handleReviewSubmit}
                        disabled={reviewSubmitting || !reviewText.trim()}
                      >
                        {reviewSubmitting ? "등록 중..." : "후기 등록"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="reviewLoginNotice">
                    <button
                      className="reviewLoginLink"
                      onClick={() => { setSelectedRecipe(null); setShowAuthModal(true); }}
                    >
                      로그인
                    </button>
                    &nbsp;후 후기를 남길 수 있어요.
                  </p>
                )}

                {/* 후기 목록 */}
                {reviews.length > 0 ? (
                  <>
                    <ul className="reviewList">
                      {reviews.map((review) => (
                        <li key={review.id} className="reviewItem">
                          <div className="reviewItemHeader">
                            <div className="reviewAvatar">{review.username.charAt(0)}</div>
                            <div className="reviewMeta">
                              <span className="reviewUsername">{review.username}</span>
                              <span className="reviewDate">{formatReviewDate(review.created_at)}</span>
                            </div>
                            {/* 본인 후기에만 삭제 버튼 노출 */}
                            {supabaseSession?.user?.id === review.user_id && (
                              <button
                                className="reviewDeleteBtn"
                                onClick={() => handleReviewDelete(review.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                          <p className="reviewContent">{review.content}</p>
                        </li>
                      ))}
                    </ul>

                    {/* 10개 초과 시 페이지네이션 */}
                    {reviewTotalCount > REVIEW_PAGE_SIZE && (
                      <div className="reviewPagination">
                        <button
                          className="reviewPageBtn"
                          onClick={() => handleReviewPageChange(reviewPage - 1)}
                          disabled={reviewPage === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="reviewPageInfo">
                          {reviewPage} / {Math.ceil(reviewTotalCount / REVIEW_PAGE_SIZE)}
                        </span>
                        <button
                          className="reviewPageBtn"
                          onClick={() => handleReviewPageChange(reviewPage + 1)}
                          disabled={reviewPage >= Math.ceil(reviewTotalCount / REVIEW_PAGE_SIZE)}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="reviewEmpty">아직 후기가 없어요. 첫 번째 후기를 남겨주세요!</p>
                )}
              </div>
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
                        <p className="authResultEmail">{maskEmail(findEmailResult)}</p>
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
                    <p className="authResultEmail">{maskEmail(findPasswordForm.email)}</p>
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

      {/* 6. 대댓글(답글) 작성 팝업 모달: 사용자가 요청한 스크린샷 시안에 맞추어 디자인을 대폭 개선하고 비밀 댓글 토글 기능을 추가한 레이아웃입니다 */}
      {showReplyModal && replyParentComment && (
        <div className="replyModalOverlay" onMouseDown={() => { setShowReplyModal(false); setReplyParentComment(null); setBoardReplyIsSecret(false); }}>
          <div className="replyModalContent" onMouseDown={(e) => e.stopPropagation()}>
            <button
              className="replyModalCloseBtn"
              onClick={() => { setShowReplyModal(false); setReplyParentComment(null); setBoardReplyIsSecret(false); }}
            >
              <X size={20} />
            </button>
            <div className="replyModalHeader">
              <span className="replyModalSubtitle">REPLY</span>
              <h2 className="replyModalTitle">댓글달기</h2>
            </div>
            <div className="replyModalBody">
              {/* 선택된 원댓글 정보를 둥근 회색 테두리 박스 형태로 상단에 고정 표시하여 가독성을 높입니다 */}
              <div className="replyModalParentBox">
                <div className="replyModalParentAuthor">{replyParentComment.username}</div>
                <div className="replyModalParentContent">
                  {replyParentComment.is_secret ? "🔒 비밀 댓글입니다." : replyParentComment.content}
                </div>
              </div>
              
              <div className="replyModalLabel">댓글 내용</div>
              <textarea
                className="replyModalTextarea"
                placeholder="대댓글을 입력해 주세요."
                value={boardReplyText}
                maxLength={2000}
                onChange={(e) => setBoardReplyText(e.target.value)}
              />
            </div>
            <div className="replyModalFooter">
              {/* 비밀 댓글 토글 영역입니다. 원댓글이 비밀글이면 보안상 체크박스를 무조건 체크 상태로 유지하여 비활성화시킵니다 */}
              <label className="replyModalSecretCheck">
                <input
                  type="checkbox"
                  checked={boardReplyIsSecret}
                  disabled={replyParentComment.is_secret}
                  onChange={(e) => setBoardReplyIsSecret(e.target.checked)}
                />
                <span>비밀 댓글</span>
              </label>
              
              <div className="replyModalFooterRight">
                <span className="replyModalMaxChars">최대 2,000자</span>
                <button
                  type="button"
                  className="replyModalSubmitBtn"
                  disabled={boardCommentSubmitting || !boardReplyText.trim()}
                  onClick={() => handleBoardCommentSubmit(selectedBoardReview.id, replyParentComment.id, boardReplyIsSecret)}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
