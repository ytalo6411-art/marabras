/**
 * Gera os nomes em português brasileiro do catálogo de exercícios.
 *
 * Regra do projeto: NÃO traduzir palavra por palavra. O nome precisa descrever
 * o movimento real em português usado em academias no Brasil.
 *
 * Estratégia:
 *  1. OVERRIDE explícito para todo exercício ambíguo ou com nome próprio
 *     ("Drag Curl", "Spell Caster", "Otis-Up", "Iron Cross"…).
 *  2. Composição validada: [equipamento] + [movimento] + [posição/pegada].
 *  3. Qualquer nome não coberto fica SEM tradução e é reportado — nunca
 *     inventamos um nome plausível para preencher lacuna.
 *
 * Uso: node scripts/translate-exercises.mjs [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync('supabase/seed/exercises.json', 'utf8'));

/* ─── 1. Nomes que exigem tradução humana (movimento, não literal) ─────────── */
const OVERRIDE = {
  '45 Degree Hyperextension': 'Hiperextensão lombar no banco 45°',
  '45-Degree Bicycle Twisting Crunch': 'Abdominal bicicleta com rotação a 45°',
  '45-Degree Bicycle Twisting Crunch (abdominals)': 'Abdominal bicicleta com rotação a 45° (reto abdominal)',
  'All Fours Groin Stretch': 'Alongamento de virilha em quatro apoios',
  'Barbell Drag Curl': 'Rosca arrastada com barra',
  'Barbell Clean And Press': 'Arremesso e desenvolvimento com barra',
  'Barbell Seated Behind-The-Neck Press': 'Desenvolvimento por trás da nuca sentado com barra',
  'Barbell Wide-Grip Upright Row': 'Remada alta com barra e pegada aberta',
  'Battling Ropes': 'Corda naval',
  'Bench Dips': 'Mergulho de tríceps no banco',
  'Bench Pull-Up': 'Barra fixa com apoio no banco',
  'Bent Knee Lying Twist on Stability Ball': 'Rotação deitado com joelhos flexionados na bola suíça',
  'Bridge Pose (Setu Bandhasana)': 'Ponte de glúteos (postura da ponte)',
  'Bridge Pose (Setu Bandhasana) (glutes)': 'Ponte de glúteos (foco em glúteos)',
  'Burpee': 'Burpee',
  'Butterfly Yoga Pose': 'Postura da borboleta (alongamento de adutores)',
  'Cable Rear Delt Row (with rope)': 'Remada para deltoide posterior na polia com corda',
  'Cable Seated High Row (V-bar)': 'Remada alta sentada na polia com triângulo',
  'Cable Twist (up-down)': 'Rotação de tronco na polia (alto e baixo)',
  'Calf Stretch with Rope': 'Alongamento de panturrilha com corda',
  'Calf Stretch with Strap': 'Alongamento de panturrilha com faixa',
  'Cambered Bar Lying Row': 'Remada deitado com barra curvada',
  'Cardio Exercise': 'Exercício cardiovascular',
  'Cardio Machine Exercise': 'Exercício cardiovascular em máquina',
  'Cardio Machine Workouts': 'Treino cardiovascular em máquina',
  'Chin-to-Chest Stretch': 'Alongamento de pescoço (queixo ao peito)',
  'Chin-ups (narrow parallel grip)': 'Barra fixa supinada com pegada neutra fechada',
  'Close Feet Leg Press': 'Leg press com pés juntos',
  'Commando Pull-Up': 'Barra fixa comando (pegada alternada)',
  'Crossover Kneeling Hip Flexor Stretch': 'Alongamento de flexor do quadril ajoelhado com perna cruzada',
  'Deep Push-Up': 'Flexão de braço com amplitude aumentada',
  'Donkey Calf Raise': 'Elevação de panturrilha inclinado (donkey)',
  'Dumbbell Iron Cross': 'Crucifixo isométrico com halteres (cruz de ferro)',
  'Dumbbell One Arm Zottman Preacher Curl': 'Rosca Zottman unilateral no banco Scott com halter',
  'Dumbbell Palm Rotational Bent Over Row': 'Remada curvada com rotação de punho e halter',
  'Dumbbell Cross Body Hammer Curl': 'Rosca martelo cruzada com halter',
  'EZ Barbell Anti Gravity Press': 'Supino antigravidade com barra W',
  'Elliptical Trainer': 'Elíptico (transport)',
  'Exercise Ball Sit-Up': 'Abdominal supra na bola suíça',
  'Exercise Ball Spinal Stretch': 'Alongamento de coluna na bola suíça',
  'Feet and Ankles Rotation Stretch': 'Alongamento de pés e tornozelos com rotação',
  'Feet and Ankles Stretch': 'Alongamento de pés e tornozelos',
  'Flat Bench Cable Fly': 'Crucifixo na polia em banco reto',
  'Flexion Leg Sit-Up Stretch': 'Alongamento abdominal com pernas flexionadas',
  'Front Toe Touch Stretch': 'Alongamento com toque nos pés à frente',
  'Hanging Leg Hip Raise': 'Elevação de pernas e quadril suspenso na barra',
  'Hanging Straight Leg Raise': 'Elevação de pernas estendidas suspenso na barra',
  'Hip Circles Stretch': 'Circundução de quadril (alongamento)',
  'Hip Extension Stretch': 'Alongamento em extensão de quadril',
  'Hip Flexor and Quadriceps Stretch': 'Alongamento de flexor do quadril e quadríceps',
  'Incline Leg Hip Raise': 'Elevação de pernas e quadril no banco inclinado',
  'Inverted Row Between Chairs': 'Remada invertida entre cadeiras',
  'Inverted Row With Straps': 'Remada invertida em fitas de suspensão',
  'Iron Cross Stretch': 'Alongamento em cruz de ferro',
  'Jackknife': 'Abdominal canivete',
  'Jackknife Floor': 'Abdominal canivete no solo',
  'Jackknife Split Crunch': 'Abdominal canivete alternado',
  'Jump Rope': 'Pular corda',
  'Jump Step-Up': 'Subida no banco com salto',
  'Jumping Jack': 'Polichinelo',
  'Kneeling Back Rotation Stretch': 'Alongamento de costas com rotação ajoelhado',
  'Kneeling Lat Stretch': 'Alongamento de dorsais ajoelhado',
  'Kneeling Triceps Stretch': 'Alongamento de tríceps ajoelhado',
  'Landmine 180': 'Rotação de tronco com barra em landmine (180°)',
  'Leg Raise Crunch': 'Abdominal com elevação de pernas',
  'Leg Raise with Hip Lift': 'Elevação de pernas com elevação de quadril',
  'Lever Back Extension': 'Extensão lombar em máquina',
  'Lever High Row': 'Remada alta em máquina',
  'Lever Horizontal Leg Press': 'Leg press horizontal em máquina',
  'Lever Incline Hammer Chest Press': 'Supino inclinado com pegada neutra em máquina',
  'Lever Reverse Hyperextension': 'Hiperextensão reversa em máquina',
  'Lever Reverse T-Bar Row': 'Remada T-bar reversa em máquina',
  'Lever Seated Dip': 'Mergulho de tríceps sentado em máquina',
  'Lever Standing Rear Kick': 'Extensão de quadril para trás em máquina',
  'Lever T-Bar Row': 'Remada T-bar em máquina',
  'Lying Hip Lift on Stability Ball': 'Elevação de quadril deitado na bola suíça',
  'Lying Scissor Kick': 'Tesoura deitada',
  'Medicine Ball Wall Sit-Up': 'Abdominal supra na parede com bola medicinal',
  'Middle Back Stretch': 'Alongamento do meio das costas',
  'Military Press': 'Desenvolvimento militar em pé',
  'Neck Side Stretch': 'Alongamento lateral de pescoço',
  'Old School Reverse Extensions': 'Extensão de tríceps reversa (old school)',
  'Otis-Up': 'Abdominal Otis (supra com braços elevados)',
  'Overhead Chest Stretch': 'Alongamento de peitoral com braços acima da cabeça',
  'Pec Deck Fly': 'Crucifixo no peck deck',
  'Peroneals Stretch': 'Alongamento de fibulares (lateral da perna)',
  'Pilates Corkscrew': 'Saca-rolhas (Pilates)',
  'Pilates Hundred': 'Cem abdominais (Pilates Hundred)',
  'Plyometric Side Lunge Stretch': 'Alongamento de avanço lateral pliométrico',
  'Pull-Up (Wide Grip)': 'Barra fixa com pegada aberta',
  'Pull-Up / Chin-Up': 'Barra fixa pronada e supinada',
  'Push-Up': 'Flexão de braço',
  'Rear Decline Bridge': 'Ponte declinada com apoio superior',
  'Rear Deltoid Stretch': 'Alongamento de deltoide posterior',
  'Rear Foot Elevated Hip Flexor Stretch': 'Alongamento de flexor do quadril com pé de trás elevado',
  'Resistance Band High Fly': 'Crucifixo alto com elástico',
  'Reverse Dip Stretch': 'Alongamento de tríceps em mergulho reverso',
  'Ring High Row': 'Remada alta nas argolas',
  'Rotational Push-Up': 'Flexão de braço com rotação de tronco',
  "Runner's Stretch": 'Alongamento do corredor',
  'Running': 'Corrida',
  'Russian Twist on Stability Ball (Arms Straight)': 'Rotação russa na bola suíça com braços estendidos',
  'Scapula Dips': 'Mergulho escapular',
  'Seated Boat Stretch': 'Alongamento em postura do barco sentado',
  'Seated Cable Row (V-Grip)': 'Remada sentada na polia com triângulo',
  'Seated Cable Row (Wide-Grip)': 'Remada sentada na polia com pegada aberta',
  'Seated Shoulder Flexor, Depressor, Retractor Stretch': 'Alongamento de ombro (flexão, depressão e retração)',
  'Seated Straight Arm Twist': 'Rotação de tronco sentado com braços estendidos',
  'Seated Twist Stretch (Straight Arm)': 'Alongamento com rotação sentado e braços estendidos',
  'Seated Twist on Stability Ball': 'Rotação de tronco na bola suíça',
  'Seated Wide Angle Pose Sequence': 'Sequência da postura do ângulo aberto sentado',
  'Side Wrist Pull Stretch': 'Alongamento de punho com tração lateral',
  'Single Leg Stretch (Bent Knee)': 'Alongamento unilateral com joelho flexionado',
  'Single Straight Leg Stretch': 'Alongamento unilateral com perna estendida',
  'Sit-Up': 'Abdominal supra (sit-up)',
  'Sit-Up (rectus abdominis)': 'Abdominal supra (reto abdominal)',
  'Sled 45 Degree Calf Press': 'Elevação de panturrilha no leg press 45°',
  'Sled 45 Degree Wide Leg Press': 'Leg press 45° com pés afastados',
  'Sled Hack Squat': 'Agachamento hack em máquina',
  'Smith Chair Squat': 'Agachamento no Smith com apoio',
  'Spell Caster': 'Rotação de tronco com halteres (spell caster)',
  'Spine Stretch': 'Alongamento de coluna',
  'Squat': 'Agachamento livre',
  'Stairs Calf Stretch': 'Alongamento de panturrilha em degrau',
  'Standing Reach Up Back Rotation Stretch': 'Alongamento de costas com rotação e braços elevados em pé',
  'Standing Side Bend Stretch (Bent Arm)': 'Alongamento lateral em pé com braço flexionado',
  'Standing Wheel Rollout': 'Roda abdominal em pé',
  'Stationary Bike': 'Bicicleta ergométrica',
  'Straight-Leg Up Crunch': 'Abdominal com pernas estendidas para cima',
  'Treadmill Running': 'Corrida em esteira',
  'Triceps Dips': 'Mergulho de tríceps nas paralelas',
  'Twisting Crunch': 'Abdominal com rotação de tronco',
  'V-Up': 'Abdominal em V',
  'Vertical Leg Raise (on parallel bars)': 'Elevação de pernas nas barras paralelas',
  'Walk Wave Machine': 'Máquina de onda (walk wave)',
  'Weighted Leg Extension Crunch': 'Abdominal com extensão de pernas e carga',
  'Weighted Lying Twist': 'Rotação de tronco deitado com carga',
  'Weighted Sissy Squat': 'Agachamento sissy com carga',
  'Weighted Standing Curl': 'Rosca em pé com carga',
  'Wrist Circles': 'Circundução de punhos',
  'Chest Dips': 'Mergulho nas paralelas com foco em peitoral',
  'Chest Lift with Rotation': 'Elevação de tronco com rotação',
  'Dumbbell Close-Grip Press': 'Supino com pegada fechada e halteres',
  'Dumbbell Incline Hammer Press': 'Supino inclinado com pegada neutra e halteres',
  'Dumbbell Lying Hammer Press': 'Supino reto com pegada neutra e halteres',
  'Dumbbell Lying Alternate Extension': 'Extensão de tríceps alternada deitado com halteres',
  'Band Resisted Decline Sit-Up': 'Abdominal declinado com resistência do elástico',
  'Band Standing Lift': 'Rotação de tronco em pé com elástico (lenhador)',
  'Cable Standing Lift': 'Rotação de tronco em pé na polia (lenhador)',
};

