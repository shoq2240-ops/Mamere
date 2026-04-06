import React from 'react';
import toast from 'react-hot-toast';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this._toasted = false;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary] 렌더링 오류:', error, info);
    if (!this._toasted) {
      this._toasted = true;
      toast.error('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-white px-6">
          <div className="max-w-md w-full border border-[#EAEAEA] p-6 text-center">
            <p className="text-[11px] tracking-[0.12em] uppercase text-[#666666] mb-3">문제가 발생했습니다</p>
            <p className="text-sm text-[#333333] mb-6">일시적인 오류가 발생했습니다. 다시 시도해 주세요.</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full bg-[#000000] text-white py-3 text-[11px] tracking-[0.12em] uppercase hover:opacity-90 transition-opacity"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
