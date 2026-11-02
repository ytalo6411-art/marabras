import type { OptionIconName } from '@/data/exerciseTaxonomy';
import {
  IconDumbbell,
  IconBarbell,
  IconFlame,
  IconRun,
  IconMobility,
  IconScale,
  IconCalendar,
  IconBolt,
  IconBuilding,
  IconHome,
  IconBody,
  IconTree,
  IconMapPin,
} from './icons';

/**
 * Resolve a chave de ícone do questionário para o componente vetorial.
 *
 * A camada de dados (`exerciseTaxonomy`) guarda apenas a chave, então continua
 * testável sem React. Aqui o traço é o mesmo do resto do produto (stroke 1.75,
 * `currentColor`), no lugar de emojis — que mudavam de desenho entre sistemas
 * operacionais e não herdavam a cor do tema.
 */
const REGISTRY: Record<OptionIconName, (props: { size?: number }) => React.ReactElement> = {
  dumbbell: IconDumbbell,
  barbell: IconBarbell,
  flame: IconFlame,
  run: IconRun,
  mobility: IconMobility,
  scale: IconScale,
  calendar: IconCalendar,
  bolt: IconBolt,
  building: IconBuilding,
  home: IconHome,
  body: IconBody,
  tree: IconTree,
  'map-pin': IconMapPin,
};

export function OptionIcon({ name, size = 20 }: { name: OptionIconName; size?: number }) {
  const Component = REGISTRY[name];
  // Chave desconhecida não deve quebrar o questionário nem renderizar um glifo.
  if (!Component) return null;
  return <Component size={size} />;
}