/* ─── 2. Vocabulário validado para composição ──────────────────────────────── */
const EQUIP = {
  'Band': 'com elástico',
  'Barbell': 'com barra',
  'Cable': 'na polia',
  'Dumbbell': 'com halter',
  'EZ Bar': 'com barra W',
  'Kettlebell': 'com kettlebell',
  'Lever': 'em máquina',
  'Smith Machine': 'no Smith',
  'Smith': 'no Smith',
  'Stability Ball': 'na bola suíça',
};

const POSITION = {
  'Seated': 'sentado',
  'Standing': 'em pé',
  'Lying': 'deitado',
  'Prone': 'deitado de frente',
  'Supine': 'deitado de costas',
  'Kneeling': 'ajoelhado',
  'Incline': 'inclinado',
  'Decline': 'declinado',
  'Bent-Over': 'curvado',
  'Bent Over': 'curvado',
};

const MODIFIER = {
  'One Arm': 'unilateral',
  'One-Arm': 'unilateral',
  'Single Leg': 'unilateral',
  'Alternating': 'alternado',
  'Alternate': 'alternado',
  'Close Grip': 'pegada fechada',
  'Close-Grip': 'pegada fechada',
  'Wide Grip': 'pegada aberta',
  'Wide-Grip': 'pegada aberta',
  'Reverse Grip': 'pegada inversa',
  'Reverse-Grip': 'pegada inversa',
  'Underhand': 'pegada supinada',
  'Hammer Grip': 'pegada neutra',
  'Hammer': 'martelo',
  'Neutral': 'pegada neutra',
  'Pronate-grip': 'pegada pronada',
  'Straight Arm': 'braços estendidos',
  'Straight-Back': 'coluna neutra',
  'Assisted': 'assistida',
  'Resisted': 'com resistência',
  'Weighted': 'com carga',
  'Dynamic': 'dinâmico',
};

