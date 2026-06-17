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
// 사전에 구축한 이유식 단계 정보 및 풍부한 레시피 데이터를 가져옵니다.
import { babyFoodStages, babyFoodRecipes } from "./data/babyFoodData";

// 애플리케이션의 전체 기능과 라우팅, 회원 관리를 수행하는 메인 App 컴포넌트입니다.
export default function App() {
  // --- 상태 관리 정의 ---
  // 현재 보고 있는 활성화된 탭/페이지를 관리합니다. (기본값: 'home', 'recipes', 'myPage')
  const [currentTab, setCurrentTab] = useState('home');

  // 로그인한 사용자 정보를 저장하는 상태입니다. (로컬스토리지 연동)
  const [currentUser, setCurrentUser] = useState(null);

  // 로그인/회원가입 모달의 활성화 여부 및 모달 모드('login' / 'register')를 제어합니다.
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // 회원가입 폼 입력을 처리하는 상태입니다.
  const [registerForm, setRegisterForm] = useState({
    username: '',
    babyName: '',
    babyBirth: '',
    password: ''
  });

  // 로그인 폼 입력을 처리하는 상태입니다.
  const [loginForm, setLoginForm] = useState({
    babyName: '',
    password: ''
  });

  // 메인 화면 및 레시피 화면에서 직접 아기 월령을 계산해보기 위한 계산기 입력값입니다.
  const [calcDate, setCalcDate] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  // 레시피 검색어 상태를 관리합니다.
  const [searchQuery, setSearchQuery] = useState('');

  // 레시피 목록 화면에서 선택된 이유식 단계 필터입니다. (기본값 'all')
  const [recipeFilter, setRecipeFilter] = useState('all');

  // 상세 요리 레시피를 띄워주기 위한 모달 활성화 및 타겟 레시피 상태입니다.
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // 초기/중기/후기 특징 안내 카드용 활성화 탭 상태입니다. (기본값 'early')
  const [stageTab, setStageTab] = useState('early');

  // --- 컴포넌트 생명주기 마운트 시 동작 ---
  // 컴포넌트가 마운트될 때, 기존 로컬스토리지에 로그인된 사용자가 있는지 검사하여 자동 로그인 처리합니다.
  useEffect(() => {
    const savedSession = localStorage.getItem('babyFoodUserSession');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
    }
  }, []);

  // --- 비즈니스 로직 함수 정의 ---

  // 아기의 생일 정보를 바탕으로 오늘 날짜 기준 정확한 생후 개월 수를 계산하는 함수입니다.
  // 이 계산값을 기준으로 아기에게 맞는 이유식 초기, 중기, 후기 단계를 판별합니다.
  const calculateMonths = (birthDateString) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();

    // 연도 차이와 월 차이를 합산하여 1차 개월 수를 구합니다.
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());

    // 생일 일자가 오늘 일자보다 지나지 않았다면 아직 만 개월이 차지 않은 것이므로 1개월 차감합니다.
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    // 계산된 결과가 음수이면 미래 날짜이므로 0을 반환합니다.
    return months < 0 ? 0 : months;
  };

  // 계산된 개월 수를 기준으로 적합한 이유식 단계 객체를 매칭하는 헬퍼 함수입니다.
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
        stageName: "초기 이유식",
        description: "부드럽고 묽은 미음으로 알레르기 반응을 확인하며 이유식을 시작하는 시기입니다."
      };
    } else if (months >= 7 && months <= 9) {
      return {
        stageId: "middle",
        stageName: "중기 이유식",
        description: "잇몸으로 음식 알갱이를 으깨 먹는 훈련을 하고, 철분 흡수를 위해 소고기 등 육류를 섭취하는 시기입니다."
      };
    } else if (months >= 10 && months <= 23) {
      return {
        stageId: "late",
        stageName: "후기 & 완료기 이유식",
        description: "진밥이나 무른 밥 형태로 아침/점심/저녁 하루 세 번 규칙적으로 다양한 음식을 먹는 시기입니다."
      };
    } else {
      return {
        stageId: "graduation",
        stageName: "이유식 완료 및 유아식 시기",
        description: "이유식 단계를 졸업하여 어른들과 비슷한 식사를 할 수 있는 유아식 단계입니다. 저염식 반찬을 추천합니다."
      };
    }
  };

  // 아기 생일을 계산기로 입력했을 때 결과를 판별해주는 핸들러 함수입니다.
  const handleCalculate = (e) => {
    e.preventDefault();
    if (!calcDate) {
      alert("아기 태어난 날을 선택해주세요.");
      return;
    }
    const months = calculateMonths(calcDate);
    const stageInfo = determineStage(months);
    setCalcResult({
      months,
      ...stageInfo
    });
  };

  // 회원가입 폼 서브밋 핸들러입니다.
  // 로컬스토리지의 'babyFoodUsers' 키에 신규 가입자 정보를 리스트로 누적 보관합니다.
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const { username, babyName, babyBirth, password } = registerForm;

    if (!username || !babyName || !babyBirth || !password) {
      alert("모든 정보를 정확하게 입력해 주세요.");
      return;
    }

    // 로컬스토리지에서 기존 가입자 목록을 불러옵니다.
    const existingUsers = JSON.parse(localStorage.getItem('babyFoodUsers') || '[]');

    // 이미 존재하는 아기 이름으로 가입을 시도하는지 확인하여 중복 가입을 방지합니다.
    const userExists = existingUsers.some(user => user.babyName === babyName);
    if (userExists) {
      alert("이미 가입된 아기 이름입니다. 다른 아기 이름을 입력해 주세요.");
      return;
    }

    // 신규 유저 데이터를 객체로 구성합니다.
    const newUser = {
      username,
      babyName,
      babyBirth,
      password,
      registeredAt: new Date().toISOString()
    };

    // 가입자 리스트에 추가 후 로컬스토리지에 영구 보관합니다.
    existingUsers.push(newUser);
    localStorage.setItem('babyFoodUsers', JSON.stringify(existingUsers));

    alert("회원가입이 완료되었습니다! 로그인 해주세요.");

    // 폼 초기화 및 로그인 모드로 탭 전환합니다.
    setRegisterForm({ username: '', babyName: '', babyBirth: '', password: '' });
    setAuthMode('login');
  };

  // 로그인 폼 서브밋 핸들러입니다.
  // 입력한 아기 이름과 비밀번호를 로컬스토리지를 조회하여 대조합니다.
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const { babyName, password } = loginForm;

    if (!babyName || !password) {
      alert("아기 이름과 비밀번호를 입력해 주세요.");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('babyFoodUsers') || '[]');
    const matchedUser = existingUsers.find(user => user.babyName === babyName && user.password === password);

    if (matchedUser) {
      // 로그인 세션 상태를 저장하고 모달을 닫습니다.
      setCurrentUser(matchedUser);
      localStorage.setItem('babyFoodUserSession', JSON.stringify(matchedUser));
      setShowAuthModal(false);
      setLoginForm({ babyName: '', password: '' });

      // 로그인 시 마이페이지 또는 메인 맞춤 정보로 편리하게 이동시킵니다.
      setCurrentTab('home');
      alert(`${matchedUser.username}님, 환영합니다! 아기(${matchedUser.babyName})의 맞춤 이유식을 추천해 드립니다.`);
    } else {
      alert("일치하는 회원 정보가 없습니다. 아기 이름과 비밀번호를 다시 확인해주세요.");
    }
  };

  // 로그아웃을 처리하는 함수입니다.
  // 세션 정보 상태를 비우고 로컬스토리지 키를 제거합니다.
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('babyFoodUserSession');
    setCurrentTab('home');
    alert("로그아웃 되었습니다.");
  };

  // 회원이 마이페이지에서 자신의 계정을 해지(회원탈퇴)할 수 있도록 처리하는 함수입니다.
  const handleWithdrawal = () => {
    if (!currentUser) return;
    if (confirm("정말로 탈퇴하시겠습니까? 등록된 모든 아기 정보와 계정이 영구 삭제됩니다.")) {
      const existingUsers = JSON.parse(localStorage.getItem('babyFoodUsers') || '[]');
      const filteredUsers = existingUsers.filter(user => user.babyName !== currentUser.babyName);

      localStorage.setItem('babyFoodUsers', JSON.stringify(filteredUsers));
      setCurrentUser(null);
      localStorage.removeItem('babyFoodUserSession');
      setCurrentTab('home');
      alert("탈퇴 처리가 정상 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
    }
  };

  // 검색 또는 필터 조건에 맞춰 레시피 목록을 동적으로 필터링하는 연산 함수입니다.
  const getFilteredRecipes = () => {
    return babyFoodRecipes.filter(recipe => {
      // 검색어 기반 필터링 (메뉴명 또는 설명, 재료 정보 검색 포함)
      const matchesSearch = searchQuery === '' ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

      // 단계 필터링 (all, early, middle, late)
      const matchesStage = recipeFilter === 'all' || recipe.stage === recipeFilter;

      return matchesSearch && matchesStage;
    });
  };

  // 로그인 상태에서 아기의 생일 정보를 바탕으로 현재 최적의 이유식 단계를 반환해 줍니다.
  const getBabyCurrentStage = () => {
    if (!currentUser) return null;
    const months = calculateMonths(currentUser.babyBirth);
    const stageDetails = determineStage(months);
    return {
      months,
      ...stageDetails
    };
  };

  const babyInfo = getBabyCurrentStage();

  // --- 화면 렌더링 코드 시작 ---
  return (
    <div className="appContainer">
      {/* 1. 상단 공통 네비게이션 헤더 */}
      <header className="appHeader" id="appHeader">
        {/* 로고에 h1 적용 — 페이지 내 유일한 h1, 시맨틱 마크업 기준 */}
        <h1 className="headerLogo" onClick={() => setCurrentTab('home')}>
          <Baby size={28} />
          <span>베베레시피</span>
        </h1>

        <nav className="headerNav">
          <span
            className={`navLink ${currentTab === 'home' ? 'navLinkActive' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            홈
          </span>
          <span
            className={`navLink ${currentTab === 'recipes' ? 'navLinkActive' : ''}`}
            onClick={() => {
              setCurrentTab('recipes');
              setRecipeFilter('all');
              setSearchQuery('');
            }}
          >
            이유식 레시피
          </span>
          {currentUser && (
            <span
              className={`navLink ${currentTab === 'myPage' ? 'navLinkActive' : ''}`}
              onClick={() => setCurrentTab('myPage')}
            >
              마이페이지
            </span>
          )}
        </nav>

        <div>
          {currentUser ? (
            <div className="headerUserInfo">
              <span className="headerUserText">
                <strong>{currentUser.babyName}</strong> 아기 방
              </span>
              <button className="headerLogoutBtn" onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                로그아웃
              </button>
            </div>
          ) : (
            <button
              className="headerAuthBtn"
              onClick={() => {
                setAuthMode('login');
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
        {currentTab === 'home' && (
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
                    if (e.key === 'Enter') {
                      setCurrentTab('recipes');
                      setRecipeFilter('all');
                    }
                  }}
                />
                <button
                  className="heroSearchBtn"
                  onClick={() => {
                    setCurrentTab('recipes');
                    setRecipeFilter('all');
                  }}
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* 맞춤형 대시보드 배너 (로그인 상태 시 노출) */}
            {currentUser && babyInfo && (
              <div className="calculatorSection">
                <div className="calculatorCard" style={{ borderColor: '#ffe5dd', backgroundColor: '#fffbfb' }}>
                  <div className="calcHeader">
                    <Baby className="calcIcon" size={24} style={{ color: '#ff8e72' }} />
                    <h2 className="calcTitle">{currentUser.babyName} 아기를 위한 맞춤 추천</h2>
                  </div>
                  <div className="calcDesc">
                    아기의 생년월일(<strong>{currentUser.babyBirth}</strong>) 기준 현재 생후 <strong>{babyInfo.months}개월</strong> 입니다.
                  </div>

                  <div className="calcResultBox" style={{ backgroundColor: '#ffffff', borderLeftColor: '#ff8e72' }}>
                    <div className="resultText">
                      현재 권장 단계는 <strong>[{babyInfo.stageName}]</strong> 입니다. <br />
                      <span style={{ fontSize: '1.4rem', color: '#666666', marginTop: '0.4rem', display: 'block' }}>
                        {babyInfo.description}
                      </span>
                    </div>
                    {babyInfo.stageId !== 'none' && babyInfo.stageId !== 'graduation' && (
                      <button
                        className="resultActionBtn"
                        onClick={() => {
                          setCurrentTab('recipes');
                          setRecipeFilter(babyInfo.stageId);
                        }}
                      >
                        {babyInfo.stageName} 레시피 전체보기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* 초기 중기 말기 이유식 기초 가이드 정보 */}
            <section className="stagesSection">
              <div className="stagesContainer">
                <h2 className="sectionTitle">이유식 단계별 핵심 정보 가이드</h2>

                <div className="stageTabWrapper">
                  {babyFoodStages.map(stage => (
                    <button
                      key={stage.id}
                      className={`stageTab ${stageTab === stage.id ? 'stageTabActive' : ''}`}
                      onClick={() => setStageTab(stage.id)}
                    >
                      {stage.title}
                    </button>
                  ))}
                </div>

                {/* 선택된 단계의 디테일 설명 정보 카드 */}
                {babyFoodStages.filter(s => s.id === stageTab).map(stage => (
                  <div className="stageDetailCard" key={stage.id}>
                    <div className="stageInfoLeft">
                      <span className="stageInfoPeriod">{stage.period}</span>
                      <h3 className="stageInfoTitle">{stage.title} 가이드</h3>
                      <p className="stageInfoDesc">{stage.description}</p>

                      <div className="stageSummaryGrid">
                        <div className="summaryItem">
                          <div className="summaryLabel">권장 섭취 횟수</div>
                          <div className="summaryVal">{stage.dailyCount}</div>
                        </div>
                        <div className="summaryItem">
                          <div className="summaryLabel">음식의 굳기/질감</div>
                          <div className="summaryVal">{stage.texture}</div>
                        </div>
                      </div>
                    </div>

                    <div className="stageInfoRight">
                      <h4 className="guideTitle">단계별 중요 영양 & 조리 수칙</h4>
                      <ul className="guideList">
                        {stage.guidelines.map((line, idx) => (
                          <li key={idx} className="guideItem">{line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 메인에도 초기 중기 말기의 추천 메뉴 정보와 레시피 배치 */}
            <section className="recipesSection">
              <h2 className="sectionTitle">추천 인기 이유식 메뉴 & 레시피</h2>
              <p style={{ textAlign: 'center', fontSize: '1.4rem', color: '#666666', marginTop: '1rem' }}>
                아기들이 가장 선호하고 부모님들이 자주 끓이는 필수 레시피 모음입니다.
              </p>

              <div className="recipesGrid">
                {babyFoodRecipes.slice(0, 6).map(recipe => (
                  <div
                    key={recipe.id}
                    className="recipeCard"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <span className={`recipeStageTag ${recipe.stage === 'early' ? 'tagEarly' :
                        recipe.stage === 'middle' ? 'tagMiddle' : 'tagLate'
                      }`}>
                      {recipe.stage === 'early' ? '초기' :
                        recipe.stage === 'middle' ? '중기' : '후기/완료기'}
                    </span>
                    <h3 className="recipeCardName">{recipe.name}</h3>
                    <p className="recipeCardDesc">{recipe.description}</p>
                    <div className="recipeCardFooter">
                      <span>재료: {recipe.ingredients.split(',')[0]}...</span>
                      <span>레시피 보기 <ChevronRight size={14} /></span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '3.6rem' }}>
                <button
                  className="resultActionBtn"
                  style={{ padding: '1.2rem 2.8rem', borderRadius: '2.5rem' }}
                  onClick={() => {
                    setCurrentTab('recipes');
                    setRecipeFilter('all');
                    window.scrollTo(0, 0);
                  }}
                >
                  더 많은 레시피 보러가기
                </button>
              </div>
            </section>
          </div>
        )}

        {/* 이유식 레시피 목록 및 검색 탭 (recipes) */}
        {currentTab === 'recipes' && (
          <div className="recipesSection">
            <h2 className="sectionTitle" style={{ marginBottom: '1rem' }}>이유식 레시피 라이브러리</h2>
            <p style={{ textAlign: 'center', fontSize: '1.4rem', color: '#666666', marginBottom: '3rem' }}>
              다양한 재료를 조합하여 아기의 미각을 건강하게 일깨워 줄 수 있는 레시피들입니다.
            </p>

            {/* 필터 검색 컨트롤 바 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
              <div className="stageTabWrapper">
                <button
                  className={`stageTab ${recipeFilter === 'all' ? 'stageTabActive' : ''}`}
                  onClick={() => setRecipeFilter('all')}
                  style={{ maxWidth: '12rem' }}
                >
                  전체보기
                </button>
                <button
                  className={`stageTab ${recipeFilter === 'early' ? 'stageTabActive' : ''}`}
                  onClick={() => setRecipeFilter('early')}
                  style={{ maxWidth: '12rem' }}
                >
                  초기
                </button>
                <button
                  className={`stageTab ${recipeFilter === 'middle' ? 'stageTabActive' : ''}`}
                  onClick={() => setRecipeFilter('middle')}
                  style={{ maxWidth: '12rem' }}
                >
                  중기
                </button>
                <button
                  className={`stageTab ${recipeFilter === 'late' ? 'stageTabActive' : ''}`}
                  onClick={() => setRecipeFilter('late')}
                  style={{ maxWidth: '12rem' }}
                >
                  후기/완료기
                </button>
              </div>

              <div className="heroSearchBox" style={{ margin: '0 auto', width: '100%', maxWidth: '60rem' }}>
                <input
                  type="text"
                  placeholder="메뉴명, 재료명으로 직접 검색해 보세요..."
                  className="heroSearchInput"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '1rem 0 0 1rem', border: '0.15rem solid #e0e0e0', borderRight: 'none' }}
                />
                <button
                  className="heroSearchBtn"
                  style={{ borderRadius: '0 1rem 1rem 0', backgroundColor: '#ff8e72' }}
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* 필터링된 레시피 그리드 렌더링 */}
            <div className="recipesGrid">
              {getFilteredRecipes().length > 0 ? (
                getFilteredRecipes().map(recipe => (
                  <div
                    key={recipe.id}
                    className="recipeCard"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <span className={`recipeStageTag ${recipe.stage === 'early' ? 'tagEarly' :
                        recipe.stage === 'middle' ? 'tagMiddle' : 'tagLate'
                      }`}>
                      {recipe.stage === 'early' ? '초기' :
                        recipe.stage === 'middle' ? '중기' : '후기/완료기'}
                    </span>
                    <h3 className="recipeCardName">{recipe.name}</h3>
                    <p className="recipeCardDesc">{recipe.description}</p>
                    <div className="recipeCardFooter">
                      <span style={{ fontSize: '1.25rem', color: '#666666' }}>
                        재료: {recipe.ingredients.length > 20 ? recipe.ingredients.slice(0, 20) + '...' : recipe.ingredients}
                      </span>
                      <span>조리법 보기 <ChevronRight size={14} /></span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 2rem', color: '#888888' }}>
                  <Info size={36} style={{ marginBottom: '1.2rem', color: '#ff8e72' }} />
                  <p>일치하는 레시피 정보가 없습니다. 다른 검색어를 입력해 보세요!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 마이페이지 정보 관리 탭 (myPage) */}
        {currentTab === 'myPage' && currentUser && (
          <section className="myPageSection">
            <div className="myPageCard">
              <div className="myPageHeader">
                <h2 className="myPageTitle">마이페이지 (회원 정보 관리)</h2>
                <button
                  className="headerLogoutBtn"
                  onClick={handleLogout}
                  style={{ color: '#d32f2f', borderColor: '#ffcdd2' }}
                >
                  로그아웃
                </button>
              </div>

              <div className="myPageGrid">
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">아이디 (아빠/엄마 이름)</span>
                  <span className="myPageInfoValue">{currentUser.username}</span>
                </div>
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">우리 아기 이름</span>
                  <span className="myPageInfoValue">{currentUser.babyName}</span>
                </div>
                <div className="myPageInfoItem">
                  <span className="myPageInfoLabel">아기 태어난 날</span>
                  <span className="myPageInfoValue">{currentUser.babyBirth}</span>
                </div>
                {babyInfo && (
                  <div className="myPageInfoItem" style={{ gridColumn: '1 / -1', backgroundColor: '#fffbfb', borderColor: '#ffe5dd' }}>
                    <span className="myPageInfoLabel" style={{ color: '#ff8e72', fontWeight: 600 }}>아기 성장에 따른 현재 단계 정보</span>
                    <span className="myPageInfoValue" style={{ fontSize: '1.8rem', marginTop: '0.4rem' }}>
                      생후 <span>{babyInfo.months}개월</span> · 권장 단계는 <span>{babyInfo.stageName}</span> 입니다.
                    </span>
                    <p style={{ fontSize: '1.35rem', color: '#666666', marginTop: '0.8rem', lineHeight: '1.5' }}>
                      {babyInfo.description}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '0.1rem solid #f0f0f0', paddingTop: '2.4rem' }}>
                <span
                  onClick={() => {
                    setCurrentTab('home');
                    window.scrollTo(0, 0);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '1.4rem', color: '#ff8e72', fontWeight: 600 }}
                >
                  <ChevronLeft size={16} />
                  추천 메인으로 돌아가기
                </span>

                <button
                  onClick={handleWithdrawal}
                  style={{ fontSize: '1.3rem', color: '#d32f2f', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  회원 탈퇴하기
                </button>
              </div>
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
        <div className="modalOverlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="modalCloseBtn" onClick={() => setSelectedRecipe(null)}>
              <X size={20} />
            </button>

            <div className="modalBody">
              <div className="modalHeader">
                <span className={`recipeStageTag ${selectedRecipe.stage === 'early' ? 'tagEarly' :
                    selectedRecipe.stage === 'middle' ? 'tagMiddle' : 'tagLate'
                  }`} style={{ alignSelf: 'flex-start' }}>
                  {selectedRecipe.stage === 'early' ? '초기 이유식' :
                    selectedRecipe.stage === 'middle' ? '중기 이유식' : '후기 & 완료기 이유식'}
                </span>
                <h2 className="modalTitle">{selectedRecipe.name}</h2>
                <p className="modalDesc">{selectedRecipe.description}</p>
              </div>

              {/* 필수 식재료 정보 */}
              <div className="ingredientsBox">
                <span className="ingredientsTitle">준비할 재료 (계량 가이드)</span>
                <p className="ingredientsList">{selectedRecipe.ingredients}</p>
              </div>

              {/* 단계별 상세 조리법 목록 */}
              <div className="instructionsBox">
                <h3 className="instructionsTitle">맛있게 끓이는 법</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="instructionStep">
                      <span className="stepNum">{idx + 1}</span>
                      <p className="stepText">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 식기 보관 및 조리용 미세 영양 팁 */}
              <div className="tipBox">
                <span className="tipTitle">
                  <Utensils size={18} />
                  Bebe 맘&대디를 위한 꿀팁!
                </span>
                <p className="tipText">{selectedRecipe.tips}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. 로그인 & 회원가입 팝업 모달 */}
      {showAuthModal && (
        <div className="modalOverlay" onClick={() => setShowAuthModal(false)}>
          <div className="authModalContent" onClick={(e) => e.stopPropagation()}>
            <button className="modalCloseBtn" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            {/* 로그인 화면 모드 */}
            {authMode === 'login' && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">로그인</h2>
                  <p className="authModalDesc">아기 이름을 활용해 간편하게 마이룸에 입장하세요.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="authForm">
                  <div className="authFormGroup">
                    <label htmlFor="loginBabyName">등록한 아기 이름</label>
                    <input
                      type="text"
                      id="loginBabyName"
                      className="authInput"
                      placeholder="예) 아롱이"
                      value={loginForm.babyName}
                      onChange={(e) => setLoginForm({ ...loginForm, babyName: e.target.value })}
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

                <p className="authSwitchText">
                  아직 회원이 아니신가요?
                  <span className="authSwitchLink" onClick={() => setAuthMode('register')}>
                    회원가입 하기
                  </span>
                </p>
              </div>
            )}

            {/* 회원가입 화면 모드 */}
            {authMode === 'register' && (
              <div className="authModalBody">
                <div className="authModalHeader">
                  <h2 className="authModalTitle">회원가입</h2>
                  <p className="authModalDesc">아기 정보를 입력하고 성장 맞춤 서비스를 시작해 보세요.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="authForm">
                  <div className="authFormGroup">
                    <label htmlFor="regUsername">부모 이름(엄마/아빠)</label>
                    <input
                      type="text"
                      id="regUsername"
                      className="authInput"
                      placeholder="가입자 성함을 입력하세요"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regBabyName">우리 아기 이름</label>
                    <input
                      type="text"
                      id="regBabyName"
                      className="authInput"
                      placeholder="예) 아롱이 (로그인 ID로 활용됩니다)"
                      value={registerForm.babyName}
                      onChange={(e) => setRegisterForm({ ...registerForm, babyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    {/* 데이트 피커로 태어난날 입력을 받습니다. */}
                    <label htmlFor="regBabyBirth">아기 태어난 날 (생일)</label>
                    <input
                      type="date"
                      id="regBabyBirth"
                      className="authInput"
                      value={registerForm.babyBirth}
                      onChange={(e) => setRegisterForm({ ...registerForm, babyBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="authFormGroup">
                    <label htmlFor="regPassword">비밀번호</label>
                    <input
                      type="password"
                      id="regPassword"
                      className="authInput"
                      placeholder="비밀번호 설정"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="authSubmitBtn">가입하고 추천 받기</button>
                </form>

                <p className="authSwitchText">
                  이미 가입한 회원이신가요?
                  <span className="authSwitchLink" onClick={() => setAuthMode('login')}>
                    로그인 하기
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
