/**
 * Integração com fontes de dados nutricionais.
 *
 * Fontes:
 *  • USDA FoodData Central — composição nutricional oficial de alimentos
 *    frescos e processados. Plano gratuito: 1000 req/h com API key,
 *    30 req/h sem key. Sem key, usamos a busca por substantem.
 *  • Open Food Facts — produtos industrializados, código de barras, marca,
 *    ingredientes e tabela nutricional. Licença ODbL, sem cadastro.
 *  • wger —gk exercises e tabela de nutrient templates.
 *
 * Regra do projeto: nunca inventar valores nutricionais. Todo item
 * carrega `source` e `sourceUrl` identificando a origem real. Se a API
 * falhar, o chamador deve oferecer busca alternativa ou cadastro manual.
 */

import { supabase } from '@/lib/supabase';
import type { FoodItem, SourceType } from '@/types/database';

const OPEN_FOOD_FACTS = import.meta.env.VITE_OPENFOODFACTS_BASE_URL || 'https://world.openfoodfacts.org';
const USDA = import.meta.env.VITE_USDA_BASE_URL || 'https://api.nal.usda.gov/fdc';

export interface NutritionResult {
  key: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSizeG: number;
  servingLabel?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  source: SourceType;
  sourceUrl?: string;
  inDatabase: boolean;
  id?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Utilidades
   ───────────────────────────────────────────────────────────────────────────── */

/** Converte 100 g para a porção informada. */
function scaleToServing(
  per100g: { calories: number; protein: number; carbs: number; fat: number },
  servingG: number,
) {
  const factor = servingG / 100;
  return {
    calories: Math.round(per100g.calories * factor * 10) / 10,
    proteinG: Math.round(per100g.protein * factor * 10) / 10,
    carbsG: Math.round(per100g.carbs * factor * 10) / 10,
    fatG: Math.round(per100g.fat * factor * 10) / 10,
  };
}

function fromDatabase(row: FoodItem): NutritionResult {
  return {
    key: row.id,
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    barcode: row.barcode ?? undefined,
    servingSizeG: row.serving_size_g,
    servingLabel: row.serving_label ?? undefined,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    sugarG: row.sugar_g,
    sodiumMg: row.sodium_mg,
    vitamins: (row.vitamins ?? {}) as Record<string, number>,
    minerals: (row.minerals ?? {}) as Record<string, number>,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    inDatabase: true,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Open Food Facts
   ───────────────────────────────────────────────────────────────────────────── */

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
  salt_100g?: number;
}

interface OFFProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OFFNutriments;
  nutrition_data_per?: string;
  ingredients_text?: string;
  url?: string;
}

function parseServingSize(product: OFFProduct): { grams: number; label?: string } {
  if (product.serving_quantity && product.serving_quantity > 0) {
    return {
      grams: product.serving_quantity,
      label: product.serving_size || `${product.serving_quantity} g`,
    };
  }
  return { grams: 100 };
}

function fromOFF(product: OFFProduct): NutritionResult | null {
  if (!product.product_name || !product.nutriments) return null;

  const n = product.nutriments;
  const serving = parseServingSize(product);

  // O Open Food Facts pode informar os valores por 100 g ou por porção.
  const per100g =
    product.nutrition_data_per === '100g' ||
    product.nutrition_data_per === '100 g' ||
    n['energy-kcal_100g'] !== undefined
      ? {
          calories: n['energy-kcal_100g'] ?? 0,
          protein: n.proteins_100g ?? 0,
          carbs: n.carbohydrates_100g ?? 0,
          fat: n.fat_100g ?? 0,
        }
      : {
          // Valores são por porção — converte para 100 g.
          calories: ((n['energy-kcal_100g'] ?? 0) / serving.grams) * 100,
          protein: ((n.proteins_100g ?? 0) / serving.grams) * 100,
          carbs: ((n.carbohydrates_100g ?? 0) / serving.grams) * 100,
          fat: ((n.fat_100g ?? 0) / serving.grams) * 100,
        };

  const scaled = scaleToServing(per100g, serving.grams);

  return {
    key: `off-${product.code ?? product.product_name}`,
    name: product.product_name,
    brand: product.brands?.split(',')[0]?.trim(),
    barcode: product.code,
    servingSizeG: serving.grams,
    servingLabel: serving.label,
    calories: scaled.calories,
    proteinG: scaled.proteinG,
    carbsG: scaled.carbsG,
    fatG: scaled.fatG,
    fiberG: Math.round((n.fiber_100g ?? 0) * 10) / 10,
    sugarG: Math.round((n.sugars_100g ?? 0) * 10) / 10,
    sodiumMg: Math.round((n.sodium_100g ?? n.salt_100g ?? 0) * 10) / 10,
    vitamins: {},
    minerals: {},
    source: 'open_food_facts',
    sourceUrl: product.url ?? `https://world.openfoodfacts.org/product/${product.code}`,
    inDatabase: false,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   USDA FoodData Central
   ───────────────────────────────────────────────────────────────────────────── */

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: USDAFoodNutrient[];
}

const USDA_NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003, // Protein
  carbs: 1005, // Carbohydrate
  fat: 1004, // Total lipid (fat)
  fiber: 1079, // Fiber, total dietary
  sugar: 2000, // Total Sugars
  sodium: 1093, // Sodium, Na
} as const;

function fromUSDA(food: USDAFood): NutritionResult | null {
  const nutrients = food.foodNutrients ?? [];
  if (nutrients.length === 0) return null;

  const get = (id: number): number => {
    const found = nutrients.find((n) => n.nutrientId === id);
    return found ? Math.round(found.value * 10) / 10 : 0;
  };

  const servingG = food.servingSize && food.servingSize > 0 ? food.servingSize : 100;

  // Os valores do USDA vêm por 100 g.
  const per100g = {
    calories: get(USDA_NUTRIENT_IDS.calories),
    protein: get(USDA_NUTRIENT_IDS.protein),
    carbs: get(USDA_NUTRIENT_IDS.carbs),
    fat: get(USDA_NUTRIENT_IDS.fat),
  };

  const scaled = scaleToServing(per100g, servingG);

  // Vitaminas e minerais: agrupa os nutrientes relevantes.
  const vitamins: Record<string, number> = {};
  const minerals: Record<string, number> = {};

  const VITAMIN_IDS: Record<string, number> = {
    'Vitamina A': 1106,
    'Vitamina C': 1162,
    'Vitamina D': 1114,
    'Vitamina E': 1109,
    'Vitamina K': 1185,
    'Vitamina B12': 1178,
  };
  const MINERAL_IDS: Record<string, number> = {
    Cálcio: 1087,
    Ferro: 1089,
    Magnésio: 1090,
    Potássio: 1092,
    Zinco: 1095,
    Fósforo: 1091,
  };

  for (const [label, id] of Object.entries(VITAMIN_IDS)) {
    const value = get(id);
    if (value > 0) vitamins[label] = value;
  }
  for (const [label, id] of Object.entries(MINERAL_IDS)) {
    const value = get(id);
    if (value > 0) minerals[label] = value;
  }

  return {
    key: `usda-${food.fdcId}`,
    name: food.description,
    brand: food.brandOwner,
    servingSizeG: servingG,
    servingLabel: `${servingG} g`,
    calories: scaled.calories,
    proteinG: scaled.proteinG,
    carbsG: scaled.carbsG,
    fatG: scaled.fatG,
    fiberG: Math.round((get(USDA_NUTRIENT_IDS.fiber) / 100) * servingG * 10) / 10,
    sugarG: Math.round((get(USDA_NUTRIENT_IDS.sugar) / 100) * servingG * 10) / 10,
    sodiumMg: Math.round((get(USDA_NUTRIENT_IDS.sodium) / 100) * servingG * 10) / 10,
    vitamins,
    minerals,
    source: 'usda',
    sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${food.fdcId}/nutrients`,
    inDatabase: false,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Busca unificada
   ───────────────────────────────────────────────────────────────────────────── */

export interface FoodSearchParams {
  query?: string;
  barcode?: string;
  limit?: number;
}

/**
 * Busca alimentos. Ordem:
 *  1. Banco local (itens customizados do usuário + itens já importados)
 *  2. Open Food Facts (produtos industrializados)
 *  3. USDA (alimentos frescos e básicos)
 */
export async function searchFoods(
  params: FoodSearchParams = {},
): Promise<NutritionResult[]> {
  const { query = '', barcode, limit = 20 } = params;

  // Código de barras: consulta direta e exata.
  if (barcode) {
    return lookupByBarcode(barcode);
  }

  const results: NutritionResult[] = [];

  // ── 1. Banco local ──────────────────────────────────────────────────────
  try {
    let q = supabase.from('food_database').select('*').eq('is_custom', false).limit(limit);

    if (query.trim()) {
      q = q.ilike('name', `%${query.trim()}%`);
    }

    const { data, error } = await q;
    if (!error && data) results.push(...data.map(fromDatabase));
  } catch {
    // Segue para as APIs externas.
  }

  if (results.length >= limit) return results.slice(0, limit);

  // ── 2. Open Food Facts ──────────────────────────────────────────────────
  if (query.trim()) {
    try {
      const offResults = await searchOpenFoodFacts(query, limit - results.length);
      results.push(...offResults);
    } catch {
      // API indisponível — segue para o USDA.
    }
  }

  // ── 3. USDA ─────────────────────────────────────────────────────────────
  if (results.length < limit && query.trim()) {
    try {
      const usdaResults = await searchUSDA(query, limit - results.length);
      results.push(...usdaResults);
    } catch {
      // Sem USDA também.
    }
  }

  return results.slice(0, limit);
}

/** Busca exata por código de barras (Open Food Facts). */
export async function lookupByBarcode(barcode: string): Promise<NutritionResult[]> {
  const clean = barcode.replace(/\D/g, '');
  if (!clean) return [];

  try {
    const res = await fetch(
      `${OPEN_FOOD_FACTS}/api/v2/product/${clean}.json?fields=product_name,brands,serving_size,serving_quantity,nutriments,nutrition_data_per,code,url`,
      { headers: { 'User-Agent': 'ATHLETIX/2.0 (open-source training app)' } },
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { status: number; product?: OFFProduct };
    if (data.status !== 1 || !data.product) return [];

    const result = fromOFF(data.product);
    return result ? [result] : [];
  } catch {
    return [];
  }
}

async function searchOpenFoodFacts(
  query: string,
  limit: number,
): Promise<NutritionResult[]> {
  const url = new URL(`${OPEN_FOOD_FACTS}/cgi/search.pl`);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', String(Math.min(limit, 20)));
  url.searchParams.set('fields', 'code,product_name,brands,serving_size,serving_quantity,nutriments,nutrition_data_per,url');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'ATHLETIX/2.0 (open-source training app)' },
  });

  if (!res.ok) throw new Error(`Open Food Facts: HTTP ${res.status}`);

  const data = (await res.json()) as { products?: OFFProduct[] };
  return (data.products ?? [])
    .map(fromOFF)
    .filter((r): r is NutritionResult => r !== null);
}

async function searchUSDA(query: string, limit: number): Promise<NutritionResult[]> {
  // A API key da USDA é opcional. Sem ela, usamos o endpoint de busca
  // por substantem (que funciona sem key, com limite menor).
  const apiKey = import.meta.env.VITE_USDA_API_KEY;

  const url = new URL(`${USDA}/fdc/v1/foods/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', String(Math.min(limit, 25)));
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Survey (FNDDS),Branded');
  if (apiKey) url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`USDA: HTTP ${res.status}`);

  const data = (await res.json()) as { foods?: USDAFood[] };
  return (data.foods ?? [])
    .map(fromUSDA)
    .filter((r): r is NutritionResult => r !== null);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Item personalizado
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Cadastra um alimento customizado do usuário.
 * Só o próprio usuário pode criar — garantido pela RLS.
 */
export async function createCustomFood(
  userId: string,
  food: {
    name: string;
    brand?: string;
    barcode?: string;
    servingSizeG: number;
    servingLabel?: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
    sugarG?: number;
    sodiumMg?: number;
  },
): Promise<FoodItem> {
  const { data, error } = await supabase
    .from('food_database')
    .insert({
      user_id: userId,
      is_custom: true,
      source: 'manual',
      name: food.name,
      brand: food.brand ?? null,
      barcode: food.barcode ?? null,
      serving_size_g: food.servingSizeG,
      serving_label: food.servingLabel ?? null,
      calories: food.calories,
      protein_g: food.proteinG,
      carbs_g: food.carbsG,
      fat_g: food.fatG,
      fiber_g: food.fiberG ?? 0,
      sugar_g: food.sugarG ?? 0,
      sodium_mg: food.sodiumMg ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Importa um alimento externo para o banco local, para que ele possa ser
 * vinculado a uma refeição.
 */
export async function importFood(result: NutritionResult): Promise<string | null> {
  if (result.id) return result.id;

  const { data, error } = await supabase
    .from('food_database')
    .upsert(
      {
        external_id: result.key,
        source: result.source,
        name: result.name,
        brand: result.brand ?? null,
        barcode: result.barcode ?? null,
        serving_size_g: result.servingSizeG,
        serving_label: result.servingLabel ?? null,
        calories: result.calories,
        protein_g: result.proteinG,
        carbs_g: result.carbsG,
        fat_g: result.fatG,
        fiber_g: result.fiberG,
        sugar_g: result.sugarG,
        sodium_mg: result.sodiumMg,
        vitamins: result.vitamins,
        minerals: result.minerals,
        source_url: result.sourceUrl ?? null,
        is_custom: false,
      },
      { onConflict: 'source,external_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}
