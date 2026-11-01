import { describe, expect, it } from 'vitest';
import { defaultNutritionPreferences, foodCompatible, mealTotals, MEAL_RECIPES, substituteIngredient, suggestMeals } from '@/services/mealPlanning';
import { REFERENCE_FOODS, searchReferenceFoods } from '@/data/foodCatalog';
import { fromOFF, recordMeal } from '@/services/nutrition';
import { restoreProgress, progressStorageKey, sessionExercises } from '@/services/workoutSession';
import { translate, writeLocale } from '@/i18n/runtime';
import { en } from '@/i18n/locales/en';
import { es } from '@/i18n/locales/es';
import { fr } from '@/i18n/locales/fr';
import { supabase } from '@/lib/supabase';
import { validateGeneratedProgram } from '@/services/planGenerator';
import { testCatalog, BASE_PROFILE } from './plan-generator.test';
import { generateProgram } from '@/services/planGenerator';

describe('nutrition without scanning', () => {
 it('filters canonical and free-text allergies and respects diet', () => {
  for (const id of ['milk','egg','gluten','fish','soy','nuts']) {
   const meals=suggestMeals({...defaultNutritionPreferences,allergies:[id]});
   expect(meals.length).toBeGreaterThan(0);
   expect(meals.every(m=>m.ingredients.every(i=>foodCompatible(REFERENCE_FOODS.find(f=>f.id===i.foodId)!,{...defaultNutritionPreferences,allergies:[id]})))).toBe(true);
  }
  expect(suggestMeals({...defaultNutritionPreferences,diet:'vegan',disliked:['banana','pão']}).every(m=>m.ingredients.every(i=>!['01132','01256','05064','15121','01012','09040','18075'].includes(i.foodId)))).toBe(true);
 });
 it('returns three main meals before extras and respects preparation time',()=>{
  const meals=suggestMeals({...defaultNutritionPreferences,meals:3,prepMinutes:15});
  expect(meals.map(m=>m.type)).toEqual(['breakfast','lunch','dinner']);
  expect(meals.every(m=>m.minutes<=15)).toBe(true);
  expect(suggestMeals({...defaultNutritionPreferences,available:['09040']})).toEqual([]);
 });
 it('searches ingredients in four languages and computes source-based totals',()=>{
  for(const q of ['banana','ovo','egg','huevo']) expect(searchReferenceFoods(q).length).toBeGreaterThan(0);
  const rice=REFERENCE_FOODS.find(f=>f.id==='20045')!;
  expect(rice.calories).toBe(130);
  const meal=MEAL_RECIPES.find(m=>m.id==='rice-lentils')!;
  expect(mealTotals(meal).calories).toBeCloseTo(meal.ingredients.reduce((n,i)=>n+REFERENCE_FOODS.find(f=>f.id===i.foodId)!.calories*i.grams/100,0));
  const swapped=substituteIngredient(MEAL_RECIPES[1]!,'01132','01012');
  expect(swapped?.ingredients[0]?.foodId).toBe('01012');
  expect(substituteIngredient(MEAL_RECIPES[0]!,'09040','05064')).toBeNull();
 });
 it('rejects ambiguous OFF serving units and scales verified per-100g values',()=>{
  const n={ 'energy-kcal_100g':100,proteins_100g:10,carbohydrates_100g:20,fat_100g:5,sodium_100g:.1 };
  expect(fromOFF({product_name:'Test',nutrition_data_per:'serving',nutriments:n})).toBeNull();
  const result=fromOFF({product_name:'Test',nutriments:n,serving_quantity:50});
  expect(result?.calories).toBe(50);expect(result?.sodiumMg).toBe(50);
  expect(fromOFF({product_name:'Missing',nutriments:{...n,proteins_100g:undefined}})).toBeNull();
 });
 it('freezes portions and provenance in a single RPC',async()=>{
  const rpc=vi.spyOn(supabase,'rpc').mockResolvedValue({data:[],error:null} as never);
  const food={key:'usda-sr28-20045',name:'Rice',servingSizeG:100,calories:130,proteinG:2.69,carbsG:28.17,fatG:.28,fiberG:.4,sugarG:null,sodiumMg:null,vitamins:{},minerals:{},source:'usda' as const,inDatabase:true,id:'food-id',sourceUrl:'https://example.invalid/source'};
  await recordMeal('diary','lunch',[{food,grams:158}]);
  expect(rpc).toHaveBeenCalledWith('add_meal_entries',expect.objectContaining({p_entries:[expect.objectContaining({grams:158,calories:205.4,metadata:expect.objectContaining({unknownNutrients:['sugar','sodium']})})]}));
  await expect(recordMeal('diary','lunch',[{food,grams:0}])).rejects.toThrow();
  rpc.mockRestore();
 });
});
describe('session state and locales',()=>{
 it('scopes local progress and clamps restored navigation',()=>{
  expect(progressStorageKey('a','s')).not.toBe(progressStorageKey('b','s'));
  expect(restoreProgress('bad',3).current).toBe(0);
  expect(restoreProgress('{"current":99}',3).current).toBe(2);
  expect(restoreProgress('{"restUntil":123,"paused":true,"remaining":40}',3)).toMatchObject({restUntil:123,paused:true,remaining:40});
  expect(sessionExercises([],[])).toEqual([]);
 });
 it('keeps dictionary keys and interpolated accessibility labels aligned',()=>{
  expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  writeLocale('en');expect(translate('Repetições da série 2')).toBe('Repetitions for set 2');
  writeLocale('es');expect(translate('Etapa 1 de 7')).toBe('Paso 1 de 7');
  writeLocale('fr');expect(translate('Registrar 118 g')).toBe('Enregistrer 118 g');
  writeLocale('pt-BR');expect(translate('Nutrição')).toBe('Nutrição');
 });
});
describe('AI cannot bypass the deterministic safety contract',()=>{
 it('rejects unavailable equipment, wrong difficulty, avoided movement and wrong frequency',()=>{
  const catalog=testCatalog();const program=generateProgram({profile:BASE_PROFILE,catalog,seed:'test'});
  expect(validateGeneratedProgram(program,catalog,BASE_PROFILE).ok).toBe(true);
  const changed=structuredClone(program);changed.days[0]!.exercises[0]!.exerciseId=catalog.find(e=>e.equipment.includes('barbell'))!.id;
  expect(validateGeneratedProgram(changed,catalog,BASE_PROFILE).ok).toBe(false);
  const avoided=structuredClone(program);const first=catalog.find(e=>e.id===avoided.days[0]!.exercises[0]!.exerciseId)!;
  expect(validateGeneratedProgram(avoided,catalog,{...BASE_PROFILE,avoidedExercises:[first.name]}).ok).toBe(false);
  expect(validateGeneratedProgram(program,catalog,{...BASE_PROFILE,sessionsPerWeek:4}).ok).toBe(false);
 });
});

