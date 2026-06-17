import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// React 18의 새로운 Root API인 ReactDOM.createRoot를 사용하여 애플리케이션을 시작합니다.
// index.html 파일에 정의된 id가 'root'인 HTML 엘리먼트를 마운트 대상으로 지정합니다.
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode는 애플리케이션 내의 잠재적인 문제를 감지하기 위한 도구입니다.
  // 개발 모드에서 컴포넌트들을 이중으로 렌더링하여 부작용(Side Effect)이나 레거시 API 사용을 찾아낼 수 있도록 돕습니다.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
