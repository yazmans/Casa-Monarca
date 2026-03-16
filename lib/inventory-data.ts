// Product interface
export interface Product {
  id: string;
  name: string;
  cost: number;
  gramsPerUnit: number;
  inventory: number;
  ambiente: number;
  refrigerado: number;
  congelado: number;
}

// Recipe interface
export interface Recipe {
  id: string;
  name: string;
  ingredient1: { name: string; percentage: number };
  ingredient2: { name: string; percentage: number };
}

// Size segmentation
export interface SizeSegment {
  name: string;
  percentage: number;
  proteinGrams: number;
  garnishGrams: number;
}

// Storage capacity
export interface StorageCapacity {
  ambiente: number;
  refrigerador: number;
  congelador: number;
}

// Constants
export const DEMAND_PERSONAS = 80;

export const SIZE_SEGMENTS: SizeSegment[] = [
  { name: "Pequeña", percentage: 15.0, proteinGrams: 100, garnishGrams: 525 },
  { name: "Mediana", percentage: 76.6, proteinGrams: 180, garnishGrams: 925 },
  { name: "Grande", percentage: 8.4, proteinGrams: 250, garnishGrams: 140 },
];

export const STORAGE_CAPACITY: StorageCapacity = {
  ambiente: 999999,
  refrigerador: 550,
  congelador: 750,
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Arroz", cost: 16.9, gramsPerUnit: 900, inventory: 100000, ambiente: 730, refrigerado: 730, congelado: 0 },
  { id: "2", name: "Pasta", cost: 11.1, gramsPerUnit: 200, inventory: 60000, ambiente: 730, refrigerado: 730, congelado: 0 },
  { id: "3", name: "Frijoles", cost: 26.5, gramsPerUnit: 908, inventory: 330000, ambiente: 365, refrigerado: 365, congelado: 0 },
  { id: "4", name: "Calabacita", cost: 29.9, gramsPerUnit: 1000, inventory: 0, ambiente: 4, refrigerado: 8, congelado: 240 },
  { id: "5", name: "Zanahoria", cost: 15.9, gramsPerUnit: 1000, inventory: 0, ambiente: 8, refrigerado: 25, congelado: 300 },
  { id: "6", name: "Jitomate", cost: 49.9, gramsPerUnit: 1000, inventory: 0, ambiente: 7, refrigerado: 14, congelado: 0 },
  { id: "7", name: "Papa", cost: 19.9, gramsPerUnit: 1000, inventory: 0, ambiente: 17, refrigerado: 7, congelado: 300 },
  { id: "8", name: "Atún", cost: 14.1, gramsPerUnit: 140, inventory: 7280, ambiente: 1095, refrigerado: 1095, congelado: 0 },
  { id: "9", name: "Pollo", cost: 94.0, gramsPerUnit: 1000, inventory: 0, ambiente: 0, refrigerado: 2, congelado: 180 },
  { id: "10", name: "Res", cost: 109.0, gramsPerUnit: 1000, inventory: 0, ambiente: 0, refrigerado: 2, congelado: 90 },
  { id: "11", name: "Mojarra", cost: 109.0, gramsPerUnit: 1000, inventory: 0, ambiente: 0, refrigerado: 2, congelado: 180 },
  { id: "12", name: "Huevo", cost: 50.0, gramsPerUnit: 1000, inventory: 0, ambiente: 15, refrigerado: 15, congelado: 0 },
  { id: "13", name: "Jamón", cost: 120.0, gramsPerUnit: 1000, inventory: 0, ambiente: 0, refrigerado: 10, congelado: 0 },
  { id: "14", name: "Avena", cost: 30.0, gramsPerUnit: 1000, inventory: 0, ambiente: 365, refrigerado: 365, congelado: 0 },
  { id: "15", name: "Leche", cost: 28.0, gramsPerUnit: 1000, inventory: 0, ambiente: 180, refrigerado: 180, congelado: 0 },
  { id: "16", name: "Bolillo", cost: 18.0, gramsPerUnit: 1000, inventory: 0, ambiente: 3, refrigerado: 7, congelado: 30 },
];

