#!/usr/bin/env node
/**
 * Script de seed do banco de alimentos.
 *
 * Fonte: USDA FoodData Central — dataset "Foundation" (alimentos genéricos).
 * Licença: USDA é domínio público (sem restrição de uso).
 *
 * Por que semear localmente:
 *  • a busca local é instantânea e não consome cota da API da USDA;
 *  • a USDA exige `api_key` e tem limite (DEMO_KEY: 30 req/h, 50/dia);
 *  • alimentos básicos (arroz, feijão, frango, ovos…) são exatamente os que
 *    o usuário digita todo dia.
 *
 * Os valores vem da API real — nada é inventado. O `source` de cada linha é
 * `usda` e o `source_url` aponta para a página do alimento na USDA.
 *
 * Uso:
 *   node scripts/seed-foods.mjs                    # gera supabase/seed/foods.json
 *   node scripts/seed-foods.mjs --api-key=CHAVE   # usa sua chave da USDA
 *   node scripts/seed-foods.mjs --from-file=arq.json
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY';

/**
 * Nutrientes da USDA (IDs estáveis da nutrient list oficial).
 * Usamos os IDs 1008 (energia kcal), 1003 (proteína), 1005 (carboidrato),
 * 1004 (gordura), 1079 (fibra), 2000 (açúcar), 1093 (sódio).
 */
const NUTRIENTS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
};

/** Micronutrientes de interesse (IDs da USDA). */
const MICRO = {
  'Vitamin A': 1106,
  'Vitamin C': 1162,
  'Vitamin D': 1114,
  'Vitamin K': 1185,
  Calcium: 1087,
  Iron: 1089,
  Magnesium: 1090,
  Phosphorus: 1091,
  Potassium: 1092,
  Zinc: 1095,
  Sodium: 1093,
  Folate: 1177,
  'Vitamin B12': 1178,
};

/**
 * Alimentos básicos que todo usuário brasileiro procura.
 * A busca é feita por nome em inglês porque é o idioma do dataset da USDA.
 */
const QUERIES = [
  'white rice, cooked',
  'brown rice, cooked',
  'chicken breast, roasted',
  'chicken thigh, roasted',
  'beef, ground, 85% lean',
  'ground beef',
  'salmon, Atlantic, farmed, cooked',
  'tuna, canned in water',
  'egg, whole, cooked',
  'milk, whole',
  'greek yogurt, plain',
  'cheddar cheese',
  'mozzarella cheese',
  'butter',
  'olive oil',
  'avocado, raw',
  'banana, raw',
  'apple, raw, with skin',
  'orange, raw',
  'mango, raw',
  'grape, red or green',
  'strawberry, raw',
  'blueberry, raw',
  'orange juice, not from concentrate',
  'sweet potato, cooked, baked',
  'potato, boiled, flesh and skin',
  'cassava, cooked',
  'oat, rolled, cooked',
  'bread, whole wheat',
  'white bread',
  'pasta, whole wheat, cooked',
  'spaghetti, cooked',
  'black beans, cooked',
  'kidney beans, cooked',
  'chickpea, cooked',
  'lentils, cooked',
  'quinoa, cooked',
  'broccoli, raw',
  'spinach, raw',
  'kale, raw',
  'lettuce, green leaf, raw',
  'tomato, red, ripe, raw',
  'cucumber, with peel, raw',
  'carrot, raw',
  'onion, raw',
  'bell pepper, red, raw',
  'broccoli, cooked, steamed',
  'spinach, cooked, boiled',
  'almond, raw',
  'walnut, dry',
  'cashew, dry',
  'peanut, all types, dry roasted',
  'peanut butter, smooth',
  'chia seeds, dried',
  'olive, black, pitted',
  'honey',
  'maple syrup',
  'dark chocolate, 70-85% cacao',
  'corn tortilla',
  'flour, white, all-purpose',
  'cornstarch',
  'soy sauce',
  'ketchup',
  'mayonnaise',
  'table salt',
  'sugar, granulated',
  'protein powder, whey based',
  'greek yogurt, low fat',
];

