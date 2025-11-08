// Fix: Provide full implementation for types.ts to define data structures for the application.

export enum ImageCategory {
    NETWORK_DIAGRAM = 'NETWORK_DIAGRAM',
    FRUIT = 'FRUIT',
    PULSES = 'PULSES', // Added for pulse classification
    INVOICE = 'INVOICE',
    OTHER = 'OTHER',
    UNKNOWN = 'UNKNOWN',
}

export enum GeneralCategory {
    LOGO = 'LOGO',
    GENERIC = 'GENERIC',
    CELEBRITY = 'CELEBRITY',
    COOKED_FOOD = 'COOKED_FOOD', // Added for cooked food sub-classification
    ELECTRONIC_ITEM = 'ELECTRONIC_ITEM',
    PLANT = 'PLANT',
    ANIMAL = 'ANIMAL',
    SCENE = 'SCENE',
    MANMADE_OBJECT = 'MANMADE_OBJECT',
}

export interface NetworkDevice {
    id: string;
    type: string;
    name: string;
    details: string;
    confidence?: string;
}

export interface NetworkConnection {
    from: string;
    to: string;
    protocol: string;
    confidence?: string;
}

export interface NetworkDiagramAnalysis {
    category: ImageCategory.NETWORK_DIAGRAM;
    summary: string;
    devices: NetworkDevice[];
    connections: NetworkConnection[];
    terraformCode: string;
}

export interface FruitAnalysis {
    category: ImageCategory.FRUIT;
    fruitName: string;
    description: string;
    calories: number;
    sugar: number;
    vitamins: string[];
    freshness: string;
    shelfLife: string;
    analysisDisclaimer: string;
    confidence?: string;
}

export interface PulseAnalysis {
    category: ImageCategory.PULSES;
    pulseName: string;
    description: string;
    identification: {
        type: string;
        variety: string;
        estimatedSizeWeight: string;
    };
    qualityPurityAssessment: {
        observedForeignMatter: string;
        defectsDamagePercentage: string;
        uniformityOfSize: string;
        estimatedMoistureLevel: string; // If visual cues allow
    };
    overallQualityAssessment: string;
    keyNutritionFactsPer100g: {
        estimatedProtein: string;
        estimatedFiber: string;
        estimatedCarbs: string;
        estimatedCalories: string;
        keyMineralsVitamins: string; // e.g., "Iron, Magnesium, Folate"
    };
    confidence?: string;
    analysisDisclaimer: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface InvoiceAnalysis {
    category: ImageCategory.INVOICE;
    vendorName: string;
    invoiceDate: string;
    totalAmount: number;
    taxAmount: number | null;
    lineItems: InvoiceLineItem[];
    currency: string;
    confidence?: string;
}

export interface LogoAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.LOGO;
    companyName: string;
    productName: string | null;
    description: string;
    industry: string;
    website: string | null;
    confidence?: string;
}

export interface CelebrityAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.CELEBRITY;
    name: string;
    knownFor: string;
    biography: string;
    notableWorks: string[];
    officialWebsite: string | null;
    confidence?: string;
}

export interface CookedFoodAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.COOKED_FOOD;
    dishName: string;
    estimatedIngredients: string[];
    nutritionEstimate: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    cookingProcess: string[];
    allergenAlert: string[];
    confidence?: string;
}

export interface ElectronicItemAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.ELECTRONIC_ITEM;
    itemName: string;
    brand: string | null;
    model: string | null;
    description: string;
    keyFeatures: string[];
    confidence?: string;
}

export interface PlantAnimalSceneObjectAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.PLANT | GeneralCategory.ANIMAL | GeneralCategory.SCENE | GeneralCategory.MANMADE_OBJECT;
    description: string;
    details: string[]; // e.g., species, environment, context
    tags: string[];
    confidence?: string;
}


export interface GenericAnalysis {
    category: ImageCategory.OTHER;
    subCategory: GeneralCategory.GENERIC;
    description: string;
    tags: string[];
    confidence?: string;
}

export type GeneralAnalysisData = LogoAnalysis | GenericAnalysis | CelebrityAnalysis | CookedFoodAnalysis | ElectronicItemAnalysis | PlantAnimalSceneObjectAnalysis;

export interface ErrorAnalysis {
    category: ImageCategory.UNKNOWN;
    error: string;
}

export type AnalysisResultData = NetworkDiagramAnalysis | FruitAnalysis | PulseAnalysis | InvoiceAnalysis | GeneralAnalysisData | ErrorAnalysis;