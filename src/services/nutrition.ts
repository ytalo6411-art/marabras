/**
 * Integração com fontes de dados nutricionais.
 *
 * Fontes:
 *  • USDA FoodData Central — composição nutricional oficial de alimentos
 *    frescos e processados. Plano gratuito: 1000 req/h com API key,
 *    30 req/h sem key. Sem key, usamos a busca por substantem.
 *  • Open Food Facts — produtos industrializados, código de barras, marca,
 *    ingredientes e tabela nutricional. Licença ODbL, sem cadastro.
 *  • Catálogo USDA SR28 local — consultas sem chave e sem rede.
 *
 * Regra do projeto: nunca inventar valores nutricionais. Todo item
 * carrega `source` e `sourceUrl` identificando a origem real. Se a API
 * falhar, o chamador deve oferecer busca alternativa ou cadastro manual.
 */

import { supabase } from '@/lib/supabase';
import type { FoodItem, SourceType } from '@/types/database';
import { foodToResult } from '@/services/mealPlanning';

const OPEN_FOOD_FACTS = import.meta.env.VITE_OPENFOODFACTS_BASE_URL || 'https://world.openfoodfacts.org';

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
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
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
    fiberG: row.fiber_g ?? null,
    sugarG: row.sugar_g ?? null,
    sodiumMg: row.sodium_mg ?? null,
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

export function fromOFF(product: OFFProduct): NutritionResult | null {
  const n=product.nutriments;
  if(product.nutrition_data_per && product.nutrition_data_per !== '100g') return null;
  if(!product.product_name || !n || !Number.isFinite(n['energy-kcal_100g']) || !Number.isFinite(n.proteins_100g) || !Number.isFinite(n.carbohydrates_100g) || !Number.isFinite(n.fat_100g)) return null;
  const grams=Number(product.serving_quantity)>0?Number(product.serving_quantity):100;
  const scaled=scaleToServing({calories:n['energy-kcal_100g']!,protein:n.proteins_100g!,carbs:n.carbohydrates_100g!,fat:n.fat_100g!},grams);
  const scale=(v:number|undefined,multiplier=1)=>typeof v==='number'&&Number.isFinite(v)?Math.round(v*grams/100*multiplier*100)/100:null;
  return {key:`off-${product.code ?? product.product_name}`,name:product.product_name,brand:product.brands?.split(',')[0]?.trim(),barcode:product.code,servingSizeG:grams,servingLabel:product.serving_size ?? `${grams} g`,...scaled,fiberG:scale(n.fiber_100g),sugarG:scale(n.sugars_100g),sodiumMg:scale(n.sodium_100g ?? (n.salt_100g!==undefined?n.salt_100g*400:undefined),1000),vitamins:{},minerals:{},source:'open_food_facts',sourceUrl:product.url ?? `https://world.openfoodfacts.org/product/${product.code}`,inDatabase:false};
}

/* ─────────────────────────────────────────────────────────────────────────────
   USDA FoodData Central
   ───────────────────────────────────────────────────────────────────────────── */


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

  // Verified ingredient matches work offline and do not depend on barcode access.
  const { searchReferenceFoods } = await import('@/data/foodCatalog');
  for (const food of searchReferenceFoods(query)) {
    if (!results.some(r => r.key.endsWith(food.id))) results.push(foodToResult(food) as NutritionResult);
  }
  if (results.length >= limit) return results.slice(0, limit);
  if (query.trim()) {
    const offResults = await searchOpenFoodFacts(query, limit-results.length);
    results.push(...offResults);
  }
  return results.slice(0,limit);

}

/** Busca exata por código de barras (Open Food Facts). */
export async function lookupByBarcode(barcode: string): Promise<NutritionResult[]> {
  const clean = barcode.replace(/\D/g, '');
  if (!clean) return [];

  try {
    const res = await fetch(
      `${OPEN_FOOD_FACTS}/api/v2/product/${clean}.json?fields=product_name,brands,serving_size,serving_quantity,nutriments,nutrition_data_per,code,url`,
      { headers: { 'User-Agent': 'ATHLETIX/2.0 (open-source training app)' }, signal: AbortSignal.timeout(8000) },
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

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': 'ATHLETIX/2.0 (open-source training app)' },
  });

  if (!res.ok) throw new Error(`Open Food Facts: HTTP ${res.status}`);

  const data = (await res.json()) as { products?: OFFProduct[] };
  return (data.products ?? [])
    .map(fromOFF)
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
      fiber_g: food.fiberG ?? null,
      sugar_g: food.sugarG ?? null,
      sodium_mg: food.sodiumMg ?? null,
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
/** Freeze the actual selected portion, all macros and provenance in one transaction. */
export async function recordMeal(diaryId:string, mealType:string, items:{food: NutritionResult;grams:number}[]) {
  if(items.some(i=>!Number.isFinite(i.grams)||i.grams<=0||i.grams>5000))throw new Error('Porção inválida.');
  const entries=await Promise.all(items.map(async({food,grams})=>{
    const id=await importFood(food);const factor=grams/food.servingSizeG;
    const scale=(value:number|null)=>value===null?0:value*factor;
    return {food_id:id,food_name:food.name,grams,calories:scale(food.calories),protein_g:scale(food.proteinG),carbs_g:scale(food.carbsG),fat_g:scale(food.fatG),source:food.source,metadata:{grams,sourceUrl:food.sourceUrl,servingSizeG:food.servingSizeG,fiberG:scale(food.fiberG),sugarG:scale(food.sugarG),sodiumMg:scale(food.sodiumMg),unknownNutrients:[food.fiberG===null&&'fiber',food.sugarG===null&&'sugar',food.sodiumMg===null&&'sodium'].filter(Boolean)}};
  }));
  const {data,error}=await supabase.rpc('add_meal_entries',{p_diary_id:diaryId,p_meal_type:mealType,p_entries:entries});
  if(error)throw error;return data;
}