// Movimento → nome em português. A chave casa o núcleo do nome em inglês.
const MOVEMENT = [
  ['Leg Press', 'Leg press'],
  ['Bench Press', 'Supino reto'],
  ['Incline Bench Press', 'Supino inclinado'],
  ['Decline Bench Press', 'Supino declinado'],
  ['Close Grip Bench Press', 'Supino pegada fechada'],
  ['Chest Press', 'Supino'],
  ['Hammer Press', 'Supino com pegada neutra'],
  ['Shoulder Press', 'Desenvolvimento de ombro'],
  ['Arnold Press', 'Desenvolvimento Arnold'],
  ['Close-Grip Press', 'Supino pegada fechada'],
  ['Push-Up', 'Flexão de braço'],
  ['Pull-Up', 'Barra fixa'],
  ['Chin-Up', 'Barra fixa supinada'],
  ['Lat Pulldown', 'Puxada de dorsal na polia'],
  ['Lateral Pulldown', 'Puxada lateral na polia'],
  ['Straight Arm Pulldown', 'Puxada com braços estendidos'],
  ['Pulldown', 'Puxada na polia'],
  ['Upright Row', 'Remada alta'],
  ['Rear Delt Row', 'Remada para deltoide posterior'],
  ['Bent-Over Row', 'Remada curvada'],
  ['Bent Over Row', 'Remada curvada'],
  ['Incline Row', 'Remada no banco inclinado'],
  ['Incline Bench Row', 'Remada no banco inclinado'],
  ['Seated Row', 'Remada sentada'],
  ['Row', 'Remada'],
  ['Reverse Fly', 'Crucifixo inverso'],
  ['Crossover Reverse Fly', 'Crucifixo inverso na polia'],
  ['Fly', 'Crucifixo'],
  ['Lateral Raise', 'Elevação lateral'],
  ['Front Raise', 'Elevação frontal'],
  ['Rear Lateral Raise', 'Elevação posterior'],
  ['Rear Delt Raise', 'Elevação posterior'],
  ['Triceps Pushdown', 'Tríceps na polia (pushdown)'],
  ['Overhead Triceps Extension', 'Tríceps francês acima da cabeça'],
  ['Triceps Extension', 'Extensão de tríceps'],
  ['Kickback', 'Tríceps coice'],
  ['Leg Curl', 'Mesa flexora'],
  ['Leg Extension', 'Cadeira extensora'],
  ['Calf Press', 'Elevação de panturrilha'],
  ['Calf Raise', 'Elevação de panturrilha'],
  ['Goblet Squat', 'Agachamento goblet'],
  ['Front Squat', 'Agachamento frontal'],
  ['Back Squat', 'Agachamento livre com barra'],
  ['Sumo Squat', 'Agachamento sumô'],
  ['Chair Squat', 'Agachamento com apoio'],
  ['Squat', 'Agachamento'],
  ['Stiff Leg Deadlift', 'Levantamento terra stiff'],
  ['Stiff-Leg Deadlift', 'Levantamento terra stiff'],
  ['Straight Leg Deadlift', 'Levantamento terra com pernas estendidas'],
  ['Deadlift', 'Levantamento terra'],
  ['Hip Thrust', 'Elevação pélvica'],
  ['Glute Bridge', 'Ponte de glúteos'],
  ['Pull Through', 'Extensão de quadril na polia (pull-through)'],
  ['Hip Abduction', 'Abdução de quadril'],
  ['Hip Adduction', 'Adução de quadril'],
  ['Hip Extension', 'Extensão de quadril'],
  ['Lunge', 'Avanço'],
  ['Step-Up', 'Subida no banco'],
  ['Shrug', 'Encolhimento de ombros'],
  ['Preacher Curl', 'Rosca no banco Scott'],
  ['Concentration Curl', 'Rosca concentrada'],
  ['Hammer Curl', 'Rosca martelo'],
  ['Biceps Curl', 'Rosca direta'],
  ['Incline Curl', 'Rosca no banco inclinado'],
  ['Wrist Curl', 'Rosca de punho'],
  ['Curl', 'Rosca'],
  ['Reverse Crunch', 'Abdominal infra'],
  ['Crunch', 'Abdominal supra'],
  ['Side Plank', 'Prancha lateral'],
  ['Front Plank', 'Prancha frontal'],
  ['Plank', 'Prancha'],
  ['Side Bend', 'Flexão lateral de tronco'],
  ['Standing Lift', 'Rotação de tronco (lenhador)'],
  ['Leg Raise', 'Elevação de pernas'],
  ['Back Extension', 'Extensão lombar'],
  ['Stretch', 'Alongamento'],
];

