import React from 'react';

const MirvoryLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* الجزء البصري: يدمج بين حرف M وشكل الموشور أو البلورة الكيميائية */}
      <div className="relative flex items-center justify-center w-11 h-11">
        {/* شعار VO */}
        <img
          src="/vo-logo.png"
          alt="VO"
          className="absolute inset-0 w-full h-full rounded-xl object-cover rotate-6 group-hover:rotate-0 transition-all duration-500 ease-in-out"
        />
      </div>

      {/* الجزء النصي */}
      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-black tracking-tight text-slate-900">
          MIRVORY
        </span>
      </div>
    </div>
  );
};

export default MirvoryLogo;
