import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo-reduzida-preta.png" 
              alt="Jet buscaAI Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
              Busca<span className="text-brand-600">AI</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;