-- Conteúdo pt-BR revisado dos exercícios.
-- Gerado por scripts/build-exercise-translations.mjs — não editar à mão.
-- Os originais permanecem em *_en (ver 20261103010000_exercise_content_locales.sql).
-- content_pt_ready=true apenas para linhas com os 4 campos completos e revisados.

begin;

update public.exercises set
  description = 'Movimento base para os membros inferiores que fortalece quadríceps, glúteos e posteriores da coxa ao flexionar e estender joelhos e quadril.',
  steps = array['Fique em pé com os pés na largura dos ombros e as pontas levemente voltadas para fora.', 'Contraia o abdômen e mantenha o peito erguido.', 'Inicie o movimento levando o quadril para trás e flexionando os joelhos.', 'Desça até que as coxas fiquem pelo menos paralelas ao chão.', 'Empurre o chão com os calcanhares para voltar à posição em pé.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Arredondar a lombar', 'Não descer até a linha paralela']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros e as pontas levemente voltadas para fora.
Contraia o abdômen e mantenha o peito erguido.
Inicie o movimento levando o quadril para trás e flexionando os joelhos.
Desça até que as coxas fiquem pelo menos paralelas ao chão.
Empurre o chão com os calcanhares para voltar à posição em pé.',
  content_pt_ready = true
where slug = 'squat-drv-squat';

update public.exercises set
  description = 'Exercício de aquecimento e mobilidade para aumentar a flexibilidade dos punhos e a circulação nos antebraços.',
  steps = array['Estenda os braços à frente do corpo ou para os lados.', 'Feche as mãos em punho ou mantenha-as abertas.', 'Gire os punhos lentamente em movimentos circulares.', 'Faça vários círculos em um sentido.', 'Troque o sentido e repita.']::text[],
  breathing = 'Respire de forma uniforme durante todo o movimento.',
  common_mistakes = array['Mover os braços em vez dos punhos', 'Fazer os círculos com pressa', 'Prender a respiração']::text[],
  instructions = 'Estenda os braços à frente do corpo ou para os lados.
Feche as mãos em punho ou mantenha-as abertas.
Gire os punhos lentamente em movimentos circulares.
Faça vários círculos em um sentido.
Troque o sentido e repita.',
  content_pt_ready = true
where slug = 'wrist-circles-1428';