/** Extrai o valor de um nutriente pelo ID. */
function nutrientValue(food, id) {
  const list = food.foodNutrients ?? [];
  for (const n of list) {
    if (n.nutrientId === id) return n.value ?? null;
  }
  return null;
}

/** Converte o payload da USDA para o formato do banco local. */
function normalize(food) {
  const calories = nutrientValue(food, NUTRIENTS.calories);
  const protein = nutrientValue(food, NUTRIENTS.protein);
  const carbs = nutrientValue(food, NUTRIENTS.carbs);
  const fat = nutrientValue(food, NUTRIENTS.fat);

  // Sem energia ou sem macros não é um registro útil.
  if (calories === null || protein === null || carbs === null || fat === null) return null;

  const micronutrients = {};
  for (const [name, id] of Object.entries(MICRO)) {
    const v = nutrientValue(food, id);
    if (v !== null && v !== undefined) {
      micronutrients[name] = { amount: v, unit: id === NUTRIENTS.sodium ? 'mg' : 'mcg' };
    }
  }

  return {
    external_id: String(food.fdcId),
    source: 'usda',
    name: food.description ?? food.name ?? 'Alimento sem nome',
    brand: food.brandOwner || food.brandName || null,
    barcode: food.gtinUpc || null,
    serving_size_g: 100,
    serving_label: '100 g',
    calories: round(calories),
    protein_g: round(protein),
    carbs_g: round(carbs),
    fat_g: round(fat),
    fiber_g: round(nutrientValue(food, NUTRIENTS.fiber) ?? 0),
    sugar_g: round(nutrientValue(food, NUTRIENTS.sugar) ?? 0),
    sodium_mg: round(nutrientValue(food, NUTRIENTS.sodium) ?? 0),
    vitamins: pickUnits(micronutrients, ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K', 'Folate', 'Vitamin B12']),
    minerals: pickUnits(micronutrients, ['Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Zinc', 'Sodium']),
    source_url: food.fdcId ? `https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients` : 'https://fdc.nal.usda.gov/',
    is_custom: false,
  };
}

function pickUnits(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k]) out[k] = obj[k];
  return out;
}

function round(v) {
  return Math.round((Number(v) || 0) * 100) / 100;
}

async function search(query, apiKey) {
  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', '5');
  url.searchParams.set('dataType', 'Foundation,SR Legacy');
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`USDA search "${query}": HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.foods ?? [];
}

async function main() {
  const args = process.argv.slice(2);
  const fromFile = args.find((a) => a.startsWith('--from-file='));
  const keyArg = args.find((a) => a.startsWith('--api-key='));
  const apiKey = keyArg ? keyArg.split('=')[1] : USDA_API_KEY;

  let foods = [];

  if (fromFile) {
    // Modo offline: usa um payload já baixado.
    const path = fromFile.split('=')[1];
    foods = JSON.parse(await readFile(path, 'utf8'));
    console.log(`Carregado payload local: ${foods.length} alimentos.`);
  } else {
    console.log(`Buscando ${QUERIES.length} alimentos na USDA (key: ${apiKey === 'DEMO_KEY' ? 'DEMO_KEY' : 'pessoal'})…`);

    let ok = 0;
    let fail = 0;

    for (const q of QUERIES) {
      try {
        const results = await search(q, apiKey);
        // Fica com o primeiro resultado que tenha todos os macros.
        for (const r of results) {
          const n = normalize(r);
          if (n) {
            foods.push(n);
            ok++;
            break;
          }
        }
      } catch (err) {
        fail++;
        console.warn(`  ! ${q}: ${err.message}`);
      }
      // Respiro educado para não estourar o rate limit da DEMO_KEY.
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`Coletados: ${ok} alimentos (${fail} falhas).`);
  }

  // Deduplica por external_id.
  const seen = new Set();
  const unique = foods.filter((f) => {
    if (seen.has(f.external_id)) return false;
    seen.add(f.external_id);
    return true;
  });

  console.log(`Total após deduplicação: ${unique.length}.`);

  const outPath = resolve(ROOT, 'supabase/seed/foods.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(unique, null, 0), 'utf8');
  console.log(`Gravado em supabase/seed/foods.json.`);
}

main().catch((err) => {
  console.error('Falha:', err.message);
  process.exit(1);
});