export const RECIPES: Recipe[] = [
  { id: "1", name: "Arroz con Calabacita", ingredient1: { name: "Arroz", percentage: 75 }, ingredient2: { name: "Calabacita", percentage: 25 } },
  { id: "2", name: "Papas con Zanahoria", ingredient1: { name: "Papa", percentage: 66.67 }, ingredient2: { name: "Zanahoria", percentage: 33.33 } },
  { id: "3", name: "Arroz con Jitomate", ingredient1: { name: "Arroz", percentage: 60 }, ingredient2: { name: "Jitomate", percentage: 40 } },
  { id: "4", name: "Pasta con Jitomate", ingredient1: { name: "Pasta", percentage: 33.33 }, ingredient2: { name: "Jitomate", percentage: 66.67 } },
  { id: "5", name: "Frijoles con Papa", ingredient1: { name: "Frijoles", percentage: 60 }, ingredient2: { name: "Papa", percentage: 40 } },
  { id: "6", name: "Pasta con Calabacita", ingredient1: { name: "Pasta", percentage: 33.33 }, ingredient2: { name: "Calabacita", percentage: 66.67 } },
  { id: "7", name: "Avena con Leche", ingredient1: { name: "Avena", percentage: 30 }, ingredient2: { name: "Leche", percentage: 70 } },
  { id: "8", name: "Bolillo con Frijol", ingredient1: { name: "Bolillo", percentage: 50 }, ingredient2: { name: "Frijoles", percentage: 50 } },
];

// Person counts by size
export interface PersonCounts {
  pequena: number;
  mediana: number;
  grande: number;
}

// Calculate total grams needed based on custom person counts
export function calculateTotalGramsNeededCustom(personCounts: PersonCounts): { proteinGrams: number; garnishGrams: number; totalPersons: number } {
  const pequenaSegment = SIZE_SEGMENTS.find(s => s.name === "Pequeña")!;
  const medianaSegment = SIZE_SEGMENTS.find(s => s.name === "Mediana")!;
  const grandeSegment = SIZE_SEGMENTS.find(s => s.name === "Grande")!;

  const totalProtein = 
    personCounts.pequena * pequenaSegment.proteinGrams +
    personCounts.mediana * medianaSegment.proteinGrams +
    personCounts.grande * grandeSegment.proteinGrams;

  const totalGarnish = 
    personCounts.pequena * pequenaSegment.garnishGrams +
    personCounts.mediana * medianaSegment.garnishGrams +
    personCounts.grande * grandeSegment.garnishGrams;

  const totalPersons = personCounts.pequena + personCounts.mediana + personCounts.grande;

  return { proteinGrams: totalProtein, garnishGrams: totalGarnish, totalPersons };
}

// Calculate total grams needed for all 80 people based on size segmentation (legacy)
export function calculateTotalGramsNeeded(): { proteinGrams: number; garnishGrams: number } {
  let totalProtein = 0;
  let totalGarnish = 0;

  SIZE_SEGMENTS.forEach((segment) => {
    const peopleInSegment = Math.round((DEMAND_PERSONAS * segment.percentage) / 100);
    totalProtein += peopleInSegment * segment.proteinGrams;
    totalGarnish += peopleInSegment * segment.garnishGrams;
  });

  return { proteinGrams: totalProtein, garnishGrams: totalGarnish };
}

