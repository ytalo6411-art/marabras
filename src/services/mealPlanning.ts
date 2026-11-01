import { z } from 'zod';
import { REFERENCE_FOODS, normalizeFood, foodSourceUrl, type ReferenceFood } from '@/data/foodCatalog';
export const nutritionPreferencesSchema=z.object({diet:z.enum(['omnivore','vegetarian','vegan','pescatarian']),meals:z.number().int().min(3).max(6),budget:z.enum(['low','medium','flexible']),prepMinutes:z.number().int().min(5).max(90),allergies:z.array(z.string()).max(15),disliked:z.array(z.string()).max(15),available:z.array(z.string()).max(30),minor:z.boolean()});
export type NutritionPreferences=z.infer<typeof nutritionPreferencesSchema>;
export const defaultNutritionPreferences:NutritionPreferences={diet:'omnivore',meals:4,budget:'medium',prepMinutes:20,allergies:[],disliked:[],available:[],minor:false};
export interface MealIngredient { foodId:string; name:string; grams:number; household:string; substituteIds:string[]; }
export interface SuggestedMeal { id:string; name:string; type:'breakfast'|'lunch'|'dinner'|'snack'; image:string; credit:string; minutes:number; ingredients:MealIngredient[]; instructions:string; }
const ingredient=(foodId:string,grams:number,household:string,substituteIds:string[]=[]):MealIngredient=>({foodId,grams,household,name:REFERENCE_FOODS.find(f=>f.id===foodId)!.name,substituteIds});
const photo=(file:string,credit:string)=>({image:`/images/food/${file}.jpg`,credit});
export const MEAL_RECIPES:SuggestedMeal[]=[
{id:'oats',name:'Aveia com banana',type:'breakfast',...photo('oats','Ilustração: Pexels / foto 4725737'),minutes:10,ingredients:[ingredient('08121',234,'1 xícara de aveia cozida',['08120']),ingredient('09040',118,'1 banana média')],instructions:'Cozinhe a aveia em água até cremosa. Fatie a banana por cima. Se usar flocos crus, siga o preparo da embalagem.'},
{id:'eggs',name:'Ovos, pão e brócolis',type:'breakfast',...photo('omelette','Ilustração: Pexels / foto 10934498'),minutes:15,ingredients:[ingredient('01132',122,'2 ovos grandes preparados',['01012']),ingredient('18075',64,'2 fatias de pão integral'),ingredient('11091',78,'½ xícara de brócolis')],instructions:'Prepare os ovos sem adicionar óleo à referência nutricional. Sirva com pão e brócolis cozido. Óleo ou acompanhamentos extras precisam ser registrados separadamente.'},
{id:'rice-chicken',name:'Arroz, feijão e frango',type:'lunch',...photo('rice-beans','Ilustração: Pexels / foto 8992843'),minutes:25,ingredients:[ingredient('20045',158,'1 xícara de arroz'),ingredient('16015',86,'½ xícara de feijão',['16070']),ingredient('05064',86,'½ peito de frango',['15121']),ingredient('11091',78,'½ xícara de brócolis')],instructions:'Monte o prato com arroz e feijão já cozidos, frango assado e brócolis. A foto ilustra a combinação; porções são as indicadas abaixo.'},
{id:'rice-lentils',name:'Arroz, lentilha e batata-doce',type:'lunch',...photo('rice-beans','Ilustração: Pexels / foto 8992843; lentilhas são uma variação'),minutes:15,ingredients:[ingredient('20045',158,'1 xícara de arroz'),ingredient('16070',99,'½ xícara de lentilha'),ingredient('11508',120,'2 batatas-doces pequenas'),ingredient('11091',78,'½ xícara de brócolis')],instructions:'Com arroz, lentilha, batata-doce e brócolis já cozidos, combine e aqueça por alguns minutos. Tempere a gosto; registre separadamente óleo, molhos e outros adicionais.'},
{id:'tuna',name:'Arroz, atum e vegetais',type:'dinner',...photo('rice-beans','Ilustração: Pexels / foto 8992843; composição ilustrativa'),minutes:10,ingredients:[ingredient('20045',158,'1 xícara de arroz'),ingredient('15121',85,'½ lata de atum escorrido',['16015']),ingredient('11091',78,'½ xícara de brócolis')],instructions:'Escorra o atum e combine com arroz e vegetais cozidos. Confira o rótulo da marca escolhida.'},
{id:'yogurt',name:'Iogurte com banana e aveia',type:'snack',...photo('yogurt','Ilustração: Pexels / foto 26832331'),minutes:5,ingredients:[ingredient('01256',170,'1 pote de referência de 170 g'),ingredient('09040',59,'½ banana média'),ingredient('08120',27,'⅓ xícara de aveia crua')],instructions:'Misture o iogurte, a banana fatiada e os flocos. A foto mostra outras frutas; a estimativa considera apenas os ingredientes listados.'},
{id:'cottage',name:'Pão com cottage e banana',type:'snack',...photo('yogurt','Ilustração: Pexels / foto 26832331; não mostra cottage'),minutes:5,ingredients:[ingredient('18075',64,'2 fatias de pão integral'),ingredient('01012',113,'Porção de cottage de 113 g',['01132']),ingredient('09040',118,'1 banana média')],instructions:'Espalhe o cottage no pão e sirva com banana. Não inclui bebidas ou adicionais.'}
];
export function foodCompatible(food:ReferenceFood,p:NutritionPreferences):boolean {
 const text=normalizeFood(food.name+' '+food.keywords);
 const allergenIds:Record<string,string[]>={sesame:['18075'],peanut:[],milk:['01256','01012'],egg:['01132'],gluten:['08121','08120','18075'],fish:['15121'],soy:['18075'],nuts:['18075']};
 const aliases:Record<string,string[]>={sesame:['sesamo','sesame','sesam'],peanut:['amendoim','peanut','cacahuete','arachide'],milk:['leite','milk','leche','lait','lactose'],egg:['ovo','egg','huevo','oeuf'],gluten:['gluten','trigo','wheat','aveia','oats','bread','pao'],fish:['peixe','fish','atum','tuna','pescado','thon'],soy:['soja','soy','soya'],nuts:['nozes','nuts','nuez','noix','amendoa','almond']};
 if(p.allergies.some(a=>allergenIds[a]?.includes(food.id)||(aliases[a]??[a]).some(term=>term.trim()&&text.includes(normalizeFood(term))))||p.disliked.some(a=>a.trim()&&normalizeFood(a).length>=2&&text.includes(normalizeFood(a))))return false;
 if(p.diet==='vegan'&&!food.tags.includes('vegan'))return false;
 if(p.diet==='vegetarian'&&!food.tags.includes('vegetarian')&&!food.tags.includes('vegan'))return false;
 if(p.diet==='pescatarian'&&food.id==='05064')return false;
 return true;
}
export function mealTotals(meal:SuggestedMeal){return meal.ingredients.reduce((total,i)=>{const f=REFERENCE_FOODS.find(f=>f.id===i.foodId)!;const k=i.grams/100;return {calories:total.calories+f.calories*k,protein:total.protein+f.protein*k,carbs:total.carbs+f.carbs*k,fat:total.fat+f.fat*k};},{calories:0,protein:0,carbs:0,fat:0});}
export function suggestMeals(input:NutritionPreferences):SuggestedMeal[]{
 const p=nutritionPreferencesSchema.parse(input);
 const compatible=(m:SuggestedMeal)=>m.minutes<=p.prepMinutes&&m.ingredients.every(i=>{const f=REFERENCE_FOODS.find(f=>f.id===i.foodId)!;return foodCompatible(f,p)&&(!p.available.length||p.available.includes(f.id));});
 const pick=(type:SuggestedMeal['type'])=>MEAL_RECIPES.filter(m=>m.type===type&&compatible(m)).sort((a,b)=>p.budget==='low'?Number(a.ingredients.some(i=>['05064','15121','01256'].includes(i.foodId)))-Number(b.ingredients.some(i=>['05064','15121','01256'].includes(i.foodId))):0)[0];
 const breakfast=pick('breakfast'),lunch=pick('lunch');
 const dinner=MEAL_RECIPES.filter(m=>['lunch','dinner'].includes(m.type)&&compatible(m)).find(m=>m.id!==lunch?.id);
 let snack=pick('snack');
 if(!snack && p.diet==='vegan') snack={id:'banana-oats',name:'Banana com aveia',type:'snack',...photo('oats','Ilustração: Pexels / foto 4725737; composição ilustrativa'),minutes:5,ingredients:[ingredient('09040',118,'1 banana média'),ingredient('08121',117,'½ xícara de aveia cozida')],instructions:'Combine a banana fatiada com a aveia já cozida em água. Não inclui leite nem outros adicionais.'};
 if(snack && !compatible(snack))snack=undefined;
 const main=[breakfast,lunch,dinner].filter((m):m is SuggestedMeal=>!!m);
 const extras=[snack,breakfast,lunch,dinner].filter((m):m is SuggestedMeal=>!!m);
 let index=0;
 while(main.length<p.meals && extras.length && index<extras.length*2){const candidate=extras[index++%extras.length]!;if(main[main.length-1]?.id!==candidate.id)main.push(candidate);}
 return main;
}
export function substituteIngredient(meal:SuggestedMeal,foodId:string,substituteId:string):SuggestedMeal|null{
 const item=meal.ingredients.find(i=>i.foodId===foodId);const f=REFERENCE_FOODS.find(f=>f.id===substituteId);
 if(!item?.substituteIds.includes(substituteId)||!f)return null;
 return {...meal,ingredients:meal.ingredients.map(i=>i.foodId===foodId?{...i,foodId:f.id,name:f.name,grams:Math.round(i.grams),household:`${Math.round(i.grams)} g — equivalência por peso, não por volume`,substituteIds:[foodId]}:i)};
}
export function foodToResult(f:ReferenceFood){return {key:`usda-sr28-${f.id}`,name:f.name,servingSizeG:100,servingLabel:'100 g',calories:f.calories,proteinG:f.protein,carbsG:f.carbs,fatG:f.fat,fiberG:f.fiber,sugarG:null,sodiumMg:null,vitamins:{},minerals:{},source:'usda' as const,sourceUrl:foodSourceUrl(f.id),inDatabase:false};}
