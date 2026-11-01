/** USDA SR28 (2015), per 100 g edible portion. Values are estimates, not measurements of your food.
 * Source records: github.com/maxsu/USDA-SR28, FOOD_DES.txt / NUT_DATA.txt / WEIGHT.txt.
 * Household equivalents retain the source's exact measured weights; do not generalize to every brand.
 */
export interface ReferenceFood { id:string; name:string; category:string; keywords:string[]; calories:number; protein:number; carbs:number; fat:number; fiber:number; measures:{label:string;grams:number}[]; tags:string[]; }
export const REFERENCE_FOODS:ReferenceFood[]=[
{id:'09040',name:'Banana',category:'Frutas',keywords:['banana fruit fruta'],calories:89,protein:1.09,carbs:22.84,fat:.33,fiber:2.6,measures:[{label:'1 unidade média',grams:118},{label:'1 xícara fatiada',grams:150}],tags:['vegan','gluten_free']},
{id:'01132',name:'Ovos mexidos',category:'Proteínas',keywords:['egg ovo huevos oeuf'],calories:149,protein:9.99,carbs:1.61,fat:10.98,fiber:0,measures:[{label:'1 ovo grande',grams:61},{label:'1 colher de sopa',grams:13.7}],tags:['vegetarian','gluten_free']},
{id:'01256',name:'Iogurte grego natural desnatado',category:'Laticínios',keywords:['yogurt yogur iogurte yaourt'],calories:59,protein:10.19,carbs:3.6,fat:.39,fiber:0,measures:[{label:'1 pote (referência USDA)',grams:170}],tags:['vegetarian','gluten_free']},
{id:'05064',name:'Peito de frango assado',category:'Proteínas',keywords:['chicken frango pollo poulet'],calories:165,protein:31.02,carbs:0,fat:3.57,fiber:0,measures:[{label:'½ peito sem osso e pele',grams:86},{label:'1 xícara em cubos',grams:140}],tags:['gluten_free']},
{id:'08121',name:'Aveia cozida em água',category:'Cereais',keywords:['oats avena aveia avoine'],calories:71,protein:2.54,carbs:12,fat:1.52,fiber:1.7,measures:[{label:'1 xícara',grams:234},{label:'1 colher de sopa',grams:14.6}],tags:['vegan']},
{id:'08120',name:'Aveia em flocos crua',category:'Cereais',keywords:['oats avena aveia avoine'],calories:379,protein:13.15,carbs:67.7,fat:6.52,fiber:10.1,measures:[{label:'1 xícara',grams:81}],tags:['vegan']},
{id:'16015',name:'Feijão-preto cozido',category:'Leguminosas',keywords:['beans feijao frijoles haricots'],calories:132,protein:8.86,carbs:23.71,fat:.54,fiber:8.7,measures:[{label:'1 xícara',grams:172},{label:'1 xícara',grams:172}],tags:['vegan','gluten_free']},
{id:'20045',name:'Arroz branco cozido',category:'Cereais',keywords:['rice arroz riz'],calories:130,protein:2.69,carbs:28.17,fat:.28,fiber:.4,measures:[{label:'1 xícara',grams:158}],tags:['vegan','gluten_free']},
{id:'18075',name:'Pão integral',category:'Cereais',keywords:['bread pao pan pain'],calories:252,protein:12.45,carbs:42.71,fat:3.5,fiber:6,measures:[{label:'1 fatia',grams:32}],tags:['vegan']},
{id:'11091',name:'Brócolis cozido',category:'Vegetais',keywords:['broccoli brocolis brocoli'],calories:35,protein:2.38,carbs:7.18,fat:.41,fiber:3.3,measures:[{label:'½ xícara picado',grams:78},{label:'1 haste média',grams:180}],tags:['vegan','gluten_free']},
{id:'11508',name:'Batata-doce assada',category:'Tubérculos',keywords:['sweet potato batata boniato patate'],calories:90,protein:2.01,carbs:20.71,fat:.15,fiber:3.3,measures:[{label:'1 unidade pequena',grams:60},{label:'1 xícara',grams:200}],tags:['vegan','gluten_free']},
{id:'15121',name:'Atum em água',category:'Proteínas',keywords:['tuna atun thon'],calories:86,protein:19.44,carbs:0,fat:.96,fiber:0,measures:[{label:'1 lata escorrida',grams:165}],tags:['gluten_free']},
{id:'16070',name:'Lentilha cozida',category:'Leguminosas',keywords:['lentils lentilha lentejas lentilles'],calories:116,protein:9.02,carbs:20.13,fat:.38,fiber:7.9,measures:[{label:'1 xícara',grams:198}],tags:['vegan','gluten_free']},
{id:'01012',name:'Queijo cottage',category:'Laticínios',keywords:['cheese cottage queijo requeson'],calories:98,protein:11.12,carbs:3.38,fat:4.3,fiber:0,measures:[{label:'4 onças / 113 g',grams:113}],tags:['vegetarian','gluten_free']},
{id:'04053',name:'Azeite de oliva',category:'Gorduras',keywords:['olive oil azeite aceite huile'],calories:884,protein:0,carbs:0,fat:100,fiber:0,measures:[{label:'1 colher de sopa',grams:13.5},{label:'1 colher de chá',grams:4.5}],tags:['vegan','gluten_free']}
];

export const foodSourceUrl=(id:string)=>`https://github.com/maxsu/USDA-SR28/blob/master/FOOD_DES.txt#${id}`;
export const normalizeFood=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function searchReferenceFoods(query:string,category='Todos'){const q=normalizeFood(query);return REFERENCE_FOODS.filter(f=>(category==='Todos'||f.category===category)&&(!q||normalizeFood(f.name+' '+f.keywords).includes(q)));}
