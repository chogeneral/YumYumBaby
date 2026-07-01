import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  ChevronRight,
  Baby,
  Utensils,
  X,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { babyFoodStages, babyFoodRecipes, recipeMedia } from "./data/babyFoodData";

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

// 애플리케이션의 전체 기능과 라우팅을 수행하는 메인 App 컴포넌트입니다.
export default function App() {
  // --- 상태 관리 정의 ---
  const [currentTab, setCurrentTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeFilter, setRecipeFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // 아기 생년월일 및 자동 계산된 단계 정보 상태입니다.
  const [babyBirthDate, setBabyBirthDate] = useState("");
  const [babyStageInfo, setBabyStageInfo] = useState(null);

  const [stageTab, setStageTab] = useState("early");
  // 초기 탭 내부에서 1단계/2단계를 전환하기 위한 서브탭 상태입니다.
  const [earlySubTab, setEarlySubTab] = useState("early1");
  // 후기 탭 내부에서 밥/죽을 전환하기 위한 서브탭 상태입니다.
  const [lateTab, setLateTab] = useState("밥");
  // 완료기 탭 내부에서 밥/국/반찬을 전환하기 위한 서브탭 상태입니다.
  const [completeTab, setCompleteTab] = useState("밥");

  // 레시피 탭 — 초기 1단계/2단계 서브탭
  const [recipeEarlySubTab, setRecipeEarlySubTab] = useState("early1");
  // 레시피 탭 — 중기 서브탭 (중기 레시피/아이주도이유식/간식)
  const [recipeMiddleSubTab, setRecipeMiddleSubTab] = useState("middle");
  // 레시피 탭 — 후기 밥/죽/아이주도이유식/간식 서브탭
  const [recipeLateSubTab, setRecipeLateSubTab] = useState("밥");
  // 레시피 탭 — 완료기 밥/국/반찬/아이주도이유식/간식 서브탭
  const [recipeCompleteSubTab, setRecipeCompleteSubTab] = useState("밥");

  // 초기 1단계 레시피의 이유식 도입 권장 순서입니다.
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
  const EARLY2_FEED_ORDER = {
    recipeEarly15: 1,
    recipeEarly14: 2,
    recipeEarly34: 3,
    recipeEarly25: 4,
    recipeEarly33: 5,
    recipeEarly28: 6,
    recipeEarly40: 7,
    recipeEarly32: 8,
    recipeEarly50: 9,
    recipeEarly35: 10,
    recipeEarly08: 11,
    recipeEarly37: 12,
    recipeEarly27: 13,
    recipeEarly41: 14,
    recipeEarly49: 15,
    recipeEarly38: 16,
    recipeEarly22: 17,
    recipeEarly26: 18,
    recipeEarly29: 19,
    recipeEarly31: 20,
    recipeEarly39: 21,
    recipeEarly42: 22,
    recipeEarly24: 23,
    recipeEarly30: 24,
    recipeEarly36: 25,
    recipeEarly43: 26,
    recipeEarly44: 27,
    recipeEarly45: 28,
    recipeEarly46: 29,
    recipeEarly23: 30,
    recipeEarly47: 31,
    recipeEarly48: 32,
  };

  // 중기 레시피 도입 권장 순서입니다.
  const MIDDLE_FEED_ORDER = {
    recipeMiddle22: 1,
    recipeMiddle04: 2,
    recipeMiddle01: 3,
    recipeMiddle19: 4,
    recipeMiddle25: 5,
    recipeMiddle45: 6,
    recipeMiddle18: 7,
    recipeMiddle20: 8,
    recipeMiddle41: 9,
    recipeMiddle29: 10,
    recipeMiddle14: 11,
    recipeMiddle42: 12,
    recipeMiddle43: 13,
    recipeMiddle16: 14,
    recipeMiddle17: 15,
    recipeMiddle37: 16,
    recipeMiddle26: 17,
    recipeMiddle12: 18,
    recipeMiddle15: 19,
    recipeMiddle23: 20,
    recipeMiddle32: 21,
    recipeMiddle24: 22,
    recipeMiddle35: 23,
    recipeMiddle21: 24,
    recipeMiddle05: 25,
    recipeMiddle08: 26,
    recipeMiddle07: 27,
    recipeMiddle46: 28,
    recipeMiddle09: 29,
    recipeMiddle10: 30,
    recipeMiddle36: 31,
    recipeMiddle03: 32,
    recipeMiddle28: 33,
    recipeMiddle27: 34,
    recipeMiddle33: 35,
    recipeMiddle11: 36,
    recipeMiddle40: 37,
    recipeMiddle30: 38,
    recipeMiddle13: 39,
    recipeMiddle34: 40,
    recipeMiddle39: 41,
    recipeMiddle31: 42,
    recipeMiddle38: 43,
    recipeMiddle44: 44,
  };

  // 후기 레시피 도입 권장 순서입니다.
  const LATE_FEED_ORDER = {
    recipeLate09: 1,
    recipeLate10: 2,
    recipeLate11: 3,
    recipeLate16: 4,
    recipeLate14: 5,
    recipeLate06: 6,
    recipeLate13: 7,
    recipeLate04: 8,
    recipeLate07: 9,
    recipeLate15: 10,
    recipeLate18: 11,
    recipeLate03: 12,
    recipeLate12: 13,
    recipeLate08: 14,
    recipeLate02: 15,
    recipeLate01: 16,
    recipeLate05: 17,
    recipeLate17: 18,
    recipeLate19: 19,
    recipeLate20: 20,
    recipeLate21: 21,
  };

  // 완료기 레시피 도입 권장 순서입니다.
  const COMPLETE_FEED_ORDER = {
    recipeComplete09: 1,
    recipeComplete08: 2,
    recipeComplete11: 3,
    recipeComplete17: 4,
    recipeComplete18: 5,
    recipeComplete20: 6,
    recipeComplete03: 7,
    recipeComplete19: 8,
    recipeComplete14: 9,
    recipeComplete12: 10,
    recipeComplete21: 11,
    recipeComplete32: 12,
    recipeComplete01: 14,
    recipeComplete16: 15,
    recipeComplete13: 16,
    recipeComplete15: 17,
    recipeComplete02: 18,
    recipeComplete06: 19,
    recipeComplete22: 20,
    recipeComplete07: 21,
    recipeComplete23: 22,
    recipeComplete24: 23,
    recipeComplete10: 24,
    recipeComplete04: 25,
    recipeComplete05: 26,
    recipeComplete33: 27,
    recipeComplete34: 28,
    recipeComplete35: 29,
    recipeComplete36: 30,
    recipeComplete37: 31,
    recipeComplete38: 32,
    recipeComplete39: 33,
    recipeComplete40: 34,
    recipeComplete41: 35,
    recipeComplete42: 36,
    recipeComplete43: 37,
    recipeComplete44: 38,
    recipeComplete45: 39,
    recipeComplete46: 40,
    recipeComplete47: 41,
  };

  // 아이 주도 이유식(BLW) 레시피 도입 권장 순서입니다.
  const BLW_FEED_ORDER = {
    recipeBlw01: 1,
    recipeBlw02: 2,
    recipeBlw03: 3,
    recipeBlw04: 4,
    recipeBlw05: 5,
    recipeBlw06: 6,
    recipeBlw07: 7,
    recipeBlw08: 8,
    recipeBlw09: 9,
    recipeBlw10: 10,
    recipeBlw11: 11,
    recipeBlw12: 12,
  };

  // 간식 레시피 도입 권장 순서입니다.
  const SNACK_FEED_ORDER = {
    recipeSnack07: 1,
    recipeSnack01: 2,
    recipeSnack06: 3,
    recipeSnack08: 4,
    recipeSnack09: 5,
    recipeSnack10: 6,
    recipeSnack12: 7,
    recipeSnack02: 8,
    recipeSnack03: 9,
    recipeSnack05: 10,
    recipeSnack11: 11,
    recipeSnack04: 12,
  };

  // 후기 레시피의 카테고리(밥/죽)를 이름 패턴으로 판별합니다.
  const getLateType = (recipe) => {
    return (recipe.name || "").includes("죽") ? "죽" : "밥";
  };

  // 완료기 레시피의 카테고리(밥/국/반찬)를 이름 패턴으로 판별합니다.
  const getCompleteType = (recipe) => {
    if (recipe.subType) return recipe.subType;
    const name = recipe.name || "";
    if (name.includes("국")) return "국";
    if (name.includes("장조림") || name.includes("김밥") || name.includes("떡볶이")) return "반찬";
    return "밥";
  };

  // 레시피의 stage와 subStage를 기반으로 태그에 적용할 CSS 클래스명을 반환합니다.
  const getStageTagClass = (recipe) => {
    if (recipe.stage === "early") {
      return recipe.subStage === "early1" ? "tagEarly1" : "tagEarly2";
    }
    if (recipe.stage === "middle") return "tagMiddle";
    if (recipe.stage === "late") return "tagLate";
    if (recipe.stage === "blw") return "tagBlw";
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
    if (recipe.stage === "blw") return "아이주도";
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
    if (recipe.stage === "blw") return "아이주도 이유식";
    if (recipe.stage === "snack") {
      if (recipe.subStage === "snack1") return "중기 간식";
      if (recipe.subStage === "snack2") return "후기 간식";
      return "완료기 간식";
    }
    return "완료기 이유식";
  };

  // 아기 생년월일로 생후 개월 수를 계산합니다.
  const calculateMonths = (birthDateString) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    if (today.getDate() < birthDate.getDate()) months--;
    return months < 0 ? 0 : months;
  };

  // 생후 개월 수에 맞는 이유식 단계를 반환합니다.
  const determineStage = (months) => {
    if (months < 4) {
      return {
        stageId: "none",
        stageName: "이유식 준비기",
        description: "모유·분유만으로 충분한 시기입니다. 아직 소화기관이 이유식을 받아들일 준비가 되지 않았어요. 목 가누기가 되고, 음식에 관심을 보이며, 숟가락을 밀어내지 않을 때가 이유식 시작 신호입니다.",
      };
    } else if (months <= 6) {
      return {
        stageId: "early",
        stageName: "초기",
        description: "쌀미음부터 시작해 한 가지 재료씩 3~4일 간격으로 늘려가세요. 새 재료마다 알레르기 반응(발진·구토·설사)을 꼭 확인해야 합니다. 하루 1~2회, 오전 수유 후 10배죽 묽기로 1~2숟가락부터 서서히 양을 늘려갑니다.",
      };
    } else if (months <= 9) {
      return {
        stageId: "middle",
        stageName: "중기",
        description: "5~7배죽(잘게 으깬 입자 형태)으로 농도를 높여가세요. 소고기·닭고기 등 철분이 풍부한 육류를 매일 포함하는 것이 중요합니다. 하루 2회로 늘리고 오전·오후 정해진 시간에 규칙적으로 제공하며, 두부·달걀노른자·다양한 채소로 재료를 다양화하세요.",
      };
    } else if (months <= 11) {
      return {
        stageId: "late",
        stageName: "후기",
        description: "무른밥~진밥 형태로 하루 3회 규칙적인 식사 패턴을 만들어가세요. 밥+국+반찬처럼 어른 식탁과 유사한 구성으로 제공하면 좋습니다. 부드러운 핑거푸드로 스스로 집어먹는 연습도 시작하세요. 어른 음식은 간하기 전에 따로 덜어주세요.",
      };
    } else if (months <= 23) {
      return {
        stageId: "complete",
        stageName: "완료기",
        description: "진밥·잡곡밥으로 전환하며 하루 3회 식사와 간식 1~2회를 규칙적으로 제공하세요. 스스로 숟가락·포크를 사용하도록 격려하고, 다양한 반찬으로 편식을 줄여가는 시기입니다. 저염(어른 음식의 1/3 이하 간)은 계속 유지해 주세요.",
      };
    } else {
      return {
        stageId: "graduation",
        stageName: "이유식 졸업",
        description: "유아식으로 완전히 전환되는 단계입니다. 어른과 거의 동일한 식사가 가능하지만 저염·저당 원칙은 꾸준히 지켜주세요. 편식이 심해지는 시기이므로 다양한 조리법으로 식재료에 친숙해지도록 도와주세요.",
      };
    }
  };

  // 생년월일 변경 시 단계를 자동 계산하고 레시피 필터를 업데이트합니다.
  useEffect(() => {
    if (!babyBirthDate) {
      setBabyStageInfo(null);
      setRecipeFilter("all");
      return;
    }
    const months = calculateMonths(babyBirthDate);
    const stageInfo = determineStage(months);
    setBabyStageInfo({ months, ...stageInfo });
    if (stageInfo.stageId !== "none" && stageInfo.stageId !== "graduation") {
      setRecipeFilter(stageInfo.stageId);
    } else {
      setRecipeFilter("all");
    }
  }, [babyBirthDate]);

  // 생년월일 변경으로 시기가 바뀔 때 레시피 탭 서브탭을 초기화합니다.
  useEffect(() => {
    setRecipeEarlySubTab("early1");
    setRecipeMiddleSubTab("middle");
    setRecipeLateSubTab("밥");
    setRecipeCompleteSubTab("밥");
  }, [recipeFilter]);

  // 후기 이외의 탭으로 이동할 때 lateTab을 기본값(밥)으로 초기화합니다.
  useEffect(() => {
    if (stageTab !== "late") setLateTab("밥");
  }, [stageTab]);

  // 완료기 이외의 탭으로 이동할 때 completeTab을 기본값(밥)으로 초기화합니다.
  useEffect(() => {
    if (stageTab !== "complete") setCompleteTab("밥");
  }, [stageTab]);

  // 단계 필터로 레시피 목록을 걸러냅니다.
  const getFilteredRecipes = () => {
    return babyFoodRecipes.filter(recipe => {
      return recipeFilter === "all" || recipe.stage === recipeFilter;
    });
  };

  // 현재 탭과 단계 탭에 따라 SEO 메타 정보를 동적으로 계산합니다.
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
        },
        blw: {
          title: `아이 주도 이유식(BLW) 가이드 | ${SITE_NAME} — 핑거푸드 이유식 방법`,
          description: "아이 주도 이유식(BLW, Baby-Led Weaning) 시작 방법! 아기 스스로 먹는 핑거푸드 이유식, 안전한 식재료 선택, 질식 예방 가이드까지 베베레시피가 안내합니다.",
          keywords: "아이 주도 이유식, BLW, 베이비 레드 위닝, 핑거푸드 이유식, 아기 핑거푸드, 이유식 핑거푸드, 아이주도 이유식 시작, 자율 이유식",
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

    return {
      title: `베베레시피 | 맞춤형 아기 이유식 추천 및 시기별 이유식 레시피 가이드`,
      description: "우리 아기를 위한 맞춤형 이유식 추천 및 단계별 이유식 레시피 가이드 플랫폼 베베레시피! 초기/중기/후기/완료기 이유식 식단 정보와 솔직한 요리 후기를 제공합니다.",
      keywords: "이유식, 이유식 추천, 아기 이유식 추천, 이유식 레시피, 초기 이유식, 중기 이유식, 후기 이유식, 완료기 이유식, 아기 이유식 가이드, 베베레시피",
      url: BASE_URL
    };
  }, [currentTab, stageTab]);

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
          <span
            className={`navLink ${currentTab === "recipes" ? "navLinkActive" : ""}`}
            onClick={() => {
              setCurrentTab("recipes");
              setRecipeFilter("all");
              setSearchQuery("");
            }}
          >
            우리아기 이유식
          </span>
        </nav>
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
              const results = babyFoodRecipes.filter(recipe => {
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
              <h2 className="sectionTitle">
                {stageTab === "snack" ? "간식 레시피" : stageTab === "blw" ? "아이 주도 이유식 레시피" : "이유식 메뉴 & 레시피"}
              </h2>
              <p style={{ textAlign: "center", fontSize: "1.4rem", color: "#666666", marginTop: "1rem" }}>
                {stageTab === "snack"
                  ? "MammaYou 채널의 단계별 아기 간식 레시피 모음입니다."
                  : stageTab === "blw"
                  ? "아이 주도 이유식(BLW) 핑거푸드 레시피가 곧 업데이트될 예정입니다."
                  : "아기들이 가장 선호하고 부모님들이 자주 끓이는 필수 레시피 모음입니다."}
              </p>

              {/* 후기 탭에서만 밥/죽 서브탭을 표시합니다 */}
              {stageTab === "late" && (
                <div className="lateSubTabWrapper">
                  {["밥", "죽"].map(tab => (
                    <button
                      key={tab}
                      className={`lateSubTab ${lateTab === tab ? "lateSubTabActive" : ""}`}
                      onClick={() => setLateTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* 완료기 탭에서만 밥/국/반찬 서브탭을 표시합니다 */}
              {stageTab === "complete" && (
                <div className="completeSubTabWrapper">
                  {["밥", "국", "반찬"].map(tab => (
                    <button
                      key={tab}
                      className={`completeSubTab ${completeTab === tab ? "completeSubTabActive" : ""}`}
                      onClick={() => setCompleteTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              <div className="recipesGrid">
                {babyFoodRecipes && Array.isArray(babyFoodRecipes) && babyFoodRecipes
                  .filter(recipe => {
                    if (recipe?.stage !== stageTab) return false;
                    if (stageTab === "late") return getLateType(recipe) === lateTab;
                    if (stageTab === "complete") return getCompleteType(recipe) === completeTab;
                    return true;
                  })
                  .sort((a, b) => {
                    if (stageTab === "early") {
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
                    if (stageTab === "blw") {
                      return (BLW_FEED_ORDER[a.id] ?? 99) - (BLW_FEED_ORDER[b.id] ?? 99);
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

        {/* 이유식 레시피 라이브러리 탭 (recipes) */}
        {currentTab === "recipes" && (
          <div>
            <section className="recipesSection">
              {/* 헤더 + 생년월일 카드를 하나의 주황 배경으로 통합 */}
              <div className="babyDateCard">
                {/* 헤더 영역 */}
                <div className="recipeLibraryBannerInner">
                  <div className="recipeLibraryIconBadge">
                    <Utensils size={24} />
                  </div>
                  <h2 className="recipeLibraryTitle">이유식 레시피 라이브러리</h2>
                  <p className="recipeLibraryDesc">
                    다양한 재료를 조합하여 아기의 미각을 건강하게 일깨워 줄 수 있는 레시피들입니다.
                  </p>
                </div>

                {/* 장식용 플로팅 도트 패턴 — 카드 배경에 생동감을 줍니다 */}
                <div className="babyDateDecor">
                  <span className="decorDot decorDot1"></span>
                  <span className="decorDot decorDot2"></span>
                  <span className="decorDot decorDot3"></span>
                  <span className="decorDot decorDot4"></span>
                  <span className="decorDot decorDot5"></span>
                </div>

                {/* 콘텐츠 영역 — 연한 주황 배경으로 구분 */}
                <div className="babyDateContentBox">
                  <div className="babyDateCardInner">
                    {/* 왼쪽: 아이콘 + 텍스트 영역 */}
                    <div className="babyDateLeft">
                      {/* 아이콘 뱃지 — 원형 그라데이션 배경의 아이콘 */}
                      <div className="babyDateIconBadge">
                        <Baby size={28} />
                        <Sparkles size={14} className="babyDateSparkle" />
                      </div>
                      <div className="babyDateTextGroup">
                        <span className="babyDateTag">맞춤 추천</span>
                        <h3 className="babyDateTitle">아기 생년월일로<br />맞춤 레시피 찾기</h3>
                        <p className="babyDateDesc">생년월일을 입력하면 현재 이유식 단계에<br />맞는 레시피를 자동으로 보여드립니다.</p>
                      </div>
                    </div>

                    {/* 오른쪽: 입력 영역 */}
                    <div className="babyDateRight">
                      <div className="babyDateInputCard">
                        <div className="babyDateInputHeader">
                          <CalendarDays size={18} />
                          <span>아기 생년월일</span>
                        </div>
                        <input
                          type="date"
                          id="babyBirthInput"
                          className="babyDateInputField"
                          value={babyBirthDate}
                          onChange={(e) => setBabyBirthDate(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 결과 영역 — 생년월일 입력 후 표시 */}
                  {babyStageInfo && (
                    <div className="babyDateResult">
                      <div className="babyDateResultContent">
                        <div className="babyDateMonthBadge">
                          <span className="monthNumber">{babyStageInfo.months}</span>
                          <span className="monthUnit">개월</span>
                        </div>
                        <div className="babyDateResultText">
                          <p className="resultMainText">
                            현재 생후 <strong>{babyStageInfo.months}개월</strong>이에요.
                            {babyStageInfo.stageId !== "none" && babyStageInfo.stageId !== "graduation" && (
                              <> 권장 단계는 <strong className="resultStageHighlight">{babyStageInfo.stageName} 이유식</strong>입니다.</>)}
                            {(babyStageInfo.stageId === "none" || babyStageInfo.stageId === "graduation") && (
                              <strong className="resultStageHighlight"> {babyStageInfo.stageName}</strong>)}
                          </p>
                          <p className="resultSubText">{babyStageInfo.description}</p>
                        </div>
                      </div>
                      {babyStageInfo.stageId !== "none" && babyStageInfo.stageId !== "graduation" && (
                        <button
                          className="babyDateAllBtn"
                          onClick={() => setRecipeFilter("all")}
                        >
                          전체 보기
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 초기/중기/후기/완료기 시기일 때만 레시피 표시 */}
              {babyStageInfo && ["early", "middle", "late", "complete"].includes(babyStageInfo.stageId) ? (
                <>
                  {/* 초기 — 1단계/2단계 서브탭 */}
                  {babyStageInfo.stageId === "early" && (
                    <div className="recipeSubTabWrapper">
                      {[["early1", "초기 1단계"], ["early2", "초기 2단계"]].map(([id, label]) => (
                        <button
                          key={id}
                          className={`recipeSubTab ${recipeEarlySubTab === id ? "recipeSubTabActive" : ""}`}
                          onClick={() => setRecipeEarlySubTab(id)}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                  {/* 중기 — 중기 레시피/아이주도이유식/간식 서브탭 */}
                  {babyStageInfo.stageId === "middle" && (
                    <div className="recipeSubTabWrapper">
                      {[["middle", "중기 레시피"], ["blw", "아이주도이유식"], ["snack", "간식"]].map(([id, label]) => (
                        <button
                          key={id}
                          className={`recipeSubTab ${recipeMiddleSubTab === id ? "recipeSubTabActive" : ""}`}
                          onClick={() => setRecipeMiddleSubTab(id)}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                  {/* 후기 — 밥/죽/아이주도이유식/간식 서브탭 */}
                  {babyStageInfo.stageId === "late" && (
                    <div className="recipeSubTabWrapper">
                      {[["밥", "밥"], ["죽", "죽"], ["blw", "아이주도이유식"], ["snack", "간식"]].map(([id, label]) => (
                        <button
                          key={id}
                          className={`recipeSubTab ${recipeLateSubTab === id ? "recipeSubTabActive" : ""}`}
                          onClick={() => setRecipeLateSubTab(id)}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                  {/* 완료기 — 밥/국/반찬/아이주도이유식/간식 서브탭 */}
                  {babyStageInfo.stageId === "complete" && (
                    <div className="recipeSubTabWrapper">
                      {[["밥", "밥"], ["국", "국"], ["반찬", "반찬"], ["blw", "아이주도이유식"], ["snack", "간식"]].map(([id, label]) => (
                        <button
                          key={id}
                          className={`recipeSubTab ${recipeCompleteSubTab === id ? "recipeSubTabActive" : ""}`}
                          onClick={() => setRecipeCompleteSubTab(id)}
                        >{label}</button>
                      ))}
                    </div>
                  )}

                  <div className="recipesGrid">
                    {(() => {
                      // 현재 활성 서브탭 값
                      const activeSubTab =
                        babyStageInfo.stageId === "early" ? recipeEarlySubTab
                        : babyStageInfo.stageId === "middle" ? recipeMiddleSubTab
                        : babyStageInfo.stageId === "late" ? recipeLateSubTab
                        : recipeCompleteSubTab;

                      // BLW·간식은 stage가 달라 전체 레시피에서 직접 필터링합니다.
                      const isExtraTab = activeSubTab === "blw" || activeSubTab === "snack";
                      const baseList = isExtraTab
                        ? babyFoodRecipes.filter(r => {
                            if (r.stage !== activeSubTab) return false;
                            // 간식은 현재 시기에 맞는 subStage만 표시합니다.
                            if (activeSubTab === "snack") {
                              if (babyStageInfo.stageId === "middle") return r.subStage === "snack1";
                              if (babyStageInfo.stageId === "late") return r.subStage === "snack2";
                              if (babyStageInfo.stageId === "complete") return r.subStage !== "snack1" && r.subStage !== "snack2";
                            }
                            return true;
                          })
                        : getFilteredRecipes().filter(recipe => {
                            if (babyStageInfo.stageId === "early") return recipe.subStage === recipeEarlySubTab;
                            if (babyStageInfo.stageId === "middle") return recipe.stage === "middle";
                            if (babyStageInfo.stageId === "late") return getLateType(recipe) === recipeLateSubTab;
                            if (babyStageInfo.stageId === "complete") return getCompleteType(recipe) === recipeCompleteSubTab;
                            return true;
                          });

                      return baseList
                        .sort((a, b) => {
                          if (activeSubTab === "blw") return (BLW_FEED_ORDER[a.id] ?? 99) - (BLW_FEED_ORDER[b.id] ?? 99);
                          if (activeSubTab === "snack") return (SNACK_FEED_ORDER[a.id] ?? 99) - (SNACK_FEED_ORDER[b.id] ?? 99);
                          if (babyStageInfo.stageId === "early") {
                            const orderMap = recipeEarlySubTab === "early1" ? EARLY1_FEED_ORDER : EARLY2_FEED_ORDER;
                            return (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99);
                          }
                          if (babyStageInfo.stageId === "middle") return (MIDDLE_FEED_ORDER[a.id] ?? 99) - (MIDDLE_FEED_ORDER[b.id] ?? 99);
                          if (babyStageInfo.stageId === "late") return (LATE_FEED_ORDER[a.id] ?? 99) - (LATE_FEED_ORDER[b.id] ?? 99);
                          if (babyStageInfo.stageId === "complete") return (COMPLETE_FEED_ORDER[a.id] ?? 99) - (COMPLETE_FEED_ORDER[b.id] ?? 99);
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
                        ));
                    })()}
                  </div>
                </>
              ) : (
                <p style={{ textAlign: "center", fontSize: "1.5rem", color: "#aaaaaa", padding: "4rem 0" }}>
                  {!babyBirthDate
                    ? "아기 생년월일을 입력하면 맞춤 레시피를 보여드립니다."
                    : `${babyStageInfo?.stageName} 단계는 이유식 레시피가 제공되지 않습니다.`}
                </p>
              )}
            </section>
          </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