describe('V10 additional regressions', () => {
 it('fits every generated day into the available time, including warm-up', () => {
  for (const minutes of [10,20,30,45,90]) for (const goal of ['strength','hypertrophy','endurance'] as const) {
   const profile={...BASE_PROFILE,minutesPerSession:minutes,goal};
   const program=generateProgram({profile,catalog:testCatalog(),seed:`time-${minutes}-${goal}`});
   expect(program.days.every(d=>d.estimatedMinutes<=minutes)).toBe(true);
   expect(validateGeneratedProgram(program,testCatalog(),profile).ok).toBe(true);
  }
 });
 it('rejects exaggerated duration claims and incompatible alternatives from AI', () => {
  const catalog=testCatalog();const program=generateProgram({profile:BASE_PROFILE,catalog});
  const changed=structuredClone(program);changed.days[0]!.estimatedMinutes=10;
  expect(validateGeneratedProgram(changed,catalog,BASE_PROFILE).ok).toBe(false);
  const alternative=structuredClone(program);alternative.days[0]!.exercises[0]!.alternatives=[{exerciseId:'ex-1',name:'Barbell Bench Press'}];
  expect(validateGeneratedProgram(alternative,catalog,BASE_PROFILE).ok).toBe(false);
 });
 it('returns a vegan snack and terminates when only one meal is compatible', () => {
  const meals=suggestMeals({...defaultNutritionPreferences,diet:'vegan'});
  expect(meals.some(m=>m.id==='banana-oats')).toBe(true);
  const restricted=suggestMeals({...defaultNutritionPreferences,diet:'vegan',disliked:['banana'],meals:6});
  expect(restricted.length).toBeGreaterThan(0);
  expect(restricted.every(m=>m.ingredients.every(i=>i.foodId!=='09040'))).toBe(true);
 });
 it('does not substitute an ingredient after preferences change', () => {
  const meal=MEAL_RECIPES.find(m=>m.id==='rice-chicken')!;
  const swapped=substituteIngredient(meal,'05064','15121')!;
  expect(foodCompatible(REFERENCE_FOODS.find(f=>f.id==='15121')!,{...defaultNutritionPreferences,allergies:['fish']})).toBe(false);
  expect(swapped.ingredients.find(i=>i.foodId==='15121')?.grams).toBe(86);
 });
});
