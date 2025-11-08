
import React, { useState } from 'react';
import { AnalysisResultData, ImageCategory, GeneralCategory, NetworkDiagramAnalysis, FruitAnalysis, InvoiceAnalysis, LogoAnalysis, CelebrityAnalysis, GenericAnalysis, CookedFoodAnalysis, ElectronicItemAnalysis, PlantAnimalSceneObjectAnalysis, PulseAnalysis, ErrorAnalysis } from '../types';
import Spinner from './Spinner';
import CodeBlock from './CodeBlock';

interface AnalysisResultProps {
    result: AnalysisResultData | null;
    isLoading: boolean;
    error: string | null;
}

const ErrorView: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full bg-slate-800 p-6 rounded-lg border border-red-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-red-300 mt-4">Analysis Failed</h3>
        <p className="text-slate-400 text-center mt-2">{message}</p>
    </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, isLoading, error }) => {
    const [activeResultTab, setActiveResultTab] = useState('summary');

    const AnalyzeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.442V21.75a1.5 1.5 0 01-3 0v-3.308c0-.442.07-.874.208-1.288l.548-.547z" />
        </svg>
    );

    const CodeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 4l-4 4 4 4" />
        </svg>
    );

    const NetworkIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="6" x2="12" y2="18"></line>
            <line x1="6" y1="12" x2="18" y2="12"></line>
        </svg>
    );

    const FruitIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path>
            <path d="M12 18c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="M20 12h2"></path>
            <path d="M2 12h2"></path>
        </svg>
    );

    // New icon for Pulses (reusing Wheat)
    const PulsesIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22s1-2 5-2 5 2 5 2V4c0-2-1.5-3-3-3-1.5 0-3 1-3 3v16" />
            <path d="M15 5.5a3.5 3.5 0 1 1 3.5 3.5v10.5" />
            <path d="M18.5 9a3.5 3.5 0 1 1 3.5 3.5V22" />
        </svg>
    );

    const InvoiceIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
    );

    const GeneralIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    );

    if (isLoading) {
        return (
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-full flex flex-col justify-center items-center">
                <Spinner />
                <p className="mt-4 text-slate-400">Analyzing image, please wait...</p>
            </div>
        );
    }

    if (error) {
        return <ErrorView message={error} />;
    }

    if (!result) {
        return (
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-full flex flex-col justify-center items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.75 3.75 0 003.75 4.498h1.5A3.75 3.75 0 0016.5 12.25l-2.286-9.144a3.75 3.75 0 00-4.464 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 008.13-5.253M3.87 15.747A9.002 9.002 0 0012 21" />
                </svg>
                <h2 className="mt-4 text-xl font-semibold text-slate-300">Awaiting Analysis</h2>
                <p className="text-slate-500 mt-1">Upload an image and click "Analyze Image" to see the results here.</p>
            </div>
        );
    }

    const renderDetails = () => {
        if (!result) return null;

        switch (result.category) {
            case ImageCategory.NETWORK_DIAGRAM:
                const networkResult = result as NetworkDiagramAnalysis;
                return (
                    <>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                            <NetworkIcon /> Network Diagram Analysis
                        </h3>
                        <div className="prose mb-4">
                            <h4>Summary</h4>
                            <p>{networkResult.summary}</p>
                            {networkResult.devices && networkResult.devices.length > 0 && (
                                <>
                                    <h4>Devices</h4>
                                    <ul>
                                        {networkResult.devices.map((device, i) => (
                                            <li key={i}><strong>{device.name}</strong> ({device.type}, ID: {device.id}) - {device.details} (Confidence: {device.confidence || 'N/A'})</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {networkResult.connections && networkResult.connections.length > 0 && (
                                <>
                                    <h4>Connections</h4>
                                    <ul>
                                        {networkResult.connections.map((conn, i) => (
                                            <li key={i}>From {conn.from} to {conn.to} via {conn.protocol} (Confidence: {conn.confidence || 'N/A'})</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                        {activeResultTab === 'code' && networkResult.terraformCode && (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    <CodeIcon /> Terraform HCL Code
                                </h3>
                                <CodeBlock code={networkResult.terraformCode} language="hcl" />
                            </>
                        )}
                    </>
                );
            case ImageCategory.FRUIT:
                const fruitResult = result as FruitAnalysis;
                return (
                    <>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                            <FruitIcon /> Fruit Analysis
                        </h3>
                        <div className="prose">
                            <p className="mb-3 text-sky-400 font-medium">
                                Fruit Name: <span className="font-bold">{fruitResult.fruitName}</span>
                            </p>
                            <h4>Description</h4>
                            <p>{fruitResult.description}</p>
                            <h4>Nutritional Information (per 100g)</h4>
                            <ul>
                                <li>Calories: {fruitResult.calories} kcal</li>
                                <li>Sugar: {fruitResult.sugar} g</li>
                                <li>Vitamins: {fruitResult.vitamins?.join(', ')}</li>
                            </ul>
                            <h4>Freshness & Shelf Life</h4>
                            <ul>
                                <li>Freshness: {fruitResult.freshness}</li>
                                <li>Estimated Shelf Life: {fruitResult.shelfLife}</li>
                            </ul>
                            <p className="text-sm text-slate-500 mt-4">
                                <em>Disclaimer: {fruitResult.analysisDisclaimer}</em>
                            </p>
                            <p className="text-sm text-slate-500">
                                Confidence: {fruitResult.confidence || 'N/A'}
                            </p>
                        </div>
                    </>
                );
            case ImageCategory.PULSES: // New case for PULSES
                const pulseResult = result as PulseAnalysis;
                return (
                    <>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                            <PulsesIcon /> Pulse Analysis
                        </h3>
                        <div className="prose">
                            <p className="mb-3 text-sky-400 font-medium">
                                Pulse Name: <span className="font-bold">{pulseResult.pulseName}</span>
                            </p>
                            <h4>Description</h4>
                            <p>{pulseResult.description}</p>
                            <h4>Identification</h4>
                            <ul>
                                <li>Type: {pulseResult.identification.type}</li>
                                <li>Variety: {pulseResult.identification.variety}</li>
                                <li>Estimated Size/Weight: {pulseResult.identification.estimatedSizeWeight}</li>
                            </ul>
                            <h4>Quality & Purity Assessment</h4>
                            <ul>
                                <li>Observed Foreign Matter: {pulseResult.qualityPurityAssessment.observedForeignMatter}</li>
                                <li>Defects/Damage: {pulseResult.qualityPurityAssessment.defectsDamagePercentage}</li>
                                <li>Uniformity of Size: {pulseResult.qualityPurityAssessment.uniformityOfSize}</li>
                                <li>Estimated Moisture Level: {pulseResult.qualityPurityAssessment.estimatedMoistureLevel}</li>
                            </ul>
                            <h4>Overall Quality Assessment</h4>
                            <p>{pulseResult.overallQualityAssessment}</p>
                            <h4>Key Nutrition Facts (per 100g)</h4>
                            <ul>
                                <li>Protein: {pulseResult.keyNutritionFactsPer100g.estimatedProtein}</li>
                                <li>Fiber: {pulseResult.keyNutritionFactsPer100g.estimatedFiber}</li>
                                <li>Carbs: {pulseResult.keyNutritionFactsPer100g.estimatedCarbs}</li>
                                <li>Calories: {pulseResult.keyNutritionFactsPer100g.estimatedCalories}</li>
                                <li>Minerals/Vitamins: {pulseResult.keyNutritionFactsPer100g.keyMineralsVitamins}</li>
                            </ul>
                            <p className="text-sm text-slate-500 mt-4">
                                <em>Disclaimer: {pulseResult.analysisDisclaimer}</em>
                            </p>
                            <p className="text-sm text-slate-500">
                                Confidence: {pulseResult.confidence || 'N/A'}
                            </p>
                        </div>
                    </>
                );
            case ImageCategory.INVOICE:
                const invoiceResult = result as InvoiceAnalysis;
                return (
                    <>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                            <InvoiceIcon /> Invoice Analysis
                        </h3>
                        <div className="prose">
                            <p className="mb-3 text-sky-400 font-medium">
                                Vendor: <span className="font-bold">{invoiceResult.vendorName}</span>
                            </p>
                            <p>Invoice Date: {invoiceResult.invoiceDate}</p>
                            <p>Total Amount: {invoiceResult.totalAmount} {invoiceResult.currency}</p>
                            {invoiceResult.taxAmount !== null && <p>Tax Amount: {invoiceResult.taxAmount} {invoiceResult.currency}</p>}
                            {invoiceResult.lineItems && invoiceResult.lineItems.length > 0 && (
                                <>
                                    <h4>Line Items</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Qty</th>
                                                <th>Unit Price</th>
                                                <th>Total Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceResult.lineItems.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.description}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.unitPrice}</td>
                                                    <td>{item.totalPrice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                            <p className="text-sm text-slate-500 mt-4">
                                Confidence: {invoiceResult.confidence || 'N/A'}
                            </p>
                        </div>
                    </>
                );
            case ImageCategory.OTHER:
                // TypeScript's control flow analysis correctly narrows 'result' to 'GeneralAnalysisData' here.
                const generalResult = result; 
                let subCategoryIcon = <GeneralIcon />;
                let subCategoryTitle = 'General Image Analysis';

                switch (generalResult.subCategory) {
                    case GeneralCategory.LOGO:
                        subCategoryTitle = 'Logo Analysis';
                        subCategoryIcon = <NetworkIcon />; // Reusing NetworkIcon as a generic icon
                        const logoResult = generalResult as LogoAnalysis;
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{logoResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Company Name:</strong> {logoResult.companyName}</p>
                                    {logoResult.productName && <p><strong>Product Name:</strong> {logoResult.productName}</p>}
                                    <p><strong>Description:</strong> {logoResult.description}</p>
                                    <p><strong>Industry:</strong> {logoResult.industry}</p>
                                    {logoResult.website && <p><strong>Website:</strong> <a href={logoResult.website} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{logoResult.website}</a></p>}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {logoResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                    case GeneralCategory.CELEBRITY:
                        subCategoryTitle = 'Celebrity Analysis';
                        subCategoryIcon = <GeneralIcon />;
                        const celebrityResult = generalResult as CelebrityAnalysis;
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{celebrityResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Name:</strong> {celebrityResult.name}</p>
                                    <p><strong>Known For:</strong> {celebrityResult.knownFor}</p>
                                    <p><strong>Biography:</strong> {celebrityResult.biography}</p>
                                    {celebrityResult.notableWorks && celebrityResult.notableWorks.length > 0 && (
                                        <p><strong>Notable Works:</strong> {celebrityResult.notableWorks.join(', ')}</p>
                                    )}
                                    {celebrityResult.officialWebsite && <p><strong>Official Website:</strong> <a href={celebrityResult.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">{celebrityResult.officialWebsite}</a></p>}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {celebrityResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                    case GeneralCategory.COOKED_FOOD:
                        subCategoryTitle = 'Cooked Food Analysis';
                        subCategoryIcon = <FruitIcon />; // Reusing FruitIcon for food
                        const cookedFoodResult = generalResult as CookedFoodAnalysis;
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{cookedFoodResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Dish Name:</strong> {cookedFoodResult.dishName}</p>
                                    <p><strong>Estimated Ingredients:</strong> {cookedFoodResult.estimatedIngredients?.join(', ')}</p>
                                    <h4>Nutrition Estimate (per serving)</h4>
                                    <ul>
                                        <li>Calories: {cookedFoodResult.nutritionEstimate?.calories} kcal</li>
                                        <li>Protein: {cookedFoodResult.nutritionEstimate?.protein} g</li>
                                        <li>Carbs: {cookedFoodResult.nutritionEstimate?.carbs} g</li>
                                        <li>Fat: {cookedFoodResult.nutritionEstimate?.fat} g</li>
                                    </ul>
                                    <h4>Cooking Process</h4>
                                    <ol>
                                        {cookedFoodResult.cookingProcess?.map((step, i) => <li key={i}>{step}</li>)}
                                    </ol>
                                    {cookedFoodResult.allergenAlert && cookedFoodResult.allergenAlert.length > 0 && (
                                        <p className="text-red-400"><strong>Allergen Alert:</strong> {cookedFoodResult.allergenAlert.join(', ')}</p>
                                    )}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {cookedFoodResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                    case GeneralCategory.ELECTRONIC_ITEM:
                        subCategoryTitle = 'Electronic Item Analysis';
                        subCategoryIcon = <GeneralIcon />; // Default general icon
                        const electronicItemResult = generalResult as ElectronicItemAnalysis; // Specific cast for ElectronicItem
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{electronicItemResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Item Name:</strong> {electronicItemResult.itemName}</p>
                                    {electronicItemResult.brand && <p><strong>Brand:</strong> {electronicItemResult.brand}</p>}
                                    {electronicItemResult.model && <p><strong>Model:</strong> {electronicItemResult.model}</p>}
                                    <p><strong>Description:</strong> {electronicItemResult.description}</p>
                                    {electronicItemResult.keyFeatures && electronicItemResult.keyFeatures.length > 0 && (
                                        <><h4>Key Features</h4><ul>{electronicItemResult.keyFeatures.map((feature, i) => <li key={i}>{feature}</li>)}</ul></>
                                    )}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {electronicItemResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                    case GeneralCategory.PLANT:
                    case GeneralCategory.ANIMAL:
                    case GeneralCategory.SCENE:
                    case GeneralCategory.MANMADE_OBJECT:
                        subCategoryTitle = `${generalResult.subCategory.replace(/_/g, ' ')} Analysis`;
                        subCategoryIcon = <GeneralIcon />; // Default general icon
                        const plantAnimalSceneObjectResult = generalResult as PlantAnimalSceneObjectAnalysis; // Specific cast for PlantAnimalSceneObject
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{plantAnimalSceneObjectResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Description:</strong> {plantAnimalSceneObjectResult.description}</p>
                                    {plantAnimalSceneObjectResult.details && plantAnimalSceneObjectResult.details.length > 0 && (
                                        <><h4>Details</h4><ul>{plantAnimalSceneObjectResult.details.map((detail, i) => <li key={i}>{detail}</li>)}</ul></>
                                    )}
                                    {plantAnimalSceneObjectResult.tags && plantAnimalSceneObjectResult.tags.length > 0 && (
                                        <p><strong>Tags:</strong> {plantAnimalSceneObjectResult.tags.join(', ')}</p>
                                    )}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {plantAnimalSceneObjectResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                    case GeneralCategory.GENERIC:
                    default: // Catches GENERIC explicitly or any unhandled subCategory as generic fallback
                        subCategoryTitle = 'Generic Image Analysis';
                        subCategoryIcon = <GeneralIcon />;
                        const genericResult = generalResult as GenericAnalysis; // Specific cast for Generic
                        return (
                            <>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2 flex items-center">
                                    {subCategoryIcon} {subCategoryTitle}
                                </h3>
                                <p className="mb-3 text-sky-400 font-medium">
                                    Subject Category: <span className="font-bold">{genericResult.subCategory}</span>
                                </p>
                                <div className="prose">
                                    <p><strong>Description:</strong> {genericResult.description}</p>
                                    {genericResult.tags && genericResult.tags.length > 0 && (
                                        <p><strong>Tags:</strong> {genericResult.tags.join(', ')}</p>
                                    )}
                                    <p className="text-sm text-slate-500 mt-4">
                                        Confidence: {genericResult.confidence || 'N/A'}
                                    </p>
                                </div>
                            </>
                        );
                }
            case ImageCategory.UNKNOWN:
                const unknownResult = result as ErrorAnalysis;
                return <ErrorView message={unknownResult.error || "Unknown category analysis failed."} />;
        }
        return null;
    };


    const isNetworkDiagram = result?.category === ImageCategory.NETWORK_DIAGRAM;

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Analysis Results</h2>

            {isNetworkDiagram && (
                <div className="mb-4 flex p-1 bg-slate-900 rounded-lg">
                    <button
                        onClick={() => setActiveResultTab('summary')}
                        className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeResultTab === 'summary' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Summary
                    </button>
                    <button
                        onClick={() => setActiveResultTab('code')}
                        className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeResultTab === 'code' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Terraform HCL
                    </button>
                </div>
            )}
            
            <div className="prose text-slate-300">
                {renderDetails()}
            </div>

            {/* Always show raw JSON for debugging/transparency, unless it's a network diagram with a dedicated code tab */}
            {(!isNetworkDiagram || activeResultTab === 'summary') && result && (
                <>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-100">Raw JSON Output</h2>
                    <CodeBlock code={JSON.stringify(result, null, 2)} language="json" />
                </>
            )}
        </div>
    );
};

export default AnalysisResult;