// Calculate ingredient needs for a recipe with custom person counts
export function calculateRecipeNeedsCustom(
  recipe: Recipe,
  products: Product[],
  personCounts: PersonCounts
): {
  ingredient1: { name: string; gramsNeeded: number; unitsNeeded: number; cost: number; available: number };
  ingredient2: { name: string; gramsNeeded: number; unitsNeeded: number; cost: number; available: number };
  totalCost: number;
  totalGramsNeeded: number;
  totalPersons: number;
} {
  const { garnishGrams, totalPersons } = calculateTotalGramsNeededCustom(personCounts);
  const totalGramsNeeded = garnishGrams;

  const product1 = products.find((p) => p.name === recipe.ingredient1.name);
  const product2 = products.find((p) => p.name === recipe.ingredient2.name);

  const grams1 = (totalGramsNeeded * recipe.ingredient1.percentage) / 100;
  const grams2 = (totalGramsNeeded * recipe.ingredient2.percentage) / 100;

  const units1 = product1 ? Math.ceil(grams1 / product1.gramsPerUnit) : 0;
  const units2 = product2 ? Math.ceil(grams2 / product2.gramsPerUnit) : 0;

  const cost1 = product1 ? units1 * product1.cost : 0;
  const cost2 = product2 ? units2 * product2.cost : 0;

  return {
    ingredient1: {
      name: recipe.ingredient1.name,
      gramsNeeded: grams1,
      unitsNeeded: units1,
      cost: cost1,
      available: product1?.inventory || 0,
    },
    ingredient2: {
      name: recipe.ingredient2.name,
      gramsNeeded: grams2,
      unitsNeeded: units2,
      cost: cost2,
      available: product2?.inventory || 0,
    },
    totalCost: cost1 + cost2,
    totalGramsNeeded,
    totalPersons,
  };
}

// Calculate ingredient needs for a recipe (legacy)
export function calculateRecipeNeeds(
  recipe: Recipe,
  products: Product[]
): {
  ingredient1: { name: string; gramsNeeded: number; unitsNeeded: number; cost: number; available: number };
  ingredient2: { name: string; gramsNeeded: number; unitsNeeded: number; cost: number; available: number };
  totalCost: number;
  totalGramsNeeded: number;
} {
  const { garnishGrams } = calculateTotalGramsNeeded();
  const totalGramsNeeded = garnishGrams;

  const product1 = products.find((p) => p.name === recipe.ingredient1.name);
  const product2 = products.find((p) => p.name === recipe.ingredient2.name);

  const grams1 = (totalGramsNeeded * recipe.ingredient1.percentage) / 100;
  const grams2 = (totalGramsNeeded * recipe.ingredient2.percentage) / 100;

  const units1 = product1 ? Math.ceil(grams1 / product1.gramsPerUnit) : 0;
  const units2 = product2 ? Math.ceil(grams2 / product2.gramsPerUnit) : 0;

  const cost1 = product1 ? units1 * product1.cost : 0;
  const cost2 = product2 ? units2 * product2.cost : 0;

  return {
    ingredient1: {
      name: recipe.ingredient1.name,
      gramsNeeded: grams1,
      unitsNeeded: units1,
      cost: cost1,
      available: product1?.inventory || 0,
    },
    ingredient2: {
      name: recipe.ingredient2.name,
      gramsNeeded: grams2,
      unitsNeeded: units2,
      cost: cost2,
      available: product2?.inventory || 0,
    },
    totalCost: cost1 + cost2,
    totalGramsNeeded,
  };
}

// Calculate storage usage
export function calculateStorageUsage(products: Product[]): {
  ambiente: { used: number; capacity: number; percentage: number };
  refrigerador: { used: number; capacity: number; percentage: number };
  congelador: { used: number; capacity: number; percentage: number };
} {
  const ambienteUsed = products.reduce((sum, p) => sum + (p.ambiente > 0 ? p.inventory / 1000 : 0), 0);
  const refrigeradorUsed = products.reduce((sum, p) => sum + (p.refrigerado > 0 ? p.inventory / 1000 : 0), 0);
  const congeladorUsed = products.reduce((sum, p) => sum + (p.congelado > 0 ? p.inventory / 1000 : 0), 0);

  return {
    ambiente: {
      used: ambienteUsed,
      capacity: STORAGE_CAPACITY.ambiente,
      percentage: (ambienteUsed / STORAGE_CAPACITY.ambiente) * 100,
    },
    refrigerador: {
      used: refrigeradorUsed,
      capacity: STORAGE_CAPACITY.refrigerador,
      percentage: (refrigeradorUsed / STORAGE_CAPACITY.refrigerador) * 100,
    },
    congelador: {
      used: congeladorUsed,
      capacity: STORAGE_CAPACITY.congelador,
      percentage: (congeladorUsed / STORAGE_CAPACITY.congelador) * 100,
    },
  };
}
