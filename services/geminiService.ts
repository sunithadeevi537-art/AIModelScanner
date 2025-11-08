// Fix: Provide full implementation for geminiService.ts to handle Gemini API calls.

import { GoogleGenAI, Type } from "@google/genai";
import { ImageCategory, NetworkDiagramAnalysis, FruitAnalysis, GeneralAnalysisData, GeneralCategory, LogoAnalysis, GenericAnalysis, InvoiceAnalysis, CelebrityAnalysis, PulseAnalysis, CookedFoodAnalysis, ElectronicItemAnalysis, PlantAnimalSceneObjectAnalysis } from '../types';

// Per guidelines, API key is from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-preview-09-2025'; // Using the specified model

function fileToGenerativePart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64,
            mimeType
        },
    };
}

export async function classifyImage(base64: string, mimeType: string): Promise<ImageCategory> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    // Updated prompt to include PULSES
    const prompt = `Analyze the image and classify it into one of the following categories: "NETWORK_DIAGRAM", "FRUIT", "PULSES", "INVOICE", or "OTHER". Respond with only the category name.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    const category = response.text.trim().toUpperCase();

    if (Object.values(ImageCategory).includes(category as ImageCategory)) {
        return category as ImageCategory;
    }
    
    return ImageCategory.OTHER;
}

export async function analyzeNetworkDiagram(base64: string, mimeType: string): Promise<Omit<NetworkDiagramAnalysis, 'category'>> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    const prompt = `Analyze this network diagram. Identify all devices, their connections, and provide a summary.
    For each device and connection, provide a confidence level ('High', 'Medium', 'Low') based on how clearly it is depicted in the diagram.
    Also, generate a basic Terraform HCL configuration for the identified infrastructure. The Terraform HCL code must be well-formatted with proper indentation and newlines to ensure readability.
    Respond in JSON format.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A brief overview of the network topology." },
            devices: {
                type: Type.ARRAY,
                description: "An array of objects, each with id, type, name, details, and confidence.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING },
                        name: { type: Type.STRING },
                        details: { type: Type.STRING },
                        confidence: { type: Type.STRING, description: "Confidence level (High, Medium, Low) for this detection." }
                    },
                    required: ['id', 'type', 'name', 'details']
                }
            },
            connections: {
                type: Type.ARRAY,
                description: "An array of objects, each specifying 'from' and 'to' using device ids, protocol, and confidence.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        from: { type: Type.STRING },
                        to: { type: Type.STRING },
                        protocol: { type: Type.STRING },
                        confidence: { type: Type.STRING, description: "Confidence level (High, Medium, Low) for this detection." }
                    },
                    required: ['from', 'to', 'protocol']
                }
            },
            terraformCode: { type: Type.STRING, description: "A string containing the well-formatted HCL code." }
        },
        required: ['summary', 'devices', 'connections', 'terraformCode']
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export async function analyzeFruit(base64: string, mimeType: string): Promise<Omit<FruitAnalysis, 'category'>> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    const prompt = `Act as an expert produce inspector. Analyze the fruit, vegetable, or pulse in the image. Provide its name, description, nutritional info (calories, sugar), and key vitamins. Assess its freshness and estimate its shelf life from a consumer and vendor perspective. Provide an overall confidence score ('High', 'Medium', 'Low') for this analysis based on the image quality and clarity. Finally, include a disclaimer stating that this analysis is based on a static 2D image.
    Respond in JSON format.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            fruitName: { type: Type.STRING, description: "The name of the fruit, vegetable, or pulse." },
            description: { type: Type.STRING, description: "A short description." },
            calories: { type: Type.NUMBER, description: "Estimated calories per 100g (as a number)." },
            sugar: { type: Type.NUMBER, description: "Estimated grams of sugar per 100g (as a number)." },
            vitamins: {
                type: Type.ARRAY,
                description: "An array of strings listing key vitamins.",
                items: { type: Type.STRING }
            },
            freshness: { type: Type.STRING, description: "An assessment of the item's freshness and ripeness." },
            shelfLife: { type: Type.STRING, description: "Estimated shelf life from a consumer and vendor perspective." },
            analysisDisclaimer: { type: Type.STRING, description: "A disclaimer about the analysis being based on a static image." },
            confidence: { type: Type.STRING, description: "Overall confidence in the analysis (High, Medium, Low)." }
        },
        required: ['fruitName', 'description', 'calories', 'sugar', 'vitamins', 'freshness', 'shelfLife', 'analysisDisclaimer']
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

// New function for Pulse Analysis
export async function analyzePulses(base64: string, mimeType: string): Promise<Omit<PulseAnalysis, 'category'>> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    const prompt = `Act as an expert agricultural analyst specializing in pulses. Analyze the pulse in the image.
    Provide its specific name, type, and variety.
    Generate a detailed identification, quality & purity assessment, overall quality assessment, and key nutrition facts (per 100g serving).
    For quality assessment, estimate foreign matter, defects/damage percentage, uniformity of size, and moisture level if visual cues allow.
    Provide an overall confidence score ('High', 'Medium', 'Low') for this analysis based on the image quality and clarity.
    Finally, include a disclaimer stating that this analysis is based on a static 2D image.
    Respond in JSON format according to the provided schema.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            pulseName: { type: Type.STRING, description: "The common name of the pulse (e.g., 'Red Lentil', 'Chickpea')." },
            description: { type: Type.STRING, description: "A brief descriptive summary of the pulse." },
            identification: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "General type (e.g., 'Lentil', 'Bean', 'Pea')." },
                    variety: { type: Type.STRING, description: "Specific variety (e.g., 'Masoor Dal', 'Kabuli Chickpea')." },
                    estimatedSizeWeight: { type: Type.STRING, description: "Estimated size range or weight per unit (e.g., '5-7mm', 'approx 0.3g per seed')." },
                },
                required: ['type', 'variety', 'estimatedSizeWeight'],
            },
            qualityPurityAssessment: {
                type: Type.OBJECT,
                properties: {
                    observedForeignMatter: { type: Type.STRING, description: "Description of any observed foreign matter (e.g., 'Minimal', 'Some chaff')." },
                    defectsDamagePercentage: { type: Type.STRING, description: "Estimated percentage of defects/damage (e.g., 'Less than 2%', 'Around 5%')." },
                    uniformityOfSize: { type: Type.STRING, description: "Assessment of size uniformity (e.g., 'Highly uniform', 'Moderately varied')." },
                    estimatedMoistureLevel: { type: Type.STRING, description: "Estimated moisture level if visual cues allow (e.g., 'Low', 'Medium')." },
                },
                required: ['observedForeignMatter', 'defectsDamagePercentage', 'uniformityOfSize', 'estimatedMoistureLevel'],
            },
            overallQualityAssessment: { type: Type.STRING, description: "An overall summary of the pulse's quality (e.g., 'Excellent quality, high purity', 'Good quality suitable for processing')." },
            keyNutritionFactsPer100g: {
                type: Type.OBJECT,
                properties: {
                    estimatedProtein: { type: Type.STRING, description: "Estimated protein per 100g (e.g., '24g')." },
                    estimatedFiber: { type: Type.STRING, description: "Estimated fiber per 100g (e.g., '16g')." },
                    estimatedCarbs: { type: Type.STRING, description: "Estimated carbohydrates per 100g (e.g., '60g')." },
                    estimatedCalories: { type: Type.STRING, description: "Estimated calories per 100g (e.g., '340 kcal')." },
                    keyMineralsVitamins: { type: Type.STRING, description: "Key minerals and vitamins (e.g., 'Iron, Magnesium, Folate')." },
                },
                required: ['estimatedProtein', 'estimatedFiber', 'estimatedCarbs', 'estimatedCalories', 'keyMineralsVitamins'],
            },
            confidence: { type: Type.STRING, description: "Overall confidence in the analysis (High, Medium, Low)." },
            analysisDisclaimer: { type: Type.STRING, description: "A disclaimer about the analysis being based on a static image." },
        },
        required: [
            'pulseName', 'description', 'identification', 'qualityPurityAssessment',
            'overallQualityAssessment', 'keyNutritionFactsPer100g', 'confidence', 'analysisDisclaimer'
        ],
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}


