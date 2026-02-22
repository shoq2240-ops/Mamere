import imageCompression from 'browser-image-compression';

const MAX_SIZE_PX = 2400;
const MAX_SIZE_MB = 4;
const OPTIONS = {
  maxWidthOrHeight: MAX_SIZE_PX,
  maxSizeMB: MAX_SIZE_MB,
  useWebWorker: true,
  fileType: undefined,
};

/**
 * 클라이언트에서 이미지 리사이즈(최대 2400px) + 압축 후 Blob 반환 (상세 페이지 고화질 표시용)
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function resizeAndCompressImage(file) {
  const out = await imageCompression(file, OPTIONS);
  return out;
}
