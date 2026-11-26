import React from 'react';

const MirvoryLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 group cursor-pointer ${className}`}>
      {/* الجزء النصي */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          MIRVORY
        </span>
      </div>
    </div>
  );
};

export default MirvoryLogo;
