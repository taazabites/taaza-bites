import React, { useState } from 'react';
import { generateAiSearchResults } from '../services/geminiService';

interface AiSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AiSearch: React.FC<AiSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const response = await generateAiSearchResults(query);
            setResult(response);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }
    
    const renderResult = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/\n/g, '<br />');

        // Wrap consecutive list items in a ul
        html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>').replace(/<\/ul><br \/><ul>/g, '');
        return html;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[2000] flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-auto relative transform transition-transform duration-300 animate-scale-up flex flex-col h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                     <h2 className="text-xl font-bold font-iowan text-[var(--primary-dark)]">AI Assistant</h2>
                     <button onClick={onClose} className="text-2xl text-zinc-400 hover:text-zinc-600 w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors ripple-effect flex items-center justify-center">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow bg-zinc-50/50">
                    {!result && !isLoading && !error && (
                        <div className="text-center text-zinc-500 h-full flex flex-col justify-center items-center">
                            <i className="fas fa-robot text-4xl text-zinc-300 mb-4"></i>
                            <p className="font-semibold">Ask anything about our menu, plans, or services!</p>
                            <p className="text-sm text-zinc-400 mt-2">e.g., "What are the best keto options?"</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                           <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
                        </div>
                    )}
                    {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}
                    {result && <div className="prose prose-zinc max-w-none ai-results" dangerouslySetInnerHTML={{ __html: renderResult(result) }}></div>}
                </div>

                <form onSubmit={handleSearch} className="p-4 border-t border-zinc-200 bg-white flex gap-3 items-center flex-shrink-0 form-glow">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full px-4 py-3 bg-white rounded-lg border border-zinc-300 outline-none placeholder:text-zinc-400 transition-shadow"
                    />
                    <button type="submit" disabled={isLoading} className="bg-[var(--primary)] text-white font-bold py-3 px-5 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:bg-zinc-400 flex items-center justify-center flex-shrink-0 ripple-effect">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>

            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};