function translate(name) {
  if (OVERRIDE[name]) return OVERRIDE[name];

  let rest = name;
  const equip = [];
  const position = [];
  const modifiers = [];

  // Equipamento (prefixo). Ordem importa: "Smith Machine" antes de "Smith".
  for (const key of Object.keys(EQUIP).sort((a, b) => b.length - a.length)) {
    if (rest.startsWith(`${key} `)) {
      equip.push(EQUIP[key]);
      rest = rest.slice(key.length + 1);
      break;
    }
  }
  // Sufixo "on Stability Ball" / "On Exercise Ball".
  rest = rest.replace(/ on (Stability|Exercise) Ball$/i, () => {
    equip.push(EQUIP['Stability Ball']);
    return '';
  });

  for (const key of Object.keys(MODIFIER).sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`\\b${key.replace(/[-]/g, '[- ]')}\\b`, 'i');
    if (re.test(rest)) {
      modifiers.push(MODIFIER[key]);
      rest = rest.replace(re, '').replace(/\s+/g, ' ').trim();
    }
  }
  for (const key of Object.keys(POSITION)) {
    const re = new RegExp(`^${key}\\b`, 'i');
    if (re.test(rest)) {
      position.push(POSITION[key]);
      rest = rest.replace(re, '').replace(/\s+/g, ' ').trim();
      break;
    }
  }

  const movement = MOVEMENT.find(([en]) => new RegExp(`\\b${en}\\b`, 'i').test(rest));
  if (!movement) return null;

  // "Dumbbell Incline Bench Press" → Supino inclinado com halter
  let base = movement[1];
  if (/^Incline /i.test(rest) && !/inclinad/i.test(base)) base += ' inclinado';
  if (/^Decline /i.test(rest) && !/declinad/i.test(base)) base += ' declinado';

  const parts = [base, ...position, ...modifiers, ...equip].filter(Boolean);
  return parts.join(' ');
}

/* ─── Execução ─────────────────────────────────────────────────────────────── */
const rows = [];
const missing = [];
for (const exercise of seed) {
  const pt = translate(exercise.name);
  if (!pt) { missing.push(exercise.name); continue; }
  rows.push({ slug: exercise.slug, name_en: exercise.name, name_pt: pt });
}

console.log(`Traduzidos: ${rows.length}/${seed.length}`);
if (missing.length) {
  console.log(`SEM TRADUÇÃO (${missing.length}) — precisam de revisão humana:`);
  for (const name of missing) console.log('  -', name);
}

if (process.argv.includes('--write')) {
  writeFileSync('src/data/exerciseNamesPt.json', `${JSON.stringify(rows, null, 2)}\n`);
  console.log('Escrito: src/data/exerciseNamesPt.json');
}
if (process.argv.includes('--review')) {
  for (const row of rows) console.log(`${row.name_en}  →  ${row.name_pt}`);
}
