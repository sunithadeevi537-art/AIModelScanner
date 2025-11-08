
import React, { useState } from 'react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'hcl' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const CopyIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );
    
    const CheckIcon = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="bg-slate-800 rounded-lg relative font-mono text-sm">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900/50 rounded-t-lg">
                <span className="text-slate-400">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-xs transition-colors"
                >
                    {copied ? <CheckIcon/> : <CopyIcon/>}
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto">
                <code className="text-slate-200">{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
