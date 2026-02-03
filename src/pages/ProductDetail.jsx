import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="pt-40 pb-20 px-8 min-h-screen bg-black text-white text-center">
      <h1 className="text-4xl font-black italic uppercase">Product Detail</h1>
      <p className="mt-4 text-purple-500 font-mono uppercase tracking-widest">
        Archive Item ID: {id}
      </p>
      <div className="mt-12 text-neutral-500 text-sm italic">
        "상세 정보 및 고해상도 이미지는 곧 아카이브에 등록될 예정입니다."
      </div>
    </div>
  );
};

export default ProductDetail;