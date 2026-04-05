/**
 * 상품 이미지 업로드 전 처리
 *
 * 이전에는 최대 1200px + 0.5MB로 강제 리사이즈·압축했는데, 세로로 매우 긴 상세 컷(롱 스크롤)은
 * 긴 변이 1200에 맞춰지면서 가로가 수십 픽셀로 줄어들고, 상세 페이지에서 width 100%로 늘릴 때
 * 심하게 깨져 보였습니다.
 *
 * 관리자 화면의 파일 한도(MAX_IMAGE_SIZE_MB) 안이면 원본 바이트를 그대로 Storage에 올립니다.
 */
export async function resizeAndCompressImage(file) {
  return file;
}