export async function analyzeInvoice(base64: string, mimeType: string): Promise<Omit<InvoiceAnalysis, 'category'>> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    const prompt = `Act as a meticulous data entry specialist. Analyze the invoice or bill in the image. Extract the vendor name, invoice date, total amount, and tax amount. Identify the currency and provide its ISO 4217 code (e.g., USD, EUR, INR). Identify all line items, including their description, quantity, unit price, and total price. Provide an overall confidence score ('High', 'Medium', 'Low') based on the clarity of the document. Respond in JSON format.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            vendorName: { type: Type.STRING },
            invoiceDate: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            taxAmount: { type: Type.NUMBER, nullable: true },
            currency: { type: Type.STRING, description: "The ISO 4217 currency code (e.g., USD, EUR, INR)." },
            lineItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unitPrice: { type: Type.NUMBER },
                        totalPrice: { type: Type.NUMBER },
                    },
                    required: ['description', 'quantity', 'unitPrice', 'totalPrice'],
                },
            },
            confidence: { type: Type.STRING, description: "Overall confidence in the extraction (High, Medium, Low)." }
        },
        required: ['vendorName', 'invoiceDate', 'totalAmount', 'currency', 'lineItems'],
    };
    
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function analyzeGeneralImage(base64: string, mimeType: string): Promise<Omit<GeneralAnalysisData, 'category'>> {
    const imagePart = fileToGenerativePart(base64, mimeType);
    
    // Step 1: Sub-classification
    // Updated prompt to include more GeneralCategory types
    const subClassifyPrompt = `Is the main subject of this image a known celebrity, a company or product logo, a cooked food dish, an electronic item, a plant, an animal, a general scene, or a manmade object? Respond with only "CELEBRITY", "LOGO", "COOKED_FOOD", "ELECTRONIC_ITEM", "PLANT", "ANIMAL", "SCENE", or "MANMADE_OBJECT".`;
    const subClassifyResponse = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, { text: subClassifyPrompt }] },
    });
    const subCategory = subClassifyResponse.text.trim().toUpperCase();

    switch (subCategory) {
        case GeneralCategory.LOGO:
            // Step 2a: Analyze as a Logo
            const logoPrompt = `Act as a brand recognition expert. Analyze the logo in the image. Identify the company and/or product it represents. Provide details about the company, its industry, and an official website if possible. Provide an overall confidence score ('High', 'Medium', 'Low') for this analysis. If you cannot identify the logo, provide your best guess but with a 'Low' confidence. Respond in JSON format.`;
            const logoSchema = {
                type: Type.OBJECT,
                properties: {
                    companyName: { type: Type.STRING },
                    productName: { type: Type.STRING, nullable: true },
                    description: { type: Type.STRING },
                    industry: { type: Type.STRING },
                    website: { type: Type.STRING, nullable: true },
                    confidence: { type: Type.STRING }
                },
                required: ['companyName', 'description', 'industry']
            };
            const logoResponse = await ai.models.generateContent({
                model: model,
                contents: { parts: [imagePart, { text: logoPrompt }] },
                config: { responseMimeType: "application/json", responseSchema: logoSchema }
            });
            const logoParsed = JSON.parse(logoResponse.text.trim());
            return { subCategory: GeneralCategory.LOGO, ...logoParsed } as Omit<LogoAnalysis, 'category'>;

        case GeneralCategory.CELEBRITY:
            // Step 2b: Analyze as a Celebrity
            const celebrityPrompt = `Act as a pop culture and biography expert. Analyze the image of the celebrity. Identify them and provide their name, what they are known for (e.g., profession), a brief biography, a list of a few notable works (movies, songs, achievements), and an official website if one exists. Provide an overall confidence score ('High', 'Medium', 'Low'). If you cannot identify the person with high confidence, state that clearly and provide your best guess with a 'Low' confidence. Respond in JSON format.`;
            const celebritySchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    knownFor: { type: Type.STRING, description: "Profession(s) or what the person is known for." },
                    biography: { type: Type.STRING },
                    notableWorks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    officialWebsite: { type: Type.STRING, nullable: true },
                    confidence: { type: Type.STRING }
                },
                required: ['name', 'knownFor', 'biography', 'notableWorks']
            };
            const celebrityResponse = await ai.models.generateContent({
                model: model,
                contents: { parts: [imagePart, { text: celebrityPrompt }] },
                config: { responseMimeType: "application/json", responseSchema: celebritySchema }
            });
            const celebrityParsed = JSON.parse(celebrityResponse.text.trim());
            return { subCategory: GeneralCategory.CELEBRITY, ...celebrityParsed } as Omit<CelebrityAnalysis, 'category'>;

        case GeneralCategory.COOKED_FOOD:
            const cookedFoodPrompt = `Act as a culinary expert. Analyze the cooked food dish in the image. Identify the dish name, estimated main ingredients, a nutrition estimate (calories, protein, carbs, fat per typical serving), a simple cooking process/recipe (step-by-step), and alert for common allergens if visible or typically present. Provide an overall confidence score ('High', 'Medium', 'Low'). Respond in JSON format.`;
            const cookedFoodSchema = {
                type: Type.OBJECT,
                properties: {
                    dishName: { type: Type.STRING },
                    estimatedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    nutritionEstimate: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.NUMBER },
                            protein: { type: Type.NUMBER },
                            carbs: { type: Type.NUMBER },
                            fat: { type: Type.NUMBER }
                        },
                        required: ['calories', 'protein', 'carbs', 'fat']
                    },
                    cookingProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
                    allergenAlert: { type: Type.ARRAY, items: { type: Type.STRING } },
                    confidence: { type: Type.STRING }
                },
                required: ['dishName', 'estimatedIngredients', 'nutritionEstimate', 'cookingProcess']
            };
            const cookedFoodResponse = await ai.models.generateContent({
                model: model,
                contents: { parts: [imagePart, { text: cookedFoodPrompt }] },
                config: { responseMimeType: "application/json", responseSchema: cookedFoodSchema }
            });
            const cookedFoodParsed = JSON.parse(cookedFoodResponse.text.trim());
            return { subCategory: GeneralCategory.COOKED_FOOD, ...cookedFoodParsed } as Omit<CookedFoodAnalysis, 'category'>;

        case GeneralCategory.ELECTRONIC_ITEM:
        case GeneralCategory.PLANT:
        case GeneralCategory.ANIMAL:
        case GeneralCategory.SCENE:
        case GeneralCategory.MANMADE_OBJECT:
        default: // Fallback to generic if subCategory not explicitly handled or recognized
            const genericPrompt = `Describe the image in detail. Provide a general description and a few relevant tags. Provide an overall confidence score ('High', 'Medium', 'Low') for your description based on the clarity of the image. Respond in JSON format.`;
            const genericSchema = {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    details: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }, // Added for more specific generic details
                    confidence: { type: Type.STRING }
                },
                required: ['description', 'tags']
            };
            const genericResponse = await ai.models.generateContent({
                model: model,
                contents: { parts: [imagePart, { text: genericPrompt }] },
                config: { responseMimeType: "application/json", responseSchema: genericSchema }
            });
            const genericParsed = JSON.parse(genericResponse.text.trim());
            // This is a bit tricky due to discriminated unions; ensure it matches one of the general types
            const finalSubCategory = subCategory === 'ELECTRONIC_ITEM' ? GeneralCategory.ELECTRONIC_ITEM :
                                     subCategory === 'PLANT' ? GeneralCategory.PLANT :
                                     subCategory === 'ANIMAL' ? GeneralCategory.ANIMAL :
                                     subCategory === 'SCENE' ? GeneralCategory.SCENE :
                                     subCategory === 'MANMADE_OBJECT' ? GeneralCategory.MANMADE_OBJECT :
                                     GeneralCategory.GENERIC;
            return { subCategory: finalSubCategory, ...genericParsed } as Omit<PlantAnimalSceneObjectAnalysis, 'category'>;
    }
}