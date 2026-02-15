import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 경로 또는 쿼리 변경 시 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
    const main = document.getElementById('main-scroll');
    if (main) main.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;