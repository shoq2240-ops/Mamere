import React from 'react';
import { Link } from 'react-router-dom';
import FAQ from '../components/FAQ';

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-28 pb-24 antialiased">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <Link
          to="/"
          className="inline-block text-[10px] font-light tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-10 transition-colors"
        >
          ← Dr.care
        </Link>
      </div>
      <FAQ title="FAQ" showTitle={true} className="pt-0 pb-4" />
      <div className="max-w-2xl mx-auto px-6 md:px-8 mt-6">
        <p className="text-[10px] font-light tracking-[0.1em] text-[#999999]">
          추가 문의: <a href="mailto:shox2240@gmail.com" className="text-[#666666] hover:text-[#000000] underline underline-offset-2 transition-colors">shox2240@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
