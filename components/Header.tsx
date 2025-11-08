
import React from 'react';

const Header: React.FC = () => {
    const LogoIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.75 3.75 0 003.75 4.498h1.5A3.75 3.75 0 0016.5 12.25l-2.286-9.144a3.75 3.75 0 00-4.464 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 008.13-5.253M3.87 15.747A9.002 9.002 0 0012 21" />
        </svg>
    );

    return (
        <header className="bg-slate-900/70 backdrop-blur-lg p-4 border-b border-slate-700 sticky top-0 z-10">
            <div className="container mx-auto flex items-center gap-4">
                <LogoIcon />
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                    AI Multi-Modal Analyzer
                </h1>
            </div>
        </header>
    );
};

export default Header;
