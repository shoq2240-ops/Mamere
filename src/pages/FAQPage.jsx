import React from 'react';
import { Link } from 'react-router-dom';
import FAQ from '../components/FAQ';

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 pt-28 text-[#000000] antialiased">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <Link
          to="/"
          className="mb-10 inline-block text-[10px] font-light uppercase tracking-[0.15em] text-[#666666] transition-colors hover:text-[#000000]"
        >
          ← home
        </Link>
      </div>
      <FAQ title="FAQ" showTitle className="pb-4 pt-0" />
      <div className="mx-auto mt-6 max-w-2xl px-6 md:px-8">
        <p className="text-[10px] font-light tracking-[0.1em] text-[#999999]">
          추가 문의:{' '}
          <a
            href="mailto:pjk6412@naver.com"
            className="text-[#666666] underline underline-offset-2 transition-colors hover:text-[#000000]"
          >
            pjk6412@naver.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
