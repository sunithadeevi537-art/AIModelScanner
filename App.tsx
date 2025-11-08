import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
// Fix: Correct import path to be relative
import AnalysisResult from './components/AnalysisResult';
// Fix: Correct import path to be relative
import * as geminiService from './services/geminiService';
// Fix: Correct import path to be relative
// FIX: Import `LogoAnalysis`, `GenericAnalysis`, and `CelebrityAnalysis` to be used for type casting.
import { AnalysisResultData, ImageCategory, GeneralCategory, LogoAnalysis, GenericAnalysis, CelebrityAnalysis, GeneralAnalysisData, CookedFoodAnalysis, ElectronicItemAnalysis, PlantAnimalSceneObjectAnalysis, PulseAnalysis } from './types';

const App: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageSelect = (base64Data: string, mimeType: string) => {
        setImage(base64Data);
        setImageMimeType(mimeType);
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyze = useCallback(async () => {
        if (!image || !imageMimeType) {
            setError("Please select an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const category = await geminiService.classifyImage(image, imageMimeType);

            let result: AnalysisResultData | null = null;
            switch (category) {
                case ImageCategory.NETWORK_DIAGRAM:
                    const networkData = await geminiService.analyzeNetworkDiagram(image, imageMimeType);
                    result = { category: ImageCategory.NETWORK_DIAGRAM, ...networkData };
                    break;
                case ImageCategory.FRUIT:
                    const fruitData = await geminiService.analyzeFruit(image, imageMimeType);
                    result = { category: ImageCategory.FRUIT, ...fruitData };
                    break;
                case ImageCategory.PULSES: // New case for PULSES
                    const pulseData = await geminiService.analyzePulses(image, imageMimeType);
                    result = { category: ImageCategory.PULSES, ...pulseData };
                    break;
                case ImageCategory.INVOICE:
                    const invoiceData = await geminiService.analyzeInvoice(image, imageMimeType);
                    result = { category: ImageCategory.INVOICE, ...invoiceData };
                    break;
                case ImageCategory.OTHER:
                    const generalData = await geminiService.analyzeGeneralImage(image, imageMimeType);
                    // Fix: Add a type assertion to guide TypeScript in correctly typing the result
                    // of spreading a discriminated union. The resulting object is one of the types
                    // within GeneralAnalysisData.
                    result = { category: ImageCategory.OTHER, ...generalData } as GeneralAnalysisData;
                    break;
                default:
                    result = { category: ImageCategory.UNKNOWN, error: 'Could not determine image category.' };
                    break;
            }
            setAnalysisResult(result);
        } catch (err) {
            console.error("Analysis failed:", err);
            if (err instanceof Error && err.message) {
                const errorMessage = err.message.toLowerCase();
                if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('resource exhausted')) {
                    setError("The API is currently busy due to high demand. Please try again in a few moments.");
                } else {
                    setError("An unexpected error occurred during analysis. If the problem persists, please check the console for more details.");
                }
            } else {
                 setError("An unknown error occurred during analysis.");
            }
            // Clear the image on error to force re-upload
            setImage(null);
            setImageMimeType(null);
        } finally {
            setIsLoading(false);
        }
    }, [image, imageMimeType]);

    const AnalyzeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.442V21.75a1.5 1.5 0 01-3 0v-3.308c0-.442.07-.874.208-1.288l.548-.547z" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <ImageInput onImageSelect={handleImageSelect} isProcessing={isLoading} />
                        {image && (
                            <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold mb-4 text-slate-300">Image Preview</h3>
                                <img src={`data:${imageMimeType};base64,${image}`} alt="Preview" className="rounded-md max-h-80 w-auto mx-auto"/>
                            </div>
                        )}
                        <button
                            onClick={handleAnalyze}
                            disabled={!image || isLoading}
                            className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg"
                        >
                            <AnalyzeIcon />
                            {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                    </div>

                    {/* Right Column */}
                    <div className="h-full">
                        <AnalysisResult result={analysisResult} isLoading={isLoading} error={error} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;