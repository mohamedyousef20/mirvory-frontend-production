import React from 'react';

const MirvoryLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* الجزء البصري: شعار VO الجديد (يحل محل حرف M فقط) */}
      <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mirvory-vo-logo.png"
          alt="Mirvory"
          width={44}
          height={44}
          className="w-11 h-11 rounded-xl object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
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