update public.exercises set
  description = 'Exercício feito no chão que fortalece glúteos e posteriores da coxa ao elevar o quadril.',
  steps = array['Comece deitado de costas, com os joelhos flexionados e os pés na largura do quadril.', 'Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.', 'Empurre o chão com os calcanhares e eleve o quadril em direção ao teto.', 'Faça uma pausa no alto e contraia os glúteos.', 'Desça o quadril de volta ao chão.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer.',
  common_mistakes = array['Empurrar com as pontas dos pés', 'Projetar as costelas para cima', 'Fazer o movimento com pressa']::text[],
  instructions = 'Comece deitado de costas, com os joelhos flexionados e os pés na largura do quadril.
Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.
Empurre o chão com os calcanhares e eleve o quadril em direção ao teto.
Faça uma pausa no alto e contraia os glúteos.
Desça o quadril de volta ao chão.',
  content_pt_ready = true
where slug = 'glute-bridge-drv-hip-raise-bridge';

update public.exercises set
  description = 'Elevação de panturrilha com o tronco inclinado sobre um degrau, trabalhando a panturrilha em toda a amplitude, do alongamento do calcanhar à subida completa.',
  steps = array['Apoie a parte da frente dos pés na borda de um degrau ou bloco, deixando os calcanhares para fora.', 'Incline o tronco à frente a partir do quadril e apoie as mãos em um suporte firme para manter o equilíbrio.', 'Mantenha os joelhos levemente flexionados e desça os calcanhares até sentir alongar a panturrilha.', 'Empurre a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo o equilíbrio.', 'Desça os calcanhares com controle e repita.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao subir na ponta dos pés.',
  common_mistakes = array['Quicar embaixo em vez de descer com controle', 'Girar os tornozelos para dentro ou para fora', 'Usar as mãos para empurrar o corpo para cima', 'Encurtar a amplitude e não descer os calcanhares']::text[],
  instructions = 'Apoie a parte da frente dos pés na borda de um degrau ou bloco, deixando os calcanhares para fora.
Incline o tronco à frente a partir do quadril e apoie as mãos em um suporte firme para manter o equilíbrio.
Mantenha os joelhos levemente flexionados e desça os calcanhares até sentir alongar a panturrilha.
Empurre a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo o equilíbrio.
Desça os calcanhares com controle e repita.',
  content_pt_ready = true
where slug = 'donkey-calf-raise-0284';

update public.exercises set
  description = 'Variação de barra fixa que usa um banco como apoio para os pés, reduzindo a carga e facilitando o movimento.',
  steps = array['Posicione um banco embaixo da barra fixa.', 'Segure a barra com as mãos mais afastadas que a largura dos ombros.', 'Apoie os pés no banco.', 'Puxe o peito em direção à barra, usando o apoio dos pés conforme a necessidade.', 'Desça devagar até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar demais o impulso das pernas', 'Balançar o corpo ou chutar com os pés', 'Deixar o queixo mal alcançar a barra', 'Não controlar a descida']::text[],
  instructions = 'Posicione um banco embaixo da barra fixa.
Segure a barra com as mãos mais afastadas que a largura dos ombros.
Apoie os pés no banco.
Puxe o peito em direção à barra, usando o apoio dos pés conforme a necessidade.
Desça devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'bench-pull-up-0570';

update public.exercises set
  description = 'Ponte no chão com o peso do corpo que eleva o quadril para trabalhar glúteos e posteriores da coxa, mantendo os ombros apoiados.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés inteiros no chão, na largura do quadril.', 'Deixe os braços ao lado do corpo e pressione levemente as palmas no chão.', 'Firme o abdômen e contraia os glúteos.', 'Empurre com os calcanhares e eleve o quadril até alinhar joelhos, quadril e ombros.', 'Faça uma breve pausa no alto, mantendo as costelas baixas.', 'Desça o quadril até o chão com controle e reajuste a posição antes da próxima repetição.']::text[],
  breathing = 'Inspire embaixo, expire ao elevar o quadril e inspire novamente ao descer com controle.',
  common_mistakes = array['Empurrar com as pontas dos pés e levantar os calcanhares', 'Arquear demais a lombar no alto', 'Deixar os joelhos caírem para dentro', 'Deixar o quadril despencar até o chão']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés inteiros no chão, na largura do quadril.
Deixe os braços ao lado do corpo e pressione levemente as palmas no chão.
Firme o abdômen e contraia os glúteos.
Empurre com os calcanhares e eleve o quadril até alinhar joelhos, quadril e ombros.
Faça uma breve pausa no alto, mantendo as costelas baixas.
Desça o quadril até o chão com controle e reajuste a posição antes da próxima repetição.',
  content_pt_ready = true
where slug = 'rear-decline-bridge-0668';

update public.exercises set
  description = 'Exercício de puxada com o peso do corpo, feito com uma barra ou cabo de vassoura resistente apoiado entre duas cadeiras.',
  steps = array['Apoie uma barra resistente entre duas cadeiras pesadas.', 'Deite-se embaixo, com o peito exatamente abaixo da barra.', 'Segure a barra com pegada por cima, na largura dos ombros.', 'Firme o corpo, mantendo uma linha reta da cabeça aos calcanhares.', 'Puxe o peito até a barra, faça uma pausa e desça devagar.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Deixar o quadril cair', 'Abrir demais os cotovelos', 'Não descer até o fim da amplitude', 'Não aproximar as escápulas']::text[],
  instructions = 'Apoie uma barra resistente entre duas cadeiras pesadas.
Deite-se embaixo, com o peito exatamente abaixo da barra.
Segure a barra com pegada por cima, na largura dos ombros.
Firme o corpo, mantendo uma linha reta da cabeça aos calcanhares.
Puxe o peito até a barra, faça uma pausa e desça devagar.',
  content_pt_ready = true
where slug = 'inverted-row-between-chairs-0499';

update public.exercises set
  description = 'Exercício pliométrico em que você sobe e salta sobre uma superfície elevada para desenvolver potência e coordenação das pernas.',
  steps = array['Fique em pé de frente para uma caixa ou plataforma firme.', 'Apoie um dos pés com firmeza no alto da caixa.', 'Empurre com o calcanhar e suba de forma explosiva, elevando bem o outro joelho.', 'Aterrisse suavemente sobre a caixa com os dois pés.', 'Desça dando um passo ou um salto, com controle, e repita.']::text[],
  breathing = 'Expire durante o salto e inspire ao aterrissar e se recompor.',
  common_mistakes = array['Deixar o joelho cair para dentro', 'Aterrissar com impacto ou com o pé todo no chão', 'Não usar toda a amplitude do movimento']::text[],
  instructions = 'Fique em pé de frente para uma caixa ou plataforma firme.
Apoie um dos pés com firmeza no alto da caixa.
Empurre com o calcanhar e suba de forma explosiva, elevando bem o outro joelho.
Aterrisse suavemente sobre a caixa com os dois pés.
Desça dando um passo ou um salto, com controle, e repita.',
  content_pt_ready = true
where slug = 'jump-step-up-drv-jump-step-up';

update public.exercises set
  description = 'Puxada horizontal em suspensão, com as argolas ajustadas no alto, voltada às costas altas e à parte de trás dos ombros.',
  steps = array['Ajuste as argolas na altura do peito e segure as alças com pegada neutra.', 'Incline o corpo para trás, com os pés à frente e o tronco alinhado.', 'Contraia o abdômen e mantenha os braços estendidos.', 'Puxe o peito em direção às argolas, aproximando as escápulas.', 'Volte o corpo à posição inicial com controle.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Deixar o quadril afundar', 'Encolher os ombros', 'Abrir demais os cotovelos', 'Amplitude incompleta']::text[],
  instructions = 'Ajuste as argolas na altura do peito e segure as alças com pegada neutra.
Incline o corpo para trás, com os pés à frente e o tronco alinhado.
Contraia o abdômen e mantenha os braços estendidos.
Puxe o peito em direção às argolas, aproximando as escápulas.
Volte o corpo à posição inicial com controle.',
  content_pt_ready = true
where slug = 'ring-high-row-drv-ring-high-row';

update public.exercises set
  description = 'Variação de flexão com as mãos elevadas, o que reduz a resistência sobre peito e tríceps.',
  steps = array['Apoie as mãos na largura dos ombros sobre uma superfície elevada.', 'Estenda as pernas para trás com os pés juntos, formando uma linha reta.', 'Desça o peito em direção à superfície, com os cotovelos a 45 graus.', 'Faça uma pausa quando o peito estiver próximo da superfície.', 'Empurre de volta até a posição inicial.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar o quadril afundar', 'Abrir os cotovelos para os lados', 'Amplitude de movimento incompleta']::text[],
  instructions = 'Apoie as mãos na largura dos ombros sobre uma superfície elevada.
Estenda as pernas para trás com os pés juntos, formando uma linha reta.
Desça o peito em direção à superfície, com os cotovelos a 45 graus.
Faça uma pausa quando o peito estiver próximo da superfície.
Empurre de volta até a posição inicial.',
  content_pt_ready = true
where slug = 'incline-push-up-0493';

update public.exercises set
  description = 'Exercício com o peso do corpo feito de bruços, voltado a peito, ombros e tríceps.',
  steps = array['Comece em prancha, com as mãos abaixo dos ombros.', 'Contraia abdômen e glúteos.', 'Desça o peito em direção ao chão, com os cotovelos a 45 graus.', 'Faça uma breve pausa perto do chão.', 'Empurre de volta até a posição de prancha.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar o quadril afundar', 'Abrir demais os cotovelos', 'Amplitude de movimento incompleta']::text[],
  instructions = 'Comece em prancha, com as mãos abaixo dos ombros.
Contraia abdômen e glúteos.
Desça o peito em direção ao chão, com os cotovelos a 45 graus.
Faça uma breve pausa perto do chão.
Empurre de volta até a posição de prancha.',
  content_pt_ready = true
where slug = 'push-up-drv-push-ups';

update public.exercises set
  description = 'Abdominal com rotação feito a 45 graus, voltado ao reto abdominal e aos oblíquos.',
  steps = array['Deite-se de costas com as mãos atrás da cabeça e os joelhos flexionados.', 'Tire os ombros e os pés do chão, formando um ângulo de 45 graus entre o tronco e as pernas.', 'Traga o joelho direito em direção ao corpo enquanto gira o cotovelo esquerdo até ele.', 'Troque de lado, estendendo a perna direita e trazendo o joelho esquerdo enquanto o cotovelo direito vai até ele.', 'Continue alternando os lados em um movimento fluido e controlado.']::text[],
  breathing = 'Expire ao subir e girar o tronco, inspire ao voltar ao centro.',
  common_mistakes = array['Usar o impulso', 'Puxar o pescoço', 'Não completar a rotação']::text[],
  instructions = 'Deite-se de costas com as mãos atrás da cabeça e os joelhos flexionados.
Tire os ombros e os pés do chão, formando um ângulo de 45 graus entre o tronco e as pernas.
Traga o joelho direito em direção ao corpo enquanto gira o cotovelo esquerdo até ele.
Troque de lado, estendendo a perna direita e trazendo o joelho esquerdo enquanto o cotovelo direito vai até ele.
Continue alternando os lados em um movimento fluido e controlado.',
  content_pt_ready = true
where slug = '45-degree-bicycle-twisting-crunch-abdominals';

update public.exercises set
  description = 'Exercício de membros inferiores em que você segura halteres e faz avanços alternados para trabalhar glúteos, quadríceps e pernas.',
  steps = array['Fique em pé, ereto, com um halter em cada mão ao lado do corpo e os pés na largura do quadril.', 'Dê um passo à frente com um dos pés, longo o suficiente para flexionar os dois joelhos com conforto.', 'Desça o corpo até a coxa da frente ficar quase paralela ao chão e o joelho de trás se aproximar do solo.', 'Mantenha o tronco ereto e o pé da frente inteiro no chão enquanto faz uma breve pausa embaixo.', 'Empurre com o calcanhar da frente para voltar à posição em pé.', 'Repita do outro lado, alternando as pernas a cada repetição.']::text[],
  breathing = 'Inspire ao descer no avanço e expire ao voltar à posição em pé.',
  common_mistakes = array['Dar um passo muito curto, deixando o joelho da frente passar muito além da ponta do pé.', 'Inclinar o tronco à frente ao descer no avanço.', 'Deixar o calcanhar da frente sair do chão.', 'Empurrar com o pé de trás em vez de usar a perna da frente.']::text[],
  instructions = 'Fique em pé, ereto, com um halter em cada mão ao lado do corpo e os pés na largura do quadril.
Dê um passo à frente com um dos pés, longo o suficiente para flexionar os dois joelhos com conforto.
Desça o corpo até a coxa da frente ficar quase paralela ao chão e o joelho de trás se aproximar do solo.
Mantenha o tronco ereto e o pé da frente inteiro no chão enquanto faz uma breve pausa embaixo.
Empurre com o calcanhar da frente para voltar à posição em pé.
Repita do outro lado, alternando as pernas a cada repetição.',
  content_pt_ready = true
where slug = 'dumbbell-lunge-0336';

update public.exercises set
  description = 'Exercício isométrico de estabilidade do core, feito de bruços, para fortalecer o abdômen e estabilizar o corpo todo.',
  steps = array['Deite-se de bruços, apoiando os antebraços no chão e os cotovelos abaixo dos ombros.', 'Tire o corpo do chão, sustentando o peso nos antebraços e nas pontas dos pés.', 'Mantenha o corpo em linha reta da cabeça aos calcanhares.', 'Contraia abdômen e glúteos para dar estabilidade.', 'Mantenha a posição pelo tempo indicado e depois desça até o chão.']::text[],
  breathing = 'Respire de forma lenta e constante durante a permanência.',
  common_mistakes = array['Deixar o quadril cair ou subir', 'Arquear as costas', 'Não contrair o abdômen']::text[],
  instructions = 'Deite-se de bruços, apoiando os antebraços no chão e os cotovelos abaixo dos ombros.
Tire o corpo do chão, sustentando o peso nos antebraços e nas pontas dos pés.
Mantenha o corpo em linha reta da cabeça aos calcanhares.
Contraia abdômen e glúteos para dar estabilidade.
Mantenha a posição pelo tempo indicado e depois desça até o chão.',
  content_pt_ready = true
where slug = 'front-plank-0464';

update public.exercises set
  description = 'Variação avançada de barra fixa com pegada paralela à barra, que enfatiza costas, bíceps e força de preensão.',
  steps = array['Fique embaixo da barra fixa e segure-a com as mãos voltadas uma para a outra, uma à frente da outra.', 'Fique pendurado com o corpo de lado, de modo que a barra fique exatamente à frente do seu rosto.', 'Firme o abdômen e puxe o corpo, levando a cabeça para um dos lados da barra.', 'Desça com controle até a posição inicial.', 'Repita, levando a cabeça para o lado oposto na repetição seguinte.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Perder o controle embaixo', 'Deixar o corpo balançar', 'Não passar o queixo pelo lado da barra', 'Puxar com força desigual entre os lados']::text[],
  instructions = 'Fique embaixo da barra fixa e segure-a com as mãos voltadas uma para a outra, uma à frente da outra.
Fique pendurado com o corpo de lado, de modo que a barra fique exatamente à frente do seu rosto.
Firme o abdômen e puxe o corpo, levando a cabeça para um dos lados da barra.
Desça com controle até a posição inicial.
Repita, levando a cabeça para o lado oposto na repetição seguinte.',
  content_pt_ready = true
where slug = 'commando-pull-up-drv-commando-pull-up';

update public.exercises set
  description = 'Rotação de tronco sentado com os braços estendidos, voltada aos oblíquos e à estabilidade do core.',
  steps = array['Sente-se com os joelhos flexionados e os pés apoiados no chão ou suspensos.', 'Estenda os braços à frente, com as mãos unidas.', 'Incline o tronco um pouco para trás, mantendo a coluna neutra.', 'Gire o tronco para um lado, deixando os braços acompanharem o movimento.', 'Volte ao centro e repita para o lado oposto.']::text[],
  breathing = 'Expire ao girar e inspire ao voltar ao centro.',
  common_mistakes = array['Usar apenas os braços em vez de girar o tronco', 'Arredondar a coluna', 'Mover-se rápido demais ou sem controle']::text[],
  instructions = 'Sente-se com os joelhos flexionados e os pés apoiados no chão ou suspensos.
Estenda os braços à frente, com as mãos unidas.
Incline o tronco um pouco para trás, mantendo a coluna neutra.
Gire o tronco para um lado, deixando os braços acompanharem o movimento.
Volte ao centro e repita para o lado oposto.',
  content_pt_ready = true
where slug = 'seated-straight-arm-twist-1011';

update public.exercises set
  description = 'Exercício clássico do Pilates com bombeio ritmado dos braços e contração do abdômen.',
  steps = array['Deite-se de costas, com as pernas em cadeirinha ou estendidas.', 'Tire a cabeça, o pescoço e os ombros do colchonete.', 'Estenda os braços ao lado do corpo, suspensos acima do chão.', 'Bombeie os braços para cima e para baixo com energia.', 'Inspire ao longo de 5 bombeios e expire ao longo de 5; repita até completar 100.']::text[],
  breathing = 'Inspire em 5 bombeios, expire em 5 e mantenha o ciclo.',
  common_mistakes = array['Tensionar o pescoço', 'Arquear a lombar', 'Respiração rápida e curta']::text[],
  instructions = 'Deite-se de costas, com as pernas em cadeirinha ou estendidas.
Tire a cabeça, o pescoço e os ombros do colchonete.
Estenda os braços ao lado do corpo, suspensos acima do chão.
Bombeie os braços para cima e para baixo com energia.
Inspire ao longo de 5 bombeios e expire ao longo de 5; repita até completar 100.',
  content_pt_ready = true
where slug = 'pilates-hundred-drv-hundred-pilates';

update public.exercises set
  description = 'O mergulho no banco é um exercício com o peso do corpo voltado ao tríceps, descendo e subindo o corpo com apoio em um banco.',
  steps = array['Sente-se no banco e apoie as mãos ao lado do quadril, segurando a borda.', 'Estenda as pernas à frente, com os calcanhares no chão.', 'Deslize o quadril para fora do banco, sustentando o peso nos braços.', 'Desça o corpo flexionando os cotovelos até cerca de 90 graus.', 'Empurre com as palmas, estenda os cotovelos e volte ao início.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os cotovelos abrirem para os lados', 'Encolher os ombros para cima', 'Descer o quadril demais']::text[],
  instructions = 'Sente-se no banco e apoie as mãos ao lado do quadril, segurando a borda.
Estenda as pernas à frente, com os calcanhares no chão.
Deslize o quadril para fora do banco, sustentando o peso nos braços.
Desça o corpo flexionando os cotovelos até cerca de 90 graus.
Empurre com as palmas, estenda os cotovelos e volte ao início.',
  content_pt_ready = true
where slug = 'bench-dips-drv-bench-dips';

update public.exercises set
  description = 'Abdominal com o peso do corpo que eleva o quadril em direção ao peito, com foco na parte inferior do abdômen.',
  steps = array['Deite-se de costas, com os braços ao lado do corpo, os joelhos flexionados e os pés fora do chão.', 'Contraia o abdômen e eleve as pernas, levando os joelhos em direção ao peito.', 'Tire o quadril do chão em um movimento de enrolamento.', 'Faça uma pausa no alto e contraia o abdômen.', 'Desça o quadril devagar, mantendo o controle.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer.',
  common_mistakes = array['Usar o impulso para balançar as pernas', 'Não controlar a descida', 'Deixar a lombar arquear e sair do chão']::text[],
  instructions = 'Deite-se de costas, com os braços ao lado do corpo, os joelhos flexionados e os pés fora do chão.
Contraia o abdômen e eleve as pernas, levando os joelhos em direção ao peito.
Tire o quadril do chão em um movimento de enrolamento.
Faça uma pausa no alto e contraia o abdômen.
Desça o quadril devagar, mantendo o controle.',
  content_pt_ready = true
where slug = 'reverse-crunch-0872';

update public.exercises set
  description = 'Variação de flexão com as mãos próximas, para enfatizar a participação do tríceps.',
  steps = array['Comece em prancha, com as mãos próximas uma da outra abaixo do peito.', 'Mantenha o abdômen firme e o corpo em linha reta.', 'Desça o peito em direção às mãos, com os cotovelos junto ao corpo.', 'Faça uma breve pausa embaixo, sem tocar o chão.', 'Empurre até a posição inicial.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os cotovelos abrirem', 'Deixar o quadril afundar', 'Mãos muito afastadas']::text[],
  instructions = 'Comece em prancha, com as mãos próximas uma da outra abaixo do peito.
Mantenha o abdômen firme e o corpo em linha reta.
Desça o peito em direção às mãos, com os cotovelos junto ao corpo.
Faça uma breve pausa embaixo, sem tocar o chão.
Empurre até a posição inicial.',
  content_pt_ready = true
where slug = 'close-grip-push-up-0259';

update public.exercises set
  description = 'Desenvolvimento com halteres feito um braço por vez, para trabalhar os deltoides e os músculos estabilizadores.',
  steps = array['Segure os halteres na altura dos ombros, com as palmas voltadas para frente.', 'Firme o abdômen e empurre um halter para cima da cabeça até estender totalmente o braço.', 'Desça esse halter até a altura do ombro enquanto empurra o outro para cima.', 'Continue alternando os braços a cada repetição.', 'Mantenha a postura ereta e evite arquear as costas.']::text[],
  breathing = 'Expire ao empurrar para cima e inspire ao descer.',
  common_mistakes = array['Inclinar o tronco para o lado', 'Empurrar os dois halteres ao mesmo tempo', 'Encolher os ombros']::text[],
  instructions = 'Segure os halteres na altura dos ombros, com as palmas voltadas para frente.
Firme o abdômen e empurre um halter para cima da cabeça até estender totalmente o braço.
Desça esse halter até a altura do ombro enquanto empurra o outro para cima.
Continue alternando os braços a cada repetição.
Mantenha a postura ereta e evite arquear as costas.',
  content_pt_ready = true
where slug = 'dumbbell-alternating-shoulder-press-0361';

update public.exercises set
  description = 'Flexão feita com as mãos elevadas para aumentar a amplitude e enfatizar a parte inferior do peito.',
  steps = array['Apoie as mãos em superfícies elevadas, na largura dos ombros.', 'Assuma a posição de prancha, com o abdômen firme e o corpo alinhado.', 'Desça o peito entre as mãos, passando abaixo do nível delas.', 'Faça uma pausa embaixo, sentindo o peito alongar bem.', 'Empurre com força até estender os braços.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar o quadril afundar', 'Abrir demais os cotovelos', 'Não descer o suficiente', 'Deixar os ombros arredondarem para frente']::text[],
  instructions = 'Apoie as mãos em superfícies elevadas, na largura dos ombros.
Assuma a posição de prancha, com o abdômen firme e o corpo alinhado.
Desça o peito entre as mãos, passando abaixo do nível delas.
Faça uma pausa embaixo, sentindo o peito alongar bem.
Empurre com força até estender os braços.',
  content_pt_ready = true
where slug = 'deep-push-up-1274';

update public.exercises set
  description = 'Movimento de empurrar voltado aos ombros, feito sentado com halteres.',
  steps = array['Sente-se em um banco com apoio para as costas e os pés inteiros no chão.', 'Segure os halteres na altura dos ombros, com os cotovelos flexionados.', 'Empurre os halteres para cima da cabeça até estender os braços.', 'Faça uma breve pausa no alto.', 'Desça os halteres até a posição inicial.']::text[],
  breathing = 'Expire ao empurrar para cima e inspire ao descer.',
  common_mistakes = array['Arquear demais as costas', 'Descer os pesos rápido demais', 'Deixar os cotovelos descerem demais', 'Empurrar os pesos à frente do corpo']::text[],
  instructions = 'Sente-se em um banco com apoio para as costas e os pés inteiros no chão.
Segure os halteres na altura dos ombros, com os cotovelos flexionados.
Empurre os halteres para cima da cabeça até estender os braços.
Faça uma breve pausa no alto.
Desça os halteres até a posição inicial.',
  content_pt_ready = true
where slug = 'seated-dumbbell-shoulder-press-0289';

update public.exercises set
  description = 'Agachamento com a carga à frente, segurando um halter no peito, para trabalhar quadríceps, glúteos e pernas em um agachamento profundo e controlado.',
  steps = array['Fique em pé com os pés mais ou menos na largura dos ombros e segure um halter na vertical junto ao peito, com as duas mãos.', 'Firme o abdômen e mantenha os cotovelos apontados para baixo, perto do corpo.', 'Leve o quadril para baixo e para trás flexionando os joelhos e desça até as coxas ficarem paralelas ao chão ou um pouco abaixo.', 'Mantenha o halter junto ao peito e os pés inteiros no chão, com os joelhos acompanhando a direção das pontas dos pés.', 'Empurre o chão com o pé inteiro para voltar a ficar em pé, até estender completamente quadril e joelhos.', 'Reajuste a base e repita na próxima repetição.']::text[],
  breathing = 'Inspire ao descer no agachamento e expire ao voltar a ficar em pé.',
  common_mistakes = array['Deixar o halter se afastar do peito', 'Deixar os calcanhares saírem do chão embaixo', 'Deixar os joelhos caírem para dentro durante o agachamento', 'Inclinar o peito à frente em vez de manter o tronco ereto']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura dos ombros e segure um halter na vertical junto ao peito, com as duas mãos.
Firme o abdômen e mantenha os cotovelos apontados para baixo, perto do corpo.
Leve o quadril para baixo e para trás flexionando os joelhos e desça até as coxas ficarem paralelas ao chão ou um pouco abaixo.
Mantenha o halter junto ao peito e os pés inteiros no chão, com os joelhos acompanhando a direção das pontas dos pés.
Empurre o chão com o pé inteiro para voltar a ficar em pé, até estender completamente quadril e joelhos.
Reajuste a base e repita na próxima repetição.',
  content_pt_ready = true
where slug = 'dumbbell-goblet-squat-1760';

update public.exercises set
  description = 'Remada com o peso do corpo em fitas de suspensão, puxando o peito em direção às alças com o corpo alinhado.',
  steps = array['Ajuste as fitas mais ou menos na altura do peito e fique de frente para o ponto de fixação.', 'Segure as alças com pegada por cima e caminhe com os pés à frente até o corpo ficar inclinado para trás em linha reta.', 'Firme o abdômen e mantenha os calcanhares apoiados, com os braços totalmente estendidos.', 'Puxe o peito em direção às alças levando os cotovelos para trás e aproximando as escápulas.', 'Faça uma breve pausa quando as mãos chegarem às costelas ou ao peito.', 'Desça com controle até estender os braços novamente.']::text[],
  breathing = 'Inspire ao se afastar das alças e expire ao puxar o peito em direção a elas.',
  common_mistakes = array['Deixar o quadril afundar ou subir, em vez de manter o corpo alinhado', 'Encolher os ombros em direção às orelhas', 'Puxar com os punhos dobrados e as alças frouxas', 'Deixar o corpo cair rápido na descida']::text[],
  instructions = 'Ajuste as fitas mais ou menos na altura do peito e fique de frente para o ponto de fixação.
Segure as alças com pegada por cima e caminhe com os pés à frente até o corpo ficar inclinado para trás em linha reta.
Firme o abdômen e mantenha os calcanhares apoiados, com os braços totalmente estendidos.
Puxe o peito em direção às alças levando os cotovelos para trás e aproximando as escápulas.
Faça uma breve pausa quando as mãos chegarem às costelas ou ao peito.
Desça com controle até estender os braços novamente.',
  content_pt_ready = true
where slug = 'inverted-row-with-straps-0498';

update public.exercises set
  description = 'Exercício avançado com roda abdominal que alonga e fortalece abdômen, peito, ombros e costas.',
  steps = array['Fique em pé com os pés na largura dos ombros e segure a roda abdominal.', 'Incline o tronco à frente e apoie a roda no chão, à frente dos pés.', 'Role a roda para frente, estendendo braços e tronco, mantendo o abdômen firme.', 'Desça o corpo até ficar bem próximo do chão, mantendo a linha reta da cabeça aos calcanhares.', 'Volte o movimento puxando a roda de volta em direção aos pés, retornando ao início.']::text[],
  breathing = 'Inspire ao levar a roda à frente e expire ao puxá-la de volta.',
  common_mistakes = array['Deixar a lombar arquear demais', 'Deixar o quadril afundar', 'Flexionar os cotovelos durante o movimento']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros e segure a roda abdominal.
Incline o tronco à frente e apoie a roda no chão, à frente dos pés.
Role a roda para frente, estendendo braços e tronco, mantendo o abdômen firme.
Desça o corpo até ficar bem próximo do chão, mantendo a linha reta da cabeça aos calcanhares.
Volte o movimento puxando a roda de volta em direção aos pés, retornando ao início.',
  content_pt_ready = true
where slug = 'standing-wheel-rollout-0796';

update public.exercises set
  description = 'Movimento com o peso do corpo que isola o tríceps estendendo os cotovelos de bruços.',
  steps = array['Deite-se de bruços no chão ou no banco, com os cotovelos flexionados e as mãos ao lado do corpo.', 'Mantenha os cotovelos junto ao tronco.', 'Estenda totalmente os braços para trás, contraindo o tríceps.', 'Faça uma pausa e contraia no ponto de extensão total.', 'Volte ao início de forma controlada.']::text[],
  breathing = 'Expire ao estender os braços e inspire ao voltar.',
  common_mistakes = array['Usar o impulso do corpo', 'Não chegar à extensão completa', 'Deixar os cotovelos abrirem para os lados']::text[],
  instructions = 'Deite-se de bruços no chão ou no banco, com os cotovelos flexionados e as mãos ao lado do corpo.
Mantenha os cotovelos junto ao tronco.
Estenda totalmente os braços para trás, contraindo o tríceps.
Faça uma pausa e contraia no ponto de extensão total.
Volte ao início de forma controlada.',
  content_pt_ready = true
where slug = 'old-school-reverse-extensions-drv-old-school-reverse-extensions';

update public.exercises set
  description = 'Remada voltada aos músculos das costas, feita com o tronco inclinado e o abdômen firme.',
  steps = array['Fique em pé com os pés na largura dos ombros, segurando os halteres.', 'Incline o tronco a partir do quadril, mantendo as costas retas e o peito erguido.', 'Deixe os braços pendidos, com as palmas voltadas uma para a outra.', 'Puxe os halteres em direção às laterais do corpo, com os cotovelos próximos ao tronco.', 'Desça os pesos com controle até a posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Arredondar as costas', 'Dar trancos com os pesos', 'Não estender totalmente os braços', 'Puxar demais com o bíceps']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros, segurando os halteres.
Incline o tronco a partir do quadril, mantendo as costas retas e o peito erguido.
Deixe os braços pendidos, com as palmas voltadas uma para a outra.
Puxe os halteres em direção às laterais do corpo, com os cotovelos próximos ao tronco.
Desça os pesos com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-bent-over-row-0293';

update public.exercises set
  description = 'Variação de flexão com rotação do tronco, que desafia peito, ombros, tríceps e core.',
  steps = array['Comece na posição tradicional de flexão.', 'Desça o peito em direção ao chão.', 'Ao subir, gire o tronco e eleve um dos braços em direção ao teto.', 'Mantenha por um instante, com o quadril alinhado.', 'Volte ao início e repita do outro lado.']::text[],
  breathing = 'Expire ao subir e girar, inspire ao descer.',
  common_mistakes = array['Deixar o quadril afundar', 'Girar rápido demais', 'Perder o alinhamento dos ombros']::text[],
  instructions = 'Comece na posição tradicional de flexão.
Desça o peito em direção ao chão.
Ao subir, gire o tronco e eleve um dos braços em direção ao teto.
Mantenha por um instante, com o quadril alinhado.
Volte ao início e repita do outro lado.',
  content_pt_ready = true
where slug = 'rotational-push-up-drv-rotate-push-up-female';

update public.exercises set
  description = 'Exercício de core feito pendurado na barra, elevando as pernas estendidas para trabalhar abdômen e flexores do quadril.',
  steps = array['Pendure-se na barra fixa com os braços totalmente estendidos.', 'Mantenha as pernas juntas e estendidas.', 'Contraia o abdômen e eleve as pernas até a linha paralela ou mais alto.', 'Faça uma breve pausa no alto.', 'Desça as pernas com controle até a posição inicial.']::text[],
  breathing = 'Expire ao elevar as pernas e inspire ao descer.',
  common_mistakes = array['Balançar o corpo', 'Usar o impulso', 'Flexionar os joelhos ou arquear as costas']::text[],
  instructions = 'Pendure-se na barra fixa com os braços totalmente estendidos.
Mantenha as pernas juntas e estendidas.
Contraia o abdômen e eleve as pernas até a linha paralela ou mais alto.
Faça uma breve pausa no alto.
Desça as pernas com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'hanging-straight-leg-raise-0474';

update public.exercises set
  description = 'Exercício com o peso do corpo voltado ao tríceps, descendo e subindo o corpo em um movimento de empurrar.',
  steps = array['Sente-se em um banco ou cadeira segurando a borda com as mãos.', 'Estenda as pernas à frente e deslize o quadril para fora do assento.', 'Desça o corpo flexionando os cotovelos até 90 graus.', 'Empurre com as palmas para estender os braços e subir o corpo.', 'Repita pelo número de repetições indicado.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os ombros rolarem para frente', 'Descer o quadril demais', 'Abrir os cotovelos para os lados']::text[],
  instructions = 'Sente-se em um banco ou cadeira segurando a borda com as mãos.
Estenda as pernas à frente e deslize o quadril para fora do assento.
Desça o corpo flexionando os cotovelos até 90 graus.
Empurre com as palmas para estender os braços e subir o corpo.
Repita pelo número de repetições indicado.',
  content_pt_ready = true
where slug = 'triceps-dips-drv-triceps-dips';

update public.exercises set
  description = 'Levantamento com dois halteres baseado na dobradiça de quadril, que trabalha glúteos, posteriores da coxa e lombar.',
  steps = array['Fique em pé com os pés entre a largura do quadril e a dos ombros, segurando um halter em cada mão à frente das coxas.', 'Firme o abdômen, leve os ombros para trás e mantenha os braços estendidos.', 'Leve o quadril para trás e flexione levemente os joelhos enquanto desliza os halteres para baixo, perto das pernas.', 'Desça até os halteres chegarem mais ou menos ao meio da canela ou logo abaixo dos joelhos, mantendo as costas retas.', 'Empurre o chão com os pés e leve o quadril à frente para voltar a ficar em pé, com os halteres nas coxas.', 'Termine ereto, com quadril e joelhos estendidos, e repita o movimento.']::text[],
  breathing = 'Inspire ao descer os halteres com controle e expire ao empurrar o chão para subir.',
  common_mistakes = array['Arredondar a lombar ao descer os halteres', 'Deixar os halteres se afastarem muito à frente das pernas', 'Agachar direto para baixo em vez de levar o quadril para trás', 'Travar os joelhos rígidos ou flexioná-los demais']::text[],
  instructions = 'Fique em pé com os pés entre a largura do quadril e a dos ombros, segurando um halter em cada mão à frente das coxas.
Firme o abdômen, leve os ombros para trás e mantenha os braços estendidos.
Leve o quadril para trás e flexione levemente os joelhos enquanto desliza os halteres para baixo, perto das pernas.
Desça até os halteres chegarem mais ou menos ao meio da canela ou logo abaixo dos joelhos, mantendo as costas retas.
Empurre o chão com os pés e leve o quadril à frente para voltar a ficar em pé, com os halteres nas coxas.
Termine ereto, com quadril e joelhos estendidos, e repita o movimento.',
  content_pt_ready = true
where slug = 'dumbbell-deadlift-0300';

update public.exercises set
  description = 'Puxada vertical que enfatiza o dorsal e o bíceps, com pegada fechada e supinada.',
  steps = array['Segure a barra fixa com pegada por baixo, com as mãos na largura dos ombros ou um pouco mais fechadas.', 'Fique pendurado com os braços totalmente estendidos e contraia abdômen e costas.', 'Puxe o peito em direção à barra levando os cotovelos para baixo e para trás.', 'Passe o queixo da barra e faça uma breve pausa no alto.', 'Desça com controle até estender totalmente os braços.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Abrir os cotovelos para os lados', 'Amplitude de movimento parcial']::text[],
  instructions = 'Segure a barra fixa com pegada por baixo, com as mãos na largura dos ombros ou um pouco mais fechadas.
Fique pendurado com os braços totalmente estendidos e contraia abdômen e costas.
Puxe o peito em direção à barra levando os cotovelos para baixo e para trás.
Passe o queixo da barra e faça uma breve pausa no alto.
Desça com controle até estender totalmente os braços.',
  content_pt_ready = true
where slug = 'close-grip-chin-up-2987';

update public.exercises set
  description = 'Exercício de core em que pernas e quadril são elevados deitado em um banco inclinado, com foco na parte inferior do abdômen.',
  steps = array['Deite-se de costas em um banco inclinado e segure as alças atrás da cabeça.', 'Estenda as pernas e mantenha-as juntas.', 'Eleve as pernas em direção ao peito, tirando o quadril do banco.', 'Faça uma pausa no alto, concentrando a contração no abdômen.', 'Desça as pernas com controle até a posição inicial.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer as pernas.',
  common_mistakes = array['Balançar as pernas', 'Arquear demais a lombar', 'Não completar a elevação do quadril']::text[],
  instructions = 'Deite-se de costas em um banco inclinado e segure as alças atrás da cabeça.
Estenda as pernas e mantenha-as juntas.
Eleve as pernas em direção ao peito, tirando o quadril do banco.
Faça uma pausa no alto, concentrando a contração no abdômen.
Desça as pernas com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'incline-leg-hip-raise-0325';

update public.exercises set
  description = 'Exercício de core do Pilates em que as pernas desenham um círculo, desafiando a estabilidade abdominal.',
  steps = array['Deite-se de costas, com os braços ao lado do corpo e as pernas estendidas para cima.', 'Contraia o abdômen e tire o quadril do colchonete com suavidade.', 'Faça um círculo com as pernas juntas no sentido horário.', 'Desça o quadril enquanto as pernas completam o círculo.', 'Inverta o sentido do círculo.']::text[],
  breathing = 'Expire ao circular as pernas e inspire para se preparar.',
  common_mistakes = array['Arquear a lombar', 'Balançar as pernas', 'Prender a respiração']::text[],
  instructions = 'Deite-se de costas, com os braços ao lado do corpo e as pernas estendidas para cima.
Contraia o abdômen e tire o quadril do colchonete com suavidade.
Faça um círculo com as pernas juntas no sentido horário.
Desça o quadril enquanto as pernas completam o círculo.
Inverta o sentido do círculo.',
  content_pt_ready = true
where slug = 'pilates-corkscrew-drv-corkscrew-pilates';

update public.exercises set
  description = 'Exercício de core pendurado na barra em que você eleva os joelhos e enrola o quadril para cima, trabalhando abdômen e flexores do quadril.',
  steps = array['Pendure-se na barra com as duas mãos e deixe o corpo se estabilizar totalmente suspenso.', 'Leve as costelas para baixo e firme o abdômen para evitar balanço excessivo.', 'Flexione os joelhos e leve-os em direção ao peito, enrolando o quadril para cima.', 'Suba até as coxas ficarem pelo menos paralelas ao chão ou os joelhos alcançarem a altura do quadril.', 'Faça uma breve pausa no alto, mantendo o tronco estável.', 'Desça as pernas com controle até voltar à suspensão completa.']::text[],
  breathing = 'Expire ao elevar os joelhos e enrolar o quadril; inspire ao descer de volta à suspensão.',
  common_mistakes = array['Balançar o corpo para iniciar cada repetição', 'Encolher os ombros em direção às orelhas', 'Deixar as pernas caírem rápido na descida', 'Elevar os joelhos só até a metade, sem enrolar o quadril']::text[],
  instructions = 'Pendure-se na barra com as duas mãos e deixe o corpo se estabilizar totalmente suspenso.
Leve as costelas para baixo e firme o abdômen para evitar balanço excessivo.
Flexione os joelhos e leve-os em direção ao peito, enrolando o quadril para cima.
Suba até as coxas ficarem pelo menos paralelas ao chão ou os joelhos alcançarem a altura do quadril.
Faça uma breve pausa no alto, mantendo o tronco estável.
Desça as pernas com controle até voltar à suspensão completa.',
  content_pt_ready = true
where slug = 'hanging-leg-hip-raise-1764';

update public.exercises set
  description = 'Variação de abdominal com rotação, que aciona os oblíquos e a parte superior do abdômen.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés inteiros no chão.', 'Apoie as mãos levemente atrás da cabeça.', 'Suba o tronco girando, levando um ombro em direção ao joelho oposto.', 'Volte ao início e repita para o outro lado.', 'Alterne os lados a cada repetição.']::text[],
  breathing = 'Expire ao subir e girar, inspire ao voltar.',
  common_mistakes = array['Puxar a cabeça ou o pescoço', 'Girar pouco o tronco', 'Tirar a lombar do chão']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés inteiros no chão.
Apoie as mãos levemente atrás da cabeça.
Suba o tronco girando, levando um ombro em direção ao joelho oposto.
Volte ao início e repita para o outro lado.
Alterne os lados a cada repetição.',
  content_pt_ready = true
where slug = 'twisting-crunch-0985';

update public.exercises set
  description = 'Prancha de fortalecimento do core feita de lado, que aciona os oblíquos e estabiliza os músculos do quadril.',
  steps = array['Deite-se de lado, com o cotovelo alinhado abaixo do ombro.', 'Sobreponha os pés ou coloque um à frente do outro.', 'Eleve o quadril para formar uma linha reta.', 'Mantenha o corpo alinhado, com abdômen e glúteos contraídos.', 'Desça o quadril com suavidade para terminar e troque de lado.']::text[],
  breathing = 'Respire de forma constante durante a permanência.',
  common_mistakes = array['Deixar o quadril cair', 'Deixar o ombro afundar para dentro', 'Girar a parte superior do corpo']::text[],
  instructions = 'Deite-se de lado, com o cotovelo alinhado abaixo do ombro.
Sobreponha os pés ou coloque um à frente do outro.
Eleve o quadril para formar uma linha reta.
Mantenha o corpo alinhado, com abdômen e glúteos contraídos.
Desça o quadril com suavidade para terminar e troque de lado.',
  content_pt_ready = true
where slug = 'side-plank-0705';

update public.exercises set
  description = 'Desenvolvimento sentado com halteres que gira as palmas: voltadas para você embaixo e para frente acima da cabeça.',
  steps = array['Sente-se ereto em um banco com apoio para as costas e apoie os pés no chão.', 'Segure um halter em cada mão à frente dos ombros, com as palmas voltadas para você e os cotovelos flexionados.', 'Firme o abdômen e empurre os halteres para cima girando as palmas para fora.', 'Termine acima da cabeça com os braços estendidos e as palmas voltadas para frente.', 'Desça os halteres com controle girando as palmas de volta para você.', 'Volte ao início com os halteres à frente dos ombros e repita.']::text[],
  breathing = 'Inspire embaixo, expire ao empurrar e girar acima da cabeça e inspire ao descer.',
  common_mistakes = array['Arquear a lombar ao levar os halteres acima da cabeça', 'Deixar os cotovelos abrirem totalmente para os lados embaixo', 'Empurrar os halteres sem girar as mãos', 'Descer os halteres rápido demais e perder o controle']::text[],
  instructions = 'Sente-se ereto em um banco com apoio para as costas e apoie os pés no chão.
Segure um halter em cada mão à frente dos ombros, com as palmas voltadas para você e os cotovelos flexionados.
Firme o abdômen e empurre os halteres para cima girando as palmas para fora.
Termine acima da cabeça com os braços estendidos e as palmas voltadas para frente.
Desça os halteres com controle girando as palmas de volta para você.
Volte ao início com os halteres à frente dos ombros e repita.',
  content_pt_ready = true
where slug = 'dumbbell-arnold-press-2137';

update public.exercises set
  description = 'Variação de barra fixa com pegada aberta e por cima, que enfatiza a parte superior do dorsal e das costas.',
  steps = array['Segure a barra fixa com as mãos mais afastadas que os ombros e as palmas voltadas para frente.', 'Fique pendurado com os braços totalmente estendidos e o abdômen firme.', 'Puxe o peito até a barra, levando os cotovelos para baixo e para fora.', 'Faça uma pausa no alto e contraia os músculos das costas.', 'Desça devagar até a extensão completa.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Repetições parciais', 'Usar o impulso', 'Encolher os ombros']::text[],
  instructions = 'Segure a barra fixa com as mãos mais afastadas que os ombros e as palmas voltadas para frente.
Fique pendurado com os braços totalmente estendidos e o abdômen firme.
Puxe o peito até a barra, levando os cotovelos para baixo e para fora.
Faça uma pausa no alto e contraia os músculos das costas.
Desça devagar até a extensão completa.',
  content_pt_ready = true
where slug = 'pull-up-wide-grip-1429';

update public.exercises set
  description = 'Puxada vertical com o peso do corpo e as palmas voltadas para você, que enfatiza dorsal e bíceps.',
  steps = array['Segure a barra com as palmas voltadas para você (pegada supinada), com as mãos na largura dos ombros.', 'Fique pendurado com os braços totalmente estendidos e as escápulas ativas.', 'Puxe o peito em direção à barra, conduzindo o movimento pelos cotovelos.', 'Passe o queixo acima da barra e contraia no alto.', 'Desça com controle até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Não estender os braços', 'Usar o impulso', 'Esticar o pescoço para passar da barra']::text[],
  instructions = 'Segure a barra com as palmas voltadas para você (pegada supinada), com as mãos na largura dos ombros.
Fique pendurado com os braços totalmente estendidos e as escápulas ativas.
Puxe o peito em direção à barra, conduzindo o movimento pelos cotovelos.
Passe o queixo acima da barra e contraia no alto.
Desça com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'reverse-grip-pull-up-2327';

update public.exercises set
  description = 'Exercício de isolamento do peito feito deitado, abrindo bem os braços com halteres e voltando a uni-los em arco sobre o peito.',
  steps = array['Deite-se em um banco reto segurando um halter em cada mão e apoie os pés no chão.', 'Leve os halteres acima do peito com as palmas voltadas uma para a outra e os cotovelos levemente flexionados.', 'Abra os dois braços para os lados em um arco amplo até os cotovelos chegarem mais ou menos à altura do peito.', 'Faça uma breve pausa embaixo, mantendo a mesma flexão de cotovelo.', 'Contraia o peito e volte a unir os halteres acima do peito, pelo mesmo arco.']::text[],
  breathing = 'Inspire ao abrir os halteres para os lados e expire ao uni-los novamente acima do peito.',
  common_mistakes = array['Flexionar e estender os cotovelos como em um supino', 'Descer os halteres muito abaixo da linha do peito', 'Unir os halteres projetando os ombros para frente', 'Deixar os braços caírem rápido em vez de controlar o arco']::text[],
  instructions = 'Deite-se em um banco reto segurando um halter em cada mão e apoie os pés no chão.
Leve os halteres acima do peito com as palmas voltadas uma para a outra e os cotovelos levemente flexionados.
Abra os dois braços para os lados em um arco amplo até os cotovelos chegarem mais ou menos à altura do peito.
Faça uma breve pausa embaixo, mantendo a mesma flexão de cotovelo.
Contraia o peito e volte a unir os halteres acima do peito, pelo mesmo arco.',
  content_pt_ready = true
where slug = 'dumbbell-fly-0308';

update public.exercises set
  description = 'Exercício de core com o peso do corpo nas barras paralelas, em que você eleva as pernas estendidas à frente com controle.',
  steps = array['Sustente-se nas barras paralelas com os braços estendidos e as pernas penduradas e juntas.', 'Leve os ombros para baixo e firme o abdômen para o corpo não balançar.', 'Mantenha os joelhos estendidos e eleve as pernas à frente do corpo.', 'Suba as pernas até a altura do quadril ou um pouco acima.', 'Faça uma breve pausa no alto, sem inclinar o tronco para trás.', 'Desça as pernas com controle até o início e reajuste a posição antes da próxima repetição.']::text[],
  breathing = 'Expire ao elevar as pernas e inspire ao descê-las de volta ao início.',
  common_mistakes = array['Balançar o tronco para iniciar cada repetição', 'Flexionar os joelhos durante a subida das pernas', 'Encolher os ombros em direção às orelhas', 'Deixar as pernas caírem rápido na descida']::text[],
  instructions = 'Sustente-se nas barras paralelas com os braços estendidos e as pernas penduradas e juntas.
Leve os ombros para baixo e firme o abdômen para o corpo não balançar.
Mantenha os joelhos estendidos e eleve as pernas à frente do corpo.
Suba as pernas até a altura do quadril ou um pouco acima.
Faça uma breve pausa no alto, sem inclinar o tronco para trás.
Desça as pernas com controle até o início e reajuste a posição antes da próxima repetição.',
  content_pt_ready = true
where slug = 'vertical-leg-raise-on-parallel-bars-0826';

update public.exercises set
  description = 'Variação de agachamento com foco no quadríceps, feita na ponta dos pés com o tronco inclinado para trás e carga adicional.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril e segure a carga com firmeza à frente do peito ou apoiada na parte alta das costas.', 'Suba na ponta dos pés e firme o abdômen.', 'Incline o tronco para trás mantendo uma linha reta dos joelhos aos ombros, enquanto os joelhos avançam à frente.', 'Desça com controle flexionando os joelhos até sentir um alongamento forte na frente das coxas.', 'Empurre com a parte da frente dos pés e estenda os joelhos para voltar ao início.', 'Termine ereto e recupere o equilíbrio antes da próxima repetição.']::text[],
  breathing = 'Inspire ao descer com controle e expire ao subir de volta à posição inicial.',
  common_mistakes = array['Inclinar o tronco à frente a partir do quadril na descida', 'Abaixar os calcanhares e jogar o peso para trás', 'Deixar os joelhos caírem para dentro', 'Descer rápido demais e quicar para sair de baixo']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril e segure a carga com firmeza à frente do peito ou apoiada na parte alta das costas.
Suba na ponta dos pés e firme o abdômen.
Incline o tronco para trás mantendo uma linha reta dos joelhos aos ombros, enquanto os joelhos avançam à frente.
Desça com controle flexionando os joelhos até sentir um alongamento forte na frente das coxas.
Empurre com a parte da frente dos pés e estenda os joelhos para voltar ao início.
Termine ereto e recupere o equilíbrio antes da próxima repetição.',
  content_pt_ready = true
where slug = 'weighted-sissy-squat-0851';

update public.exercises set
  description = 'Abdominal com rotação feito a 45 graus, voltado aos oblíquos e ao reto abdominal.',
  steps = array['Deite-se com as mãos atrás da cabeça e as pernas estendidas para cima, em um ângulo de cerca de 45 graus.', 'Contraia o abdômen e tire os ombros do chão.', 'Gire a parte de cima do corpo levando o cotovelo direito em direção ao joelho esquerdo enquanto estende a perna direita.', 'Volte à posição inicial e repita para o lado oposto.', 'Continue alternando os lados em um movimento de rotação controlado.']::text[],
  breathing = 'Expire durante a rotação e inspire ao voltar ao centro.',
  common_mistakes = array['Puxar o pescoço', 'Usar o impulso em vez do abdômen', 'Deixar o quadril afundar']::text[],
  instructions = 'Deite-se com as mãos atrás da cabeça e as pernas estendidas para cima, em um ângulo de cerca de 45 graus.
Contraia o abdômen e tire os ombros do chão.
Gire a parte de cima do corpo levando o cotovelo direito em direção ao joelho esquerdo enquanto estende a perna direita.
Volte à posição inicial e repita para o lado oposto.
Continue alternando os lados em um movimento de rotação controlado.',
  content_pt_ready = true
where slug = '45-degree-bicycle-twisting-crunch-drv-45-degree-bycicle-twisting-crunch';

update public.exercises set
  description = 'Exercício de puxada com o peso do corpo que desenvolve a força do dorsal e da parte superior do corpo em uma barra.',
  steps = array['Fique embaixo da barra fixa e segure-a com a pegada escolhida (por cima na barra pronada, por baixo na supinada).', 'Fique pendurado com os braços totalmente estendidos e os ombros ativos.', 'Firme o abdômen e puxe o peito em direção à barra levando os cotovelos para baixo.', 'Passe o queixo ou o peito da barra enquanto contrai o dorsal.', 'Desça com controle até a posição inicial de suspensão.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Não descer até a suspensão completa', 'Chutar com as pernas ou balançar o corpo', 'Não passar o queixo acima da barra', 'Encolher os ombros']::text[],
  instructions = 'Fique embaixo da barra fixa e segure-a com a pegada escolhida (por cima na barra pronada, por baixo na supinada).
Fique pendurado com os braços totalmente estendidos e os ombros ativos.
Firme o abdômen e puxe o peito em direção à barra levando os cotovelos para baixo.
Passe o queixo ou o peito da barra enquanto contrai o dorsal.
Desça com controle até a posição inicial de suspensão.',
  content_pt_ready = true
where slug = 'pull-up-chin-up-drv-chin-ups-pull-ups';

update public.exercises set
  description = 'Exercício de isolamento do ombro em que você eleva os halteres à frente, das coxas até a altura dos ombros.',
  steps = array['Fique em pé com um halter em cada mão junto às coxas e as palmas voltadas para as pernas.', 'Firme o tronco e mantenha os cotovelos levemente flexionados.', 'Eleve os dois halteres à frente do corpo até as mãos chegarem mais ou menos à altura dos ombros.', 'Faça uma breve pausa sem encolher os ombros.', 'Desça os halteres de volta às coxas com controle.', 'Repita a partir de uma postura ereta e sem balanço.']::text[],
  breathing = 'Expire ao elevar os halteres e inspire ao descê-los com controle.',
  common_mistakes = array['Balançar os halteres para cima com o quadril ou o tronco.', 'Elevar os pesos acima da altura dos ombros.', 'Encolher os ombros em direção às orelhas.', 'Flexionar mais os cotovelos durante a subida.']::text[],
  instructions = 'Fique em pé com um halter em cada mão junto às coxas e as palmas voltadas para as pernas.
Firme o tronco e mantenha os cotovelos levemente flexionados.
Eleve os dois halteres à frente do corpo até as mãos chegarem mais ou menos à altura dos ombros.
Faça uma breve pausa sem encolher os ombros.
Desça os halteres de volta às coxas com controle.
Repita a partir de uma postura ereta e sem balanço.',
  content_pt_ready = true
where slug = 'dumbbell-front-raise-0310';

update public.exercises set
  description = 'Variação de levantamento terra stiff com um único halter, voltada aos posteriores da coxa e à lombar.',
  steps = array['Fique em pé segurando um halter com as duas mãos junto às coxas.', 'Mantenha os joelhos levemente flexionados e as costas retas.', 'Incline o tronco à frente a partir do quadril, descendo o halter em direção ao chão.', 'Faça uma pausa embaixo, sentindo alongar os posteriores da coxa.', 'Volte à posição ereta levando o quadril à frente.']::text[],
  breathing = 'Inspire ao descer e expire ao voltar a ficar em pé.',
  common_mistakes = array['Arredondar as costas', 'Flexionar demais os joelhos', 'Quicar embaixo']::text[],
  instructions = 'Fique em pé segurando um halter com as duas mãos junto às coxas.
Mantenha os joelhos levemente flexionados e as costas retas.
Incline o tronco à frente a partir do quadril, descendo o halter em direção ao chão.
Faça uma pausa embaixo, sentindo alongar os posteriores da coxa.
Volte à posição ereta levando o quadril à frente.',
  content_pt_ready = true
where slug = 'single-dumbbell-stiff-leg-deadlift-1757';

update public.exercises set
  description = 'Rosca de isolamento do braço feita sentado em banco inclinado, para ampliar o alongamento e a ativação do bíceps.',
  steps = array['Ajuste o banco entre 45 e 60 graus de inclinação e sente-se recostado com um halter em cada mão.', 'Deixe os braços totalmente estendidos ao lado do corpo, com os cotovelos próximos ao tronco.', 'Suba os halteres flexionando os cotovelos, mantendo os braços parados junto ao corpo.', 'Faça uma pausa no alto e contraia o bíceps.', 'Desça os pesos com controle até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Balançar os braços para gerar impulso', 'Deixar os cotovelos avançarem à frente', 'Amplitude de movimento parcial']::text[],
  instructions = 'Ajuste o banco entre 45 e 60 graus de inclinação e sente-se recostado com um halter em cada mão.
Deixe os braços totalmente estendidos ao lado do corpo, com os cotovelos próximos ao tronco.
Suba os halteres flexionando os cotovelos, mantendo os braços parados junto ao corpo.
Faça uma pausa no alto e contraia o bíceps.
Desça os pesos com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-incline-biceps-curl-0322';

update public.exercises set
  description = 'Exercício de isolamento do ombro em que você eleva os halteres para os lados, com foco na porção lateral do deltoide.',
  steps = array['Fique em pé com um halter em cada mão ao lado do corpo e as palmas voltadas para dentro.', 'Abaixe os ombros e firme o abdômen.', 'Eleve os dois braços para os lados até as mãos chegarem mais ou menos à altura dos ombros, mantendo os cotovelos levemente flexionados.', 'Faça uma breve pausa no alto, sem encolher os ombros.', 'Desça os halteres de volta ao lado do corpo com controle.']::text[],
  breathing = 'Expire ao elevar os halteres para os lados e inspire ao descê-los com controle.',
  common_mistakes = array['Encolher os ombros em direção às orelhas', 'Balançar o tronco para jogar os halteres para cima', 'Elevar as mãos muito acima da altura dos ombros', 'Estender totalmente os cotovelos e transformar o movimento em um balanço à frente']::text[],
  instructions = 'Fique em pé com um halter em cada mão ao lado do corpo e as palmas voltadas para dentro.
Abaixe os ombros e firme o abdômen.
Eleve os dois braços para os lados até as mãos chegarem mais ou menos à altura dos ombros, mantendo os cotovelos levemente flexionados.
Faça uma breve pausa no alto, sem encolher os ombros.
Desça os halteres de volta ao lado do corpo com controle.',
  content_pt_ready = true
where slug = 'dumbbell-lateral-raise-0334';

update public.exercises set
  description = 'Elevação com halteres e peito apoiado, voltada à porção posterior do deltoide, elevando os braços para os lados em banco inclinado.',
  steps = array['Ajuste o banco inclinado em cerca de 45 graus e segure um halter em cada mão.', 'Deite-se de bruços com o peito apoiado no banco e deixe os braços pendidos abaixo dos ombros.', 'Deixe as palmas voltadas uma para a outra e mantenha os cotovelos levemente flexionados.', 'Eleve os dois braços para os lados e um pouco para trás até a altura dos ombros.', 'Contraia a parte de trás dos ombros e a parte alta das costas no alto do movimento.', 'Desça os halteres com controle até a posição inicial.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao elevá-los para os lados.',
  common_mistakes = array['Balançar os halteres para cima com impulso', 'Encolher os ombros em direção às orelhas', 'Estender os cotovelos e transformar o movimento em uma remada aberta', 'Elevar os braços muito acima da altura dos ombros']::text[],
  instructions = 'Ajuste o banco inclinado em cerca de 45 graus e segure um halter em cada mão.
Deite-se de bruços com o peito apoiado no banco e deixe os braços pendidos abaixo dos ombros.
Deixe as palmas voltadas uma para a outra e mantenha os cotovelos levemente flexionados.
Eleve os dois braços para os lados e um pouco para trás até a altura dos ombros.
Contraia a parte de trás dos ombros e a parte alta das costas no alto do movimento.
Desça os halteres com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-incline-rear-lateral-raise-0326';

update public.exercises set
  description = 'Agachamento com um halter em cada mão ao lado do corpo, para trabalhar glúteos, quadríceps e pernas.',
  steps = array['Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura dos ombros.', 'Firme o abdômen, mantenha o peito erguido e deixe os braços estendidos.', 'Flexione quadril e joelhos ao mesmo tempo para descer e levar o quadril levemente para trás.', 'Desça até as coxas ficarem pelo menos paralelas ao chão, ou o mais baixo que conseguir mantendo os calcanhares apoiados.', 'Empurre o chão com o meio do pé e os calcanhares para voltar a ficar em pé.', 'Termine ereto, com quadril e joelhos totalmente estendidos, antes da próxima repetição.']::text[],
  breathing = 'Inspire ao descer no agachamento e expire ao voltar a ficar em pé.',
  common_mistakes = array['Deixar os joelhos caírem para dentro na descida ou na subida.', 'Subir na ponta dos pés e tirar os calcanhares do chão.', 'Arredondar a parte alta das costas ou a lombar embaixo.', 'Inclinar o peito à frente, deixando os halteres balançarem à frente das pernas.']::text[],
  instructions = 'Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura dos ombros.
Firme o abdômen, mantenha o peito erguido e deixe os braços estendidos.
Flexione quadril e joelhos ao mesmo tempo para descer e levar o quadril levemente para trás.
Desça até as coxas ficarem pelo menos paralelas ao chão, ou o mais baixo que conseguir mantendo os calcanhares apoiados.
Empurre o chão com o meio do pé e os calcanhares para voltar a ficar em pé.
Termine ereto, com quadril e joelhos totalmente estendidos, antes da próxima repetição.',
  content_pt_ready = true
where slug = 'dumbbell-squat-0413';

update public.exercises set
  description = 'Exercício sentado de rosca alternada com halteres, para desenvolver volume e força do bíceps.',
  steps = array['Sente-se com as costas apoiadas e os pés inteiros no chão.', 'Segure os halteres ao lado do corpo, com as palmas voltadas para dentro.', 'Suba um halter girando a palma para cima.', 'Desça até a posição inicial e alterne os braços.', 'Repita mantendo as costas retas e os cotovelos junto ao corpo.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Abrir os cotovelos para os lados', 'Balançar o tronco', 'Mover os dois braços ao mesmo tempo']::text[],
  instructions = 'Sente-se com as costas apoiadas e os pés inteiros no chão.
Segure os halteres ao lado do corpo, com as palmas voltadas para dentro.
Suba um halter girando a palma para cima.
Desça até a posição inicial e alterne os braços.
Repita mantendo as costas retas e os cotovelos junto ao corpo.',
  content_pt_ready = true
where slug = 'seated-alternating-dumbbell-curl-0285';

update public.exercises set
  description = 'Encolhimento com halteres e peito apoiado em banco inclinado, voltado à parte superior do trapézio com pouco impulso do corpo.',
  steps = array['Ajuste o banco inclinado em cerca de 45 graus e sente-se com o peito apoiado no encosto.', 'Segure um halter em cada mão e deixe os braços pendidos ao lado do corpo, com as palmas voltadas para dentro.', 'Apoie os pés com firmeza no chão e mantenha o peito encostado no banco.', 'Eleve os ombros em direção às orelhas sem flexionar os cotovelos.', 'Faça uma breve pausa no alto e desça os ombros com controle.', 'Repita a partir dos braços totalmente pendidos a cada repetição.']::text[],
  breathing = 'Inspire embaixo, expire ao elevar os ombros e inspire ao descê-los.',
  common_mistakes = array['Flexionar os cotovelos e transformar a repetição em uma remada', 'Girar os ombros para frente ou para trás no alto', 'Tirar o peito do banco para mover o peso', 'Usar o impulso e descer rápido entre as repetições']::text[],
  instructions = 'Ajuste o banco inclinado em cerca de 45 graus e sente-se com o peito apoiado no encosto.
Segure um halter em cada mão e deixe os braços pendidos ao lado do corpo, com as palmas voltadas para dentro.
Apoie os pés com firmeza no chão e mantenha o peito encostado no banco.
Eleve os ombros em direção às orelhas sem flexionar os cotovelos.
Faça uma breve pausa no alto e desça os ombros com controle.
Repita a partir dos braços totalmente pendidos a cada repetição.',
  content_pt_ready = true
where slug = 'dumbbell-incline-shrug-0329';

update public.exercises set
  description = 'Exercício de isolamento do peito em banco inclinado, abrindo bem os braços com halteres e voltando a uni-los com contração.',
  steps = array['Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.', 'Deite-se e leve os halteres acima da parte alta do peito, com as palmas voltadas uma para a outra.', 'Flexione levemente os cotovelos e mantenha essa flexão fixa.', 'Desça os halteres para os lados em um arco amplo até a altura do peito ou até sentir um alongamento leve no peito.', 'Contraia o peito para unir novamente os halteres acima da parte alta do peito, pelo mesmo arco.', 'Pare com os halteres quase se tocando e repita.']::text[],
  breathing = 'Inspire ao abrir os halteres para os lados e expire ao uni-los novamente acima do peito.',
  common_mistakes = array['Flexionar e estender os cotovelos como em um supino', 'Descer os halteres muito abaixo da linha do peito', 'Deixar os halteres irem para trás da linha dos ombros', 'Bater os halteres um no outro no alto']::text[],
  instructions = 'Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.
Deite-se e leve os halteres acima da parte alta do peito, com as palmas voltadas uma para a outra.
Flexione levemente os cotovelos e mantenha essa flexão fixa.
Desça os halteres para os lados em um arco amplo até a altura do peito ou até sentir um alongamento leve no peito.
Contraia o peito para unir novamente os halteres acima da parte alta do peito, pelo mesmo arco.
Pare com os halteres quase se tocando e repita.',
  content_pt_ready = true
where slug = 'dumbbell-incline-fly-0319';

update public.exercises set
  description = 'Exercício de oblíquos feito em pé, segurando um halter e inclinando o tronco para o lado com controle.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril e um halter em uma das mãos, ao lado do corpo.', 'Coloque a outra mão no quadril ou atrás da cabeça e firme o abdômen.', 'Mantenha o peito erguido e incline devagar o tronco para o lado oposto ao halter.', 'Desça o halter pela lateral da perna o máximo que conseguir, sem girar nem inclinar o tronco à frente.', 'Contraia os oblíquos e volte à posição ereta.', 'Faça todas as repetições de um lado, depois troque de mão e repita.']::text[],
  breathing = 'Inspire ao inclinar para o lado e expire ao voltar à posição ereta.',
  common_mistakes = array['Girar o tronco durante a inclinação', 'Inclinar à frente em vez de para o lado', 'Encolher o ombro que segura o peso', 'Usar o impulso para voltar a subir']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril e um halter em uma das mãos, ao lado do corpo.
Coloque a outra mão no quadril ou atrás da cabeça e firme o abdômen.
Mantenha o peito erguido e incline devagar o tronco para o lado oposto ao halter.
Desça o halter pela lateral da perna o máximo que conseguir, sem girar nem inclinar o tronco à frente.
Contraia os oblíquos e volte à posição ereta.
Faça todas as repetições de um lado, depois troque de mão e repita.',
  content_pt_ready = true
where slug = 'dumbbell-side-bend-0407';

update public.exercises set
  description = 'Exercício de membros inferiores com halter em base sumô, voltado a glúteos, quadríceps e adutores.',
  steps = array['Fique em pé com os pés bem afastados e as pontas voltadas para fora.', 'Segure o halter na vertical entre as pernas.', 'Mantenha o peito erguido e o abdômen firme.', 'Agache empurrando os joelhos para fora.', 'Empurre com os calcanhares para voltar a ficar em pé.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Arredondar as costas', 'Agachar pouco']::text[],
  instructions = 'Fique em pé com os pés bem afastados e as pontas voltadas para fora.
Segure o halter na vertical entre as pernas.
Mantenha o peito erguido e o abdômen firme.
Agache empurrando os joelhos para fora.
Empurre com os calcanhares para voltar a ficar em pé.',
  content_pt_ready = true
where slug = 'dumbbell-sumo-squat-new-dumbbell-sumo-squat';

update public.exercises set
  description = 'Supino inclinado com halteres e pegada neutra, que trabalha a parte alta do peito, os ombros e o tríceps.',
  steps = array['Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.', 'Deite-se no banco e leve os halteres à altura do peito, com as palmas voltadas uma para a outra.', 'Apoie os pés, encaixe as escápulas no banco e mantenha os punhos alinhados sobre os cotovelos.', 'Empurre os halteres para cima até estender os braços acima da parte alta do peito.', 'Desça os halteres com controle até a altura do peito, mantendo as palmas voltadas para dentro.', 'Repita o movimento sem quicar os halteres no peito ou nos ombros.']::text[],
  breathing = 'Inspire ao descer os halteres até a altura do peito e expire ao empurrá-los para cima.',
  common_mistakes = array['Abrir os cotovelos totalmente para os lados', 'Deixar os halteres irem para trás, sobre o rosto', 'Bater os halteres um no outro no alto', 'Arquear a lombar e tirar o quadril do banco']::text[],
  instructions = 'Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.
Deite-se no banco e leve os halteres à altura do peito, com as palmas voltadas uma para a outra.
Apoie os pés, encaixe as escápulas no banco e mantenha os punhos alinhados sobre os cotovelos.
Empurre os halteres para cima até estender os braços acima da parte alta do peito.
Desça os halteres com controle até a altura do peito, mantendo as palmas voltadas para dentro.
Repita o movimento sem quicar os halteres no peito ou nos ombros.',
  content_pt_ready = true
where slug = 'dumbbell-incline-hammer-press-0321';

update public.exercises set
  description = 'Exercício de isolamento dos posteriores da coxa em que um halter é preso entre os pés durante a flexão de pernas.',
  steps = array['Deite-se de bruços no banco, com as pernas estendidas e o halter preso entre os pés.', 'Segure no banco para ter estabilidade.', 'Contraia os posteriores da coxa para levar o halter em direção aos glúteos.', 'Faça uma pausa no ponto mais alto do movimento.', 'Desça o halter de forma controlada até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Deixar o quadril sair do banco', 'Deixar o halter escorregar', 'Usar o impulso']::text[],
  instructions = 'Deite-se de bruços no banco, com as pernas estendidas e o halter preso entre os pés.
Segure no banco para ter estabilidade.
Contraia os posteriores da coxa para levar o halter em direção aos glúteos.
Faça uma pausa no ponto mais alto do movimento.
Desça o halter de forma controlada até a posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-lying-leg-curl-0343';

update public.exercises set
  description = 'Exercício de panturrilha sentado com um halter sobre as coxas, que trabalha a flexão plantar do tornozelo em toda a amplitude.',
  steps = array['Sente-se em um banco ou cadeira com os joelhos flexionados e apoie a parte da frente dos pés em um pequeno degrau, deixando os calcanhares para fora.', 'Apoie um halter sobre as coxas, logo acima dos joelhos, e segure-o firme com as duas mãos.', 'Deixe os calcanhares descerem até sentir alongar a panturrilha.', 'Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo o halter estável.', 'Desça os calcanhares com controle e repita.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao subir na ponta dos pés.',
  common_mistakes = array['Quicar os calcanhares embaixo em vez de descer com controle.', 'Girar os tornozelos para dentro ou para fora durante a subida.', 'Apoiar o halter muito perto dos joelhos, deixando-o escorregar durante a série.', 'Usar uma amplitude muito curta e não descer os calcanhares abaixo do degrau.']::text[],
  instructions = 'Sente-se em um banco ou cadeira com os joelhos flexionados e apoie a parte da frente dos pés em um pequeno degrau, deixando os calcanhares para fora.
Apoie um halter sobre as coxas, logo acima dos joelhos, e segure-o firme com as duas mãos.
Deixe os calcanhares descerem até sentir alongar a panturrilha.
Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo o halter estável.
Desça os calcanhares com controle e repita.',
  content_pt_ready = true
where slug = 'dumbbell-seated-calf-raise-1379';

update public.exercises set
  description = 'Exercício de core em que o abdominal é feito sobre a bola suíça, o que aumenta a ativação do abdômen.',
  steps = array['Sente-se na bola com os pés inteiros no chão.', 'Caminhe com os pés à frente, rolando o corpo até a bola apoiar a lombar.', 'Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.', 'Contraia o abdômen e suba o tronco.', 'Desça com controle até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Tirar os pés do chão', 'Bola fora de posição, sem apoiar a lombar']::text[],
  instructions = 'Sente-se na bola com os pés inteiros no chão.
Caminhe com os pés à frente, rolando o corpo até a bola apoiar a lombar.
Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.
Contraia o abdômen e suba o tronco.
Desça com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'exercise-ball-sit-up-1338';

update public.exercises set
  description = 'Exercício de isolamento em que você segura halteres ao lado do corpo e eleva os ombros para trabalhar o trapézio.',
  steps = array['Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura do quadril.', 'Deixe os braços estendidos e pendidos, com as palmas voltadas para o corpo.', 'Eleve os ombros em direção às orelhas sem flexionar os cotovelos.', 'Faça uma breve pausa no alto, mantendo o tronco parado.', 'Desça os ombros com controle até a posição inicial e repita.']::text[],
  breathing = 'Expire ao elevar os ombros e inspire ao descê-los.',
  common_mistakes = array['Girar os ombros em círculos em vez de subir e descer em linha reta.', 'Flexionar os cotovelos e transformar o movimento em remada alta.', 'Inclinar o tronco para trás ou à frente para balançar os halteres.', 'Projetar a cabeça à frente durante a subida dos ombros.']::text[],
  instructions = 'Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura do quadril.
Deixe os braços estendidos e pendidos, com as palmas voltadas para o corpo.
Eleve os ombros em direção às orelhas sem flexionar os cotovelos.
Faça uma breve pausa no alto, mantendo o tronco parado.
Desça os ombros com controle até a posição inicial e repita.',
  content_pt_ready = true
where slug = 'dumbbell-shrug-0406';

update public.exercises set
  description = 'Exercício clássico com o peso do corpo, voltado ao dorsal e à parte alta das costas, com pegada por cima na largura dos ombros.',
  steps = array['Segure a barra na largura dos ombros, com as palmas voltadas para frente.', 'Fique pendurado com os braços totalmente estendidos.', 'Puxe o corpo até o queixo passar da barra.', 'Faça uma breve pausa no alto.', 'Desça devagar até a extensão completa.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Repetições parciais', 'Encolher os ombros']::text[],
  instructions = 'Segure a barra na largura dos ombros, com as palmas voltadas para frente.
Fique pendurado com os braços totalmente estendidos.
Puxe o corpo até o queixo passar da barra.
Faça uma breve pausa no alto.
Desça devagar até a extensão completa.',
  content_pt_ready = true
where slug = 'shoulder-width-pull-up-0651';

update public.exercises set
  description = 'Rosca de isolamento do bíceps feita deitado de costas, o que favorece a execução estrita e reduz o uso de impulso.',
  steps = array['Deite-se de costas segurando os halteres ao lado do corpo, com os braços totalmente estendidos.', 'Mantenha as palmas voltadas para frente (pegada supinada).', 'Suba os halteres em direção aos ombros, mantendo os cotovelos parados.', 'Contraia o bíceps no alto.', 'Desça os pesos devagar até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Tirar os ombros do banco', 'Balançar os braços', 'Amplitude parcial']::text[],
  instructions = 'Deite-se de costas segurando os halteres ao lado do corpo, com os braços totalmente estendidos.
Mantenha as palmas voltadas para frente (pegada supinada).
Suba os halteres em direção aos ombros, mantendo os cotovelos parados.
Contraia o bíceps no alto.
Desça os pesos devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'supine-dumbbell-biceps-curl-0350';

update public.exercises set
  description = 'Exercício de isolamento do ombro feito com um braço por vez, elevando o halter para o lado para trabalhar a porção lateral do deltoide.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril e segure um halter ao lado do corpo, com o cotovelo levemente flexionado.', 'Firme o abdômen e mantenha os ombros nivelados, deixando o braço livre relaxado ao lado do corpo ou apoiado no quadril.', 'Eleve o halter para o lado até a mão chegar mais ou menos à altura do ombro.', 'Faça uma breve pausa no alto, sem encolher o ombro em direção à orelha.', 'Desça o halter de volta ao lado do corpo com controle.', 'Faça todas as repetições com um braço e depois troque de lado.']::text[],
  breathing = 'Inspire ao descer o halter e expire ao elevá-lo para o lado.',
  common_mistakes = array['Encolher o ombro que trabalha em direção à orelha', 'Balançar ou inclinar o tronco para iniciar a subida', 'Elevar o halter acima da altura do ombro', 'Travar o cotovelo totalmente estendido']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril e segure um halter ao lado do corpo, com o cotovelo levemente flexionado.
Firme o abdômen e mantenha os ombros nivelados, deixando o braço livre relaxado ao lado do corpo ou apoiado no quadril.
Eleve o halter para o lado até a mão chegar mais ou menos à altura do ombro.
Faça uma breve pausa no alto, sem encolher o ombro em direção à orelha.
Desça o halter de volta ao lado do corpo com controle.
Faça todas as repetições com um braço e depois troque de lado.',
  content_pt_ready = true
where slug = 'dumbbell-one-arm-lateral-raise-0355';

update public.exercises set
  description = 'Exercício de isolamento do ombro em que você eleva os halteres para os lados para trabalhar os deltoides.',
  steps = array['Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura do quadril.', 'Mantenha os cotovelos levemente flexionados e as palmas voltadas para as laterais do corpo.', 'Eleve os dois braços para os lados até as mãos chegarem à altura dos ombros.', 'Faça uma breve pausa com os ombros nivelados e os punhos alinhados com os cotovelos.', 'Desça os halteres de volta ao lado do corpo com controle.', 'Repita sem balançar o tronco nem quicar os pesos.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao elevá-los para os lados.',
  common_mistakes = array['Balançar o tronco para iniciar cada repetição', 'Encolher os ombros em direção às orelhas', 'Elevar os halteres acima da altura dos ombros', 'Estender totalmente os cotovelos e travar os braços']::text[],
  instructions = 'Fique em pé com um halter em cada mão ao lado do corpo e os pés mais ou menos na largura do quadril.
Mantenha os cotovelos levemente flexionados e as palmas voltadas para as laterais do corpo.
Eleve os dois braços para os lados até as mãos chegarem à altura dos ombros.
Faça uma breve pausa com os ombros nivelados e os punhos alinhados com os cotovelos.
Desça os halteres de volta ao lado do corpo com controle.
Repita sem balançar o tronco nem quicar os pesos.',
  content_pt_ready = true
where slug = 'dumbbell-iron-cross-0332';

update public.exercises set
  description = 'Exercício de panturrilha feito em uma perna por vez, com halter e degrau, para fortalecer a panturrilha em toda a amplitude do tornozelo.',
  steps = array['Fique na borda de um degrau com um pé, apoiando a parte da frente do pé e deixando o calcanhar para fora.', 'Segure um halter em uma das mãos e apoie levemente a outra na parede ou em um corrimão.', 'Tire o pé que não trabalha do degrau e estenda a perna de apoio.', 'Empurre com a parte da frente do pé e eleve o calcanhar o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo o tornozelo alinhado sobre os dedos.', 'Desça o calcanhar devagar abaixo do nível do degrau até sentir alongar a panturrilha.', 'Faça todas as repetições de um lado e depois troque de perna.']::text[],
  breathing = 'Inspire ao descer o calcanhar e expire ao subir na ponta do pé.',
  common_mistakes = array['Quicar para sair de baixo em vez de descer com controle', 'Girar o tornozelo para dentro ou para fora durante a subida', 'Flexionar o joelho de apoio para ajudar a subir', 'Usar a mão de apoio para puxar o corpo para cima']::text[],
  instructions = 'Fique na borda de um degrau com um pé, apoiando a parte da frente do pé e deixando o calcanhar para fora.
Segure um halter em uma das mãos e apoie levemente a outra na parede ou em um corrimão.
Tire o pé que não trabalha do degrau e estenda a perna de apoio.
Empurre com a parte da frente do pé e eleve o calcanhar o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo o tornozelo alinhado sobre os dedos.
Desça o calcanhar devagar abaixo do nível do degrau até sentir alongar a panturrilha.
Faça todas as repetições de um lado e depois troque de perna.',
  content_pt_ready = true
where slug = 'dumbbell-single-leg-calf-raise-0409';

update public.exercises set
  description = 'Remada voltada às costas, feita de bruços em banco inclinado com halteres e pegada neutra.',
  steps = array['Ajuste o banco inclinado entre 30 e 45 graus e deite-se de bruços com os halteres.', 'Segure os halteres com as palmas voltadas uma para a outra (pegada neutra).', 'Puxe os halteres em direção ao quadril, com os cotovelos próximos ao corpo.', 'Faça uma pausa no alto e contraia os músculos das costas.', 'Desça os pesos devagar e com controle.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Tirar o peito do banco', 'Puxar demais com o bíceps', 'Encolher os ombros']::text[],
  instructions = 'Ajuste o banco inclinado entre 30 e 45 graus e deite-se de bruços com os halteres.
Segure os halteres com as palmas voltadas uma para a outra (pegada neutra).
Puxe os halteres em direção ao quadril, com os cotovelos próximos ao corpo.
Faça uma pausa no alto e contraia os músculos das costas.
Desça os pesos devagar e com controle.',
  content_pt_ready = true
where slug = 'dumbbell-hammer-grip-incline-bench-row-1330';

update public.exercises set
  description = 'Levantamento terra com halteres baseado na dobradiça de quadril, que enfatiza posteriores da coxa e glúteos mantendo os joelhos pouco flexionados.',
  steps = array['Fique em pé com os pés na largura do quadril, segurando um halter em cada mão à frente das coxas.', 'Flexione levemente os joelhos e firme o abdômen.', 'Leve o quadril diretamente para trás e deslize os halteres pela frente das pernas.', 'Desça até os halteres chegarem ao meio da canela ou até sentir um alongamento forte nos posteriores da coxa, mantendo as costas retas.', 'Empurre o chão com os pés e estenda o quadril para voltar a ficar em pé.', 'Termine ereto com os halteres nas coxas e repita.']::text[],
  breathing = 'Inspire ao inclinar e descer os halteres e expire ao levar o quadril à frente para ficar ereto.',
  common_mistakes = array['Flexionar demais os joelhos e transformar o movimento em agachamento', 'Deixar os halteres se afastarem das pernas', 'Arredondar a lombar na descida', 'Olhar para cima e forçar o pescoço']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril, segurando um halter em cada mão à frente das coxas.
Flexione levemente os joelhos e firme o abdômen.
Leve o quadril diretamente para trás e deslize os halteres pela frente das pernas.
Desça até os halteres chegarem ao meio da canela ou até sentir um alongamento forte nos posteriores da coxa, mantendo as costas retas.
Empurre o chão com os pés e estenda o quadril para voltar a ficar em pé.
Termine ereto com os halteres nas coxas e repita.',
  content_pt_ready = true
where slug = 'dumbbell-stiff-leg-deadlift-0432';

update public.exercises set
  description = 'Supino reto com halteres em pegada neutra, para trabalhar peito, tríceps e ombros.',
  steps = array['Deite-se em um banco reto com um halter em cada mão e leve-os acima do peito, com as palmas voltadas uma para a outra.', 'Apoie os pés no chão e firme o tronco, mantendo os punhos alinhados sobre os cotovelos.', 'Desça os halteres com controle para os lados do peito, mantendo os cotovelos levemente fechados em relação aos ombros.', 'Faça uma breve pausa quando os braços chegarem ao nível do banco ou os halteres tocarem de leve a linha do peito.', 'Empurre os halteres para cima até estender os braços acima do peito, mantendo as palmas voltadas uma para a outra.', 'Aproxime novamente os halteres acima do peito e repita.']::text[],
  breathing = 'Inspire ao descer os halteres até o peito e expire ao empurrá-los para cima.',
  common_mistakes = array['Abrir os cotovelos totalmente para os lados.', 'Deixar os halteres irem em direção ao rosto em vez de ficarem sobre o peito.', 'Dobrar os punhos para trás sob os halteres.', 'Descer rápido demais e quicar embaixo.']::text[],
  instructions = 'Deite-se em um banco reto com um halter em cada mão e leve-os acima do peito, com as palmas voltadas uma para a outra.
Apoie os pés no chão e firme o tronco, mantendo os punhos alinhados sobre os cotovelos.
Desça os halteres com controle para os lados do peito, mantendo os cotovelos levemente fechados em relação aos ombros.
Faça uma breve pausa quando os braços chegarem ao nível do banco ou os halteres tocarem de leve a linha do peito.
Empurre os halteres para cima até estender os braços acima do peito, mantendo as palmas voltadas uma para a outra.
Aproxime novamente os halteres acima do peito e repita.',
  content_pt_ready = true
where slug = 'dumbbell-lying-hammer-press-0340';

update public.exercises set
  description = 'Qualquer atividade física aeróbica voltada a elevar a frequência cardíaca e cuidar da saúde cardiovascular.',
  steps = array['Escolha uma atividade aeróbica (corrida, polichinelos, entre outras).', 'Aqueça de 3 a 5 minutos.', 'Faça a atividade escolhida em um ritmo que consiga sustentar.', 'Mantenha o movimento pelo tempo ou número de séries definido.', 'Desacelere e alongue ao final.']::text[],
  breathing = 'Respire de forma ritmada: expire no esforço mais intenso e inspire nos momentos mais leves.',
  common_mistakes = array['Forçar o ritmo cedo demais', 'Descuidar da técnica', 'Pular o aquecimento ou a volta à calma']::text[],
  instructions = 'Escolha uma atividade aeróbica (corrida, polichinelos, entre outras).
Aqueça de 3 a 5 minutos.
Faça a atividade escolhida em um ritmo que consiga sustentar.
Mantenha o movimento pelo tempo ou número de séries definido.
Desacelere e alongue ao final.',
  content_pt_ready = true
where slug = 'cardio-exercise-drv-cardio-exercises';

update public.exercises set
  description = 'Exercício de panturrilha em pé segurando halteres ao lado do corpo e elevando os calcanhares para trabalhar panturrilha e tornozelos.',
  steps = array['Fique em pé com um halter em cada mão e os pés mais ou menos na largura do quadril.', 'Deixe os braços ao lado do corpo e mantenha os joelhos levemente flexionados.', 'Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo o tronco ereto.', 'Desça os calcanhares até o chão com controle e repita.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao subir na ponta dos pés.',
  common_mistakes = array['Quicar embaixo em vez de descer com controle', 'Girar os tornozelos para dentro ou para fora', 'Flexionar os joelhos e transformar o movimento em agachamento', 'Inclinar o tronco à frente durante a subida dos calcanhares']::text[],
  instructions = 'Fique em pé com um halter em cada mão e os pés mais ou menos na largura do quadril.
Deixe os braços ao lado do corpo e mantenha os joelhos levemente flexionados.
Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo o tronco ereto.
Desça os calcanhares até o chão com controle e repita.',
  content_pt_ready = true
where slug = 'dumbbell-standing-calf-raise-0417';

update public.exercises set
  description = 'Avanço com barra apoiada na parte alta das costas, que trabalha glúteos, quadríceps e posteriores da coxa, uma perna por vez.',
  steps = array['Apoie a barra na parte alta das costas e fique em pé com os pés na largura do quadril.', 'Firme o abdômen e dê um passo à frente com controle.', 'Desça o corpo até flexionar os dois joelhos e o joelho de trás se aproximar do chão.', 'Mantenha o pé da frente inteiro no chão e o tronco ereto na posição mais baixa.', 'Empurre com o pé da frente para voltar a ficar em pé e junte os pés.', 'Repita do outro lado, alternando as pernas a cada repetição.']::text[],
  breathing = 'Inspire ao dar o passo e descer, e expire ao voltar à posição em pé.',
  common_mistakes = array['Dar um passo tão curto que o joelho da frente passa muito além da ponta do pé.', 'Inclinar o tronco à frente durante a descida.', 'Deixar o joelho da frente cair para dentro.', 'Empurrar com o pé de trás em vez de usar o pé da frente.']::text[],
  instructions = 'Apoie a barra na parte alta das costas e fique em pé com os pés na largura do quadril.
Firme o abdômen e dê um passo à frente com controle.
Desça o corpo até flexionar os dois joelhos e o joelho de trás se aproximar do chão.
Mantenha o pé da frente inteiro no chão e o tronco ereto na posição mais baixa.
Empurre com o pé da frente para voltar a ficar em pé e junte os pés.
Repita do outro lado, alternando as pernas a cada repetição.',
  content_pt_ready = true
where slug = 'barbell-lunge-0054';

update public.exercises set
  description = 'Exercício de isolamento do ombro feito sentado, elevando os halteres à frente até a altura dos ombros para trabalhar a porção anterior do deltoide.',
  steps = array['Sente-se ereto no banco com os pés inteiros no chão e um halter em cada mão ao lado do corpo.', 'Segure os halteres com as palmas voltadas para baixo ou levemente uma para a outra e firme o abdômen.', 'Eleve os dois braços à frente até os halteres chegarem à altura dos ombros.', 'Faça uma breve pausa no alto, sem inclinar o tronco para trás nem encolher os ombros.', 'Desça os halteres com controle até a posição inicial, junto às coxas.', 'Repita mantendo a mesma postura sentada e a mesma trajetória dos braços.']::text[],
  breathing = 'Expire ao elevar os halteres e inspire ao descê-los com controle.',
  common_mistakes = array['Inclinar o tronco para trás para balançar os halteres para cima', 'Elevar os halteres acima da altura dos ombros', 'Encolher os ombros em direção às orelhas', 'Deixar os pesos caírem rápido na descida']::text[],
  instructions = 'Sente-se ereto no banco com os pés inteiros no chão e um halter em cada mão ao lado do corpo.
Segure os halteres com as palmas voltadas para baixo ou levemente uma para a outra e firme o abdômen.
Eleve os dois braços à frente até os halteres chegarem à altura dos ombros.
Faça uma breve pausa no alto, sem inclinar o tronco para trás nem encolher os ombros.
Desça os halteres com controle até a posição inicial, junto às coxas.
Repita mantendo a mesma postura sentada e a mesma trajetória dos braços.',
  content_pt_ready = true
where slug = 'dumbbell-seated-front-raise-0392';

update public.exercises set
  description = 'Exercício de isolamento do ombro feito sentado, elevando os halteres para os lados para trabalhar os deltoides.',
  steps = array['Sente-se ereto no banco com os pés inteiros no chão e um halter em cada mão ao lado do corpo.', 'Abaixe os ombros e mantenha os cotovelos levemente flexionados.', 'Eleve os dois braços para os lados até os halteres chegarem mais ou menos à altura dos ombros.', 'Faça uma breve pausa no alto, sem encolher os ombros.', 'Desça os halteres de volta ao lado do corpo com controle e repita.']::text[],
  breathing = 'Expire ao elevar os halteres para os lados e inspire ao descê-los.',
  common_mistakes = array['Balançar o tronco para iniciar a subida', 'Encolher os ombros em direção às orelhas', 'Elevar os halteres acima da altura dos ombros', 'Estender totalmente os cotovelos e deixar o braço rígido']::text[],
  instructions = 'Sente-se ereto no banco com os pés inteiros no chão e um halter em cada mão ao lado do corpo.
Abaixe os ombros e mantenha os cotovelos levemente flexionados.
Eleve os dois braços para os lados até os halteres chegarem mais ou menos à altura dos ombros.
Faça uma breve pausa no alto, sem encolher os ombros.
Desça os halteres de volta ao lado do corpo com controle e repita.',
  content_pt_ready = true
where slug = 'dumbbell-seated-lateral-raise-0396';

update public.exercises set
  description = 'Exercício de panturrilha sentado em máquina, subindo e descendo os calcanhares para trabalhar o sóleo pela flexão plantar do tornozelo.',
  steps = array['Ajuste o assento para que a almofada fique bem apoiada nas coxas, com os joelhos flexionados a cerca de 90 graus.', 'Apoie a parte da frente dos pés na plataforma, deixando os calcanhares para fora da borda.', 'Segure as alças ou o assento e eleve os calcanhares para transferir a carga às panturrilhas.', 'Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo as pontas dos pés apoiadas.', 'Desça os calcanhares devagar até sentir alongar a panturrilha e repita.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao subir na parte da frente dos pés.',
  common_mistakes = array['Quicar para sair de baixo em vez de descer com controle.', 'Deixar os joelhos subirem e descerem durante a repetição.', 'Girar os pés para dentro ou para fora na plataforma.', 'Usar apenas a metade de cima do movimento.']::text[],
  instructions = 'Ajuste o assento para que a almofada fique bem apoiada nas coxas, com os joelhos flexionados a cerca de 90 graus.
Apoie a parte da frente dos pés na plataforma, deixando os calcanhares para fora da borda.
Segure as alças ou o assento e eleve os calcanhares para transferir a carga às panturrilhas.
Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo as pontas dos pés apoiadas.
Desça os calcanhares devagar até sentir alongar a panturrilha e repita.',
  content_pt_ready = true
where slug = 'lever-seated-calf-raise-0594';

update public.exercises set
  description = 'Exercício de elevação de quadril com bola suíça, que aciona glúteos, posteriores da coxa e core.',
  steps = array['Deite-se de costas com os braços ao lado do corpo e os pés sobre a bola suíça.', 'Flexione os joelhos a 90 graus e mantenha os pés na largura do quadril.', 'Empurre com os calcanhares e contraia os glúteos para elevar o quadril.', 'Faça uma pausa no alto, mantendo o corpo em linha reta.', 'Desça o quadril com controle.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Arquear demais a lombar', 'Descer o quadril demais']::text[],
  instructions = 'Deite-se de costas com os braços ao lado do corpo e os pés sobre a bola suíça.
Flexione os joelhos a 90 graus e mantenha os pés na largura do quadril.
Empurre com os calcanhares e contraia os glúteos para elevar o quadril.
Faça uma pausa no alto, mantendo o corpo em linha reta.
Desça o quadril com controle.',
  content_pt_ready = true
where slug = 'lying-hip-lift-on-stability-ball-drv-lying-hip-lift-on-stability-ball';

update public.exercises set
  description = 'Remada sentada na polia com pegador triangular, puxando em direção à parte alta do tronco para trabalhar dorsal, costas altas e bíceps.',
  steps = array['Sente-se na estação de remada de frente para a torre de pesos e segure o pegador triangular com pegada neutra.', 'Apoie os pés, flexione levemente os joelhos e sente-se ereto, com o peito erguido e os braços estendidos.', 'Firme o tronco e leve as escápulas para trás e para baixo.', 'Leve os cotovelos para trás e um pouco para fora enquanto puxa o pegador em direção à parte alta do abdômen ou à parte baixa do peito.', 'Faça uma breve pausa com o pegador próximo ao tronco e os ombros para trás.', 'Estenda os braços à frente com controle até sentir alongar os ombros e repita.']::text[],
  breathing = 'Inspire ao estender os braços à frente e expire ao puxar o pegador em direção ao tronco.',
  common_mistakes = array['Arredondar a lombar quando o pegador vai à frente', 'Inclinar muito o tronco para trás e usar balanço para puxar', 'Encolher os ombros em direção às orelhas', 'Puxar só com os braços, sem mover as escápulas']::text[],
  instructions = 'Sente-se na estação de remada de frente para a torre de pesos e segure o pegador triangular com pegada neutra.
Apoie os pés, flexione levemente os joelhos e sente-se ereto, com o peito erguido e os braços estendidos.
Firme o tronco e leve as escápulas para trás e para baixo.
Leve os cotovelos para trás e um pouco para fora enquanto puxa o pegador em direção à parte alta do abdômen ou à parte baixa do peito.
Faça uma breve pausa com o pegador próximo ao tronco e os ombros para trás.
Estenda os braços à frente com controle até sentir alongar os ombros e repita.',
  content_pt_ready = true
where slug = 'cable-seated-high-row-v-bar-0213';

update public.exercises set
  description = 'Agachamento em uma perna só segurando halteres, que desafia glúteos, quadríceps, equilíbrio e controle dos membros inferiores.',
  steps = array['Fique em pé segurando um halter em cada mão ao lado do corpo.', 'Passe o peso para um pé e eleve a outra perna estendida à frente.', 'Firme o tronco e flexione o joelho e o quadril da perna de apoio para descer com controle.', 'Mantenha a perna elevada sem tocar o chão e desça o máximo que conseguir sem perder o equilíbrio.', 'Empurre com o pé de apoio para voltar à posição inicial.', 'Faça todas as repetições com uma perna e depois troque de lado.']::text[],
  breathing = 'Inspire ao descer e expire ao voltar à posição em pé.',
  common_mistakes = array['Deixar o pé elevado tocar o chão entre as repetições', 'Arredondar as costas na parte mais baixa', 'Deixar o joelho de apoio cair para dentro', 'Descer rápido demais e perder o equilíbrio']::text[],
  instructions = 'Fique em pé segurando um halter em cada mão ao lado do corpo.
Passe o peso para um pé e eleve a outra perna estendida à frente.
Firme o tronco e flexione o joelho e o quadril da perna de apoio para descer com controle.
Mantenha a perna elevada sem tocar o chão e desça o máximo que conseguir sem perder o equilíbrio.
Empurre com o pé de apoio para voltar à posição inicial.
Faça todas as repetições com uma perna e depois troque de lado.',
  content_pt_ready = true
where slug = 'dumbbell-single-leg-squat-0411';

update public.exercises set
  description = 'Exercício de core em pé com halter, em que você inclina e gira o tronco de um lado para o outro levando o peso em direção a cada pé, para trabalhar os oblíquos.',
  steps = array['Fique em pé com os pés mais ou menos na largura dos ombros, segurando um halter com as duas mãos à frente do quadril.', 'Flexione levemente os joelhos e incline um pouco o tronco a partir do quadril, mantendo o peito erguido e as costas retas.', 'Gire o tronco e desça o halter em direção à parte externa de um dos pés.', 'Use o quadril para voltar ao centro, com o halter novamente à frente do quadril.', 'Gire para o outro lado e desça o halter em direção à parte externa do pé oposto.', 'Continue alternando os lados com movimento controlado.']::text[],
  breathing = 'Inspire ao descer e girar em direção a um pé e expire ao voltar ao centro e trocar de lado.',
  common_mistakes = array['Arredondar a lombar durante a descida do halter', 'Flexionar mais a coluna do que inclinar a partir do quadril', 'Deixar os joelhos caírem para dentro durante o alcance', 'Balançar o halter rápido em vez de controlar cada lado']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura dos ombros, segurando um halter com as duas mãos à frente do quadril.
Flexione levemente os joelhos e incline um pouco o tronco a partir do quadril, mantendo o peito erguido e as costas retas.
Gire o tronco e desça o halter em direção à parte externa de um dos pés.
Use o quadril para voltar ao centro, com o halter novamente à frente do quadril.
Gire para o outro lado e desça o halter em direção à parte externa do pé oposto.
Continue alternando os lados com movimento controlado.',
  content_pt_ready = true
where slug = 'spell-caster-0777';

update public.exercises set
  description = 'Levantamento com barra que trabalha o corpo todo, levando a barra do chão até os ombros e depois acima da cabeça.',
  steps = array['Fique em pé com os pés entre a largura do quadril e a dos ombros e posicione a barra sobre o meio dos pés.', 'Flexione quadril e joelhos, segure a barra um pouco fora das pernas e mantenha as costas retas com o peito erguido.', 'Empurre o chão e levante a barra, mantendo-a perto das canelas e das coxas enquanto fica em pé.', 'Estenda de forma explosiva quadril, joelhos e tornozelos, encolha os ombros e puxe o corpo para baixo da barra.', 'Receba a barra na frente dos ombros, com os cotovelos à frente, e fique ereto.', 'Empurre a barra para cima da cabeça até estender os braços, com a barra alinhada sobre os ombros.', 'Desça a barra até os ombros e depois leve-a ao chão com controle.']::text[],
  breathing = 'Inspire e firme o tronco antes de tirar a barra do chão, expire ao empurrá-la acima da cabeça e recupere a respiração antes da próxima repetição.',
  common_mistakes = array['Começar com a barra muito à frente dos pés', 'Arredondar a lombar ao tirar a barra do chão', 'Receber a barra com os cotovelos baixos e o peito afundado', 'Empurrar a barra à frente em vez de acima da cabeça']::text[],
  instructions = 'Fique em pé com os pés entre a largura do quadril e a dos ombros e posicione a barra sobre o meio dos pés.
Flexione quadril e joelhos, segure a barra um pouco fora das pernas e mantenha as costas retas com o peito erguido.
Empurre o chão e levante a barra, mantendo-a perto das canelas e das coxas enquanto fica em pé.
Estenda de forma explosiva quadril, joelhos e tornozelos, encolha os ombros e puxe o corpo para baixo da barra.
Receba a barra na frente dos ombros, com os cotovelos à frente, e fique ereto.
Empurre a barra para cima da cabeça até estender os braços, com a barra alinhada sobre os ombros.
Desça a barra até os ombros e depois leve-a ao chão com controle.',
  content_pt_ready = true
where slug = 'barbell-clean-and-press-0028';

update public.exercises set
  description = 'Elevação de panturrilha em pé no Smith, para isolar e fortalecer a panturrilha.',
  steps = array['Ajuste a barra do Smith na altura dos ombros.', 'Entre embaixo da barra, apoie-a na parte alta do trapézio e retire do suporte.', 'Fique em pé com os pés entre a largura do quadril e a dos ombros.', 'Suba na parte da frente dos pés estendendo os tornozelos.', 'Faça uma pausa no alto e desça os calcanhares com controle.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Quicar para gerar impulso', 'Amplitude de movimento parcial', 'Deixar os tornozelos girarem para dentro ou para fora']::text[],
  instructions = 'Ajuste a barra do Smith na altura dos ombros.
Entre embaixo da barra, apoie-a na parte alta do trapézio e retire do suporte.
Fique em pé com os pés entre a largura do quadril e a dos ombros.
Suba na parte da frente dos pés estendendo os tornozelos.
Faça uma pausa no alto e desça os calcanhares com controle.',
  content_pt_ready = true
where slug = 'smith-machine-calf-raise-1393';

update public.exercises set
  description = 'Variação de desenvolvimento sentado com barra, descendo-a atrás da nuca para trabalhar os deltoides.',
  steps = array['Sente-se em um banco com apoio para as costas e segure a barra com pegada mais aberta que os ombros.', 'Retire a barra do suporte e mantenha-a acima da cabeça.', 'Desça a barra atrás da cabeça até um pouco abaixo da linha das orelhas.', 'Empurre a barra de volta à posição inicial.', 'Repita pelo número de repetições desejado, mantendo o abdômen contraído.']::text[],
  breathing = 'Expire ao empurrar para cima e inspire ao descer a barra.',
  common_mistakes = array['Abrir demais os cotovelos', 'Arquear a lombar', 'Descer a barra além do necessário']::text[],
  instructions = 'Sente-se em um banco com apoio para as costas e segure a barra com pegada mais aberta que os ombros.
Retire a barra do suporte e mantenha-a acima da cabeça.
Desça a barra atrás da cabeça até um pouco abaixo da linha das orelhas.
Empurre a barra de volta à posição inicial.
Repita pelo número de repetições desejado, mantendo o abdômen contraído.',
  content_pt_ready = true
where slug = 'barbell-seated-behind-the-neck-press-drv-barbell-seated-behind-head-military-press';

update public.exercises set
  description = 'Flexão de pernas voltada aos posteriores da coxa usando a bola suíça, que também exige estabilidade do core.',
  steps = array['Deite-se de costas no chão, com os braços ao lado do corpo e os calcanhares sobre a bola suíça.', 'Eleve o quadril para formar uma linha reta dos ombros aos calcanhares.', 'Flexione os joelhos para rolar a bola em direção aos glúteos.', 'Faça uma pausa e contraia os posteriores da coxa.', 'Estenda as pernas para rolar a bola de volta.']::text[],
  breathing = 'Expire ao puxar a bola e inspire ao estender as pernas.',
  common_mistakes = array['Deixar o quadril cair', 'Fazer repetições rápidas demais', 'Não estender totalmente as pernas']::text[],
  instructions = 'Deite-se de costas no chão, com os braços ao lado do corpo e os calcanhares sobre a bola suíça.
Eleve o quadril para formar uma linha reta dos ombros aos calcanhares.
Flexione os joelhos para rolar a bola em direção aos glúteos.
Faça uma pausa e contraia os posteriores da coxa.
Estenda as pernas para rolar a bola de volta.',
  content_pt_ready = true
where slug = 'stability-ball-leg-curl-0353';

update public.exercises set
  description = 'Exercício avançado de core voltado aos oblíquos, girando o tronco em equilíbrio sobre a bola suíça com os braços estendidos.',
  steps = array['Sente-se na bola suíça e caminhe com os pés à frente até apoiar os ombros na bola.', 'Mantenha os joelhos flexionados a 90 graus e o quadril elevado, em posição de ponte.', 'Estenda os braços em direção ao teto, com as mãos unidas.', 'Gire o tronco e os braços juntos para a esquerda.', 'Volte ao centro e gire para a direita, repetindo pelo número de repetições indicado.']::text[],
  breathing = 'Expire em cada rotação e inspire ao voltar ao centro.',
  common_mistakes = array['Deixar o quadril cair', 'Flexionar os braços', 'Girar rápido demais']::text[],
  instructions = 'Sente-se na bola suíça e caminhe com os pés à frente até apoiar os ombros na bola.
Mantenha os joelhos flexionados a 90 graus e o quadril elevado, em posição de ponte.
Estenda os braços em direção ao teto, com as mãos unidas.
Gire o tronco e os braços juntos para a esquerda.
Volte ao centro e gire para a direita, repetindo pelo número de repetições indicado.',
  content_pt_ready = true
where slug = 'russian-twist-on-stability-ball-arms-straight-0211';

update public.exercises set
  description = 'Exercício de posteriores da coxa em máquina, feito ajoelhado, flexionando os joelhos para levar as pernas em direção aos glúteos.',
  steps = array['Ajuste a máquina para que seus joelhos fiquem alinhados com o eixo de giro e os tornozelos bem encaixados sob as almofadas.', 'Ajoelhe-se na almofada de frente para a máquina, apoie o tronco no suporte e segure as alças.', 'Comece com as pernas estendidas atrás do corpo e mantenha o quadril parado.', 'Flexione os joelhos contra as almofadas, levando os calcanhares em direção aos glúteos.', 'Faça uma breve pausa no alto e contraia os posteriores da coxa.', 'Desça as almofadas com controle até estender as pernas novamente.']::text[],
  breathing = 'Expire ao levar os calcanhares para cima e inspire ao voltar ao início.',
  common_mistakes = array['Tirar o quadril da almofada durante a flexão', 'Balançar as pernas para iniciar cada repetição', 'Parar antes do fim e não estender os joelhos embaixo', 'Deixar os tornozelos escaparem das almofadas']::text[],
  instructions = 'Ajuste a máquina para que seus joelhos fiquem alinhados com o eixo de giro e os tornozelos bem encaixados sob as almofadas.
Ajoelhe-se na almofada de frente para a máquina, apoie o tronco no suporte e segure as alças.
Comece com as pernas estendidas atrás do corpo e mantenha o quadril parado.
Flexione os joelhos contra as almofadas, levando os calcanhares em direção aos glúteos.
Faça uma breve pausa no alto e contraia os posteriores da coxa.
Desça as almofadas com controle até estender as pernas novamente.',
  content_pt_ready = true
where slug = 'lever-kneeling-leg-curl-0582';

commit;
