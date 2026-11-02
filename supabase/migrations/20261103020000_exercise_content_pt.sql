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

update public.exercises set
  description = 'Movimento com o peso do corpo que trabalha o corpo todo, combinando agachamento, prancha, flexão e salto para condicionamento.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril.', 'Flexione os joelhos, incline o tronco a partir do quadril e apoie as mãos no chão à frente dos pés.', 'Salte com os dois pés para trás, chegando à prancha alta com o corpo em linha reta.', 'Desça o peito até o chão e empurre de volta à prancha.', 'Salte com os dois pés à frente, por fora das mãos.', 'Empurre com os pés e salte para cima, estendendo os braços acima da cabeça ao sair do chão.', 'Aterrisse suavemente e emende direto na próxima repetição.']::text[],
  breathing = 'Inspire ao descer e ir para a prancha, e expire ao subir e saltar.',
  common_mistakes = array['Deixar o quadril afundar na prancha ou na flexão.', 'Aterrissar com os pés muito juntos sob o corpo.', 'Apoiar as mãos muito à frente dos ombros.', 'Aterrissar com as pernas rígidas, sem flexionar os joelhos.']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril.
Flexione os joelhos, incline o tronco a partir do quadril e apoie as mãos no chão à frente dos pés.
Salte com os dois pés para trás, chegando à prancha alta com o corpo em linha reta.
Desça o peito até o chão e empurre de volta à prancha.
Salte com os dois pés à frente, por fora das mãos.
Empurre com os pés e salte para cima, estendendo os braços acima da cabeça ao sair do chão.
Aterrisse suavemente e emende direto na próxima repetição.',
  content_pt_ready = true
where slug = 'burpee-1160';

update public.exercises set
  description = 'Alongamento com rotação sobre a bola suíça, voltado aos oblíquos e aos flexores do quadril.',
  steps = array['Deite-se de costas com as panturrilhas sobre a bola suíça.', 'Abra os braços para os lados para dar apoio.', 'Flexione os joelhos a 90 graus sobre a bola.', 'Desça os joelhos devagar para um lado, mantendo os ombros apoiados.', 'Volte ao centro e repita para o outro lado.']::text[],
  breathing = 'Expire ao girar e inspire ao voltar ao centro.',
  common_mistakes = array['Deixar os ombros saírem do chão', 'Fazer o movimento rápido demais', 'Girar o quadril além do confortável']::text[],
  instructions = 'Deite-se de costas com as panturrilhas sobre a bola suíça.
Abra os braços para os lados para dar apoio.
Flexione os joelhos a 90 graus sobre a bola.
Desça os joelhos devagar para um lado, mantendo os ombros apoiados.
Volte ao centro e repita para o outro lado.',
  content_pt_ready = true
where slug = 'bent-knee-lying-twist-on-stability-ball-3639';

update public.exercises set
  description = 'Exercício de isolamento do peito na polia, feito em pé, aproximando os braços como em um abraço.',
  steps = array['Prenda as alças nas duas polias altas.', 'Fique no centro, entre as polias, e segure uma alça em cada mão.', 'Dê um passo à frente, com um pé mais adiantado que o outro e os braços abertos.', 'Com os cotovelos levemente flexionados, una as alças à frente do peito.', 'Volte devagar à posição inicial, sentindo alongar o peito.']::text[],
  breathing = 'Expire ao unir as mãos e inspire ao voltar.',
  common_mistakes = array['Estender demais os braços', 'Travar os cotovelos', 'Arredondar as costas']::text[],
  instructions = 'Prenda as alças nas duas polias altas.
Fique no centro, entre as polias, e segure uma alça em cada mão.
Dê um passo à frente, com um pé mais adiantado que o outro e os braços abertos.
Com os cotovelos levemente flexionados, una as alças à frente do peito.
Volte devagar à posição inicial, sentindo alongar o peito.',
  content_pt_ready = true
where slug = 'cable-standing-fly-1269';

update public.exercises set
  description = 'Movimento aeróbico repetitivo que melhora o condicionamento cardiovascular e a resistência.',
  steps = array['Aqueça com caminhada leve ou alongamentos dinâmicos.', 'Comece a correr em ritmo moderado.', 'Mantenha a respiração ritmada e a postura ereta.', 'Aterrisse de forma leve, com o meio ou a parte da frente do pé.', 'Desacelere caminhando e alongando ao final.']::text[],
  breathing = 'Expire de forma constante ao impulsionar e inspire na recuperação.',
  common_mistakes = array['Dar passadas longas demais', 'Curvar os ombros para frente', 'Aterrissar com força nos calcanhares']::text[],
  instructions = 'Aqueça com caminhada leve ou alongamentos dinâmicos.
Comece a correr em ritmo moderado.
Mantenha a respiração ritmada e a postura ereta.
Aterrisse de forma leve, com o meio ou a parte da frente do pé.
Desacelere caminhando e alongando ao final.',
  content_pt_ready = true
where slug = 'running-drv-running';

update public.exercises set
  description = 'Exercício de panturrilha em máquina, subindo e descendo os calcanhares sob as almofadas de ombro para trabalhar a panturrilha pelo movimento do tornozelo.',
  steps = array['Ajuste as almofadas de ombro para que apoiem com conforto quando você estiver na plataforma.', 'Apoie a parte da frente dos pés na borda da plataforma, deixando os calcanhares para fora, e segure as alças.', 'Estenda as pernas, firme o tronco e deixe os calcanhares descerem até sentir alongar a panturrilha.', 'Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo o equilíbrio sob as almofadas.', 'Desça os calcanhares com controle até a posição inicial de alongamento.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao subir na parte da frente dos pés.',
  common_mistakes = array['Quicar para sair de baixo em vez de descer com controle.', 'Flexionar visivelmente os joelhos durante a subida.', 'Girar os tornozelos para dentro ou para fora durante a subida.', 'Usar amplitude curta e parar antes de descer totalmente os calcanhares.']::text[],
  instructions = 'Ajuste as almofadas de ombro para que apoiem com conforto quando você estiver na plataforma.
Apoie a parte da frente dos pés na borda da plataforma, deixando os calcanhares para fora, e segure as alças.
Estenda as pernas, firme o tronco e deixe os calcanhares descerem até sentir alongar a panturrilha.
Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo o equilíbrio sob as almofadas.
Desça os calcanhares com controle até a posição inicial de alongamento.',
  content_pt_ready = true
where slug = 'lever-standing-calf-raise-0605';

update public.exercises set
  description = 'Exercício de isolamento do tríceps feito com um braço por vez, com o halter acima da cabeça.',
  steps = array['Segure o halter em uma das mãos, com o braço estendido acima da cabeça.', 'Se precisar, apoie o braço que trabalha com a mão livre.', 'Desça o halter atrás da cabeça flexionando o cotovelo.', 'Faça uma pausa quando o antebraço ficar paralelo ao chão.', 'Estenda totalmente o braço para voltar à posição inicial.']::text[],
  breathing = 'Inspire ao descer o halter e expire ao empurrá-lo para cima.',
  common_mistakes = array['Mover a parte de cima do braço', 'Descer o peso além do necessário', 'Deixar o cotovelo abrir para o lado', 'Fazer o movimento com pressa']::text[],
  instructions = 'Segure o halter em uma das mãos, com o braço estendido acima da cabeça.
Se precisar, apoie o braço que trabalha com a mão livre.
Desça o halter atrás da cabeça flexionando o cotovelo.
Faça uma pausa quando o antebraço ficar paralelo ao chão.
Estenda totalmente o braço para voltar à posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-one-arm-triceps-extension-0306';

update public.exercises set
  description = 'Exercício de glúteos e posteriores da coxa em máquina, elevando as pernas para trás deitado de bruços sobre a almofada.',
  steps = array['Ajuste a máquina para que o quadril fique apoiado na almofada e as pernas possam ficar suspensas.', 'Deite-se de bruços com o tronco apoiado e segure as alças ou as laterais para ter estabilidade.', 'Apoie os pés nas almofadas de pé e deixe as pernas descerem com controle.', 'Firme o abdômen e contraia os glúteos para elevar as pernas para trás.', 'Suba até as pernas ficarem mais ou menos alinhadas com o tronco, sem arquear a lombar.', 'Desça as pernas devagar até a posição inicial e repita.']::text[],
  breathing = 'Inspire ao descer as pernas e expire ao elevá-las para trás.',
  common_mistakes = array['Balançar as pernas para cima com impulso', 'Arquear a lombar no alto', 'Deixar o quadril escorregar da almofada', 'Flexionar e estender os joelhos durante a repetição']::text[],
  instructions = 'Ajuste a máquina para que o quadril fique apoiado na almofada e as pernas possam ficar suspensas.
Deite-se de bruços com o tronco apoiado e segure as alças ou as laterais para ter estabilidade.
Apoie os pés nas almofadas de pé e deixe as pernas descerem com controle.
Firme o abdômen e contraia os glúteos para elevar as pernas para trás.
Suba até as pernas ficarem mais ou menos alinhadas com o tronco, sem arquear a lombar.
Desça as pernas devagar até a posição inicial e repita.',
  content_pt_ready = true
where slug = 'lever-reverse-hyperextension-0593';

update public.exercises set
  description = 'Desenvolvimento sentado no Smith, que trabalha deltoides e tríceps com trajetória de barra fixa.',
  steps = array['Coloque um banco ou assento sob a barra do Smith, de modo que ela comece mais ou menos na altura dos ombros quando você sentar.', 'Sente-se ereto com as costas apoiadas, os pés inteiros no chão e segure a barra um pouco mais aberta que os ombros, com as palmas para frente.', 'Retire a barra do suporte e mantenha-a acima da parte alta do peito, com os punhos alinhados sobre os cotovelos.', 'Desça a barra em linha reta até mais ou menos a altura do queixo ou dos ombros.', 'Empurre a barra para cima até estender os braços acima da cabeça.', 'Desça a barra com controle até a posição inicial e repita.', 'Termine estendendo os braços no alto e girando a barra para encaixá-la nos ganchos.']::text[],
  breathing = 'Inspire ao descer a barra até a altura dos ombros e expire ao empurrá-la acima da cabeça.',
  common_mistakes = array['Descer a barra atrás da cabeça', 'Abrir os cotovelos totalmente para os lados', 'Arquear a lombar e sair do banco', 'Deixar os punhos dobrarem demais para trás']::text[],
  instructions = 'Coloque um banco ou assento sob a barra do Smith, de modo que ela comece mais ou menos na altura dos ombros quando você sentar.
Sente-se ereto com as costas apoiadas, os pés inteiros no chão e segure a barra um pouco mais aberta que os ombros, com as palmas para frente.
Retire a barra do suporte e mantenha-a acima da parte alta do peito, com os punhos alinhados sobre os cotovelos.
Desça a barra em linha reta até mais ou menos a altura do queixo ou dos ombros.
Empurre a barra para cima até estender os braços acima da cabeça.
Desça a barra com controle até a posição inicial e repita.
Termine estendendo os braços no alto e girando a barra para encaixá-la nos ganchos.',
  content_pt_ready = true
where slug = 'smith-seated-shoulder-press-0765';

update public.exercises set
  description = 'Rosca direta clássica com barra W, que desenvolve o volume do braço com uma pegada mais confortável.',
  steps = array['Segure a barra W nas partes anguladas, com as palmas voltadas para cima.', 'Fique em pé com os braços totalmente estendidos e os cotovelos fixos.', 'Suba a barra contraindo o bíceps.', 'Faça uma pausa no alto e contraia.', 'Desça a barra devagar.']::text[],
  breathing = 'Expire ao subir e inspire ao descer a barra.',
  common_mistakes = array['Usar o impulso', 'Deixar os cotovelos avançarem à frente', 'Repetições parciais']::text[],
  instructions = 'Segure a barra W nas partes anguladas, com as palmas voltadas para cima.
Fique em pé com os braços totalmente estendidos e os cotovelos fixos.
Suba a barra contraindo o bíceps.
Faça uma pausa no alto e contraia.
Desça a barra devagar.',
  content_pt_ready = true
where slug = 'ez-bar-biceps-curl-2407';

update public.exercises set
  description = 'Exercício composto na polia voltado ao meio das costas e ao dorsal, usando o pegador triangular.',
  steps = array['Sente-se na máquina de remada e apoie os pés na plataforma.', 'Segure o pegador triangular com as duas mãos e os braços estendidos.', 'Mantenha as costas retas e os joelhos levemente flexionados.', 'Puxe o pegador em direção ao abdômen, aproximando as escápulas.', 'Estenda os braços devagar para voltar à posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao estender os braços à frente.',
  common_mistakes = array['Curvar as costas', 'Usar o impulso', 'Deixar os cotovelos abrirem para os lados']::text[],
  instructions = 'Sente-se na máquina de remada e apoie os pés na plataforma.
Segure o pegador triangular com as duas mãos e os braços estendidos.
Mantenha as costas retas e os joelhos levemente flexionados.
Puxe o pegador em direção ao abdômen, aproximando as escápulas.
Estenda os braços devagar para voltar à posição inicial.',
  content_pt_ready = true
where slug = 'seated-cable-row-v-grip-0208';

update public.exercises set
  description = 'Extensão de tríceps sentado em banco inclinado com halteres, flexionando e estendendo os cotovelos para levar os pesos atrás e acima da cabeça.',
  steps = array['Sente-se recostado em um banco inclinado com um halter em cada mão.', 'Empurre os halteres acima da cabeça, com as palmas voltadas uma para a outra.', 'Mantenha os cotovelos apontados para cima e próximos à cabeça.', 'Desça os halteres atrás da cabeça flexionando apenas os cotovelos.', 'Faça uma breve pausa quando os antebraços passarem abaixo da linha paralela ao chão.', 'Estenda os cotovelos para levar os halteres novamente acima da cabeça.']::text[],
  breathing = 'Inspire ao descer os halteres atrás da cabeça e expire ao estender os cotovelos para subi-los.',
  common_mistakes = array['Abrir bastante os cotovelos para os lados.', 'Deixar a parte de cima dos braços ir para trás e transformar o movimento em desenvolvimento.', 'Descer só alguns centímetros atrás da cabeça.', 'Arquear a lombar e sair do banco.']::text[],
  instructions = 'Sente-se recostado em um banco inclinado com um halter em cada mão.
Empurre os halteres acima da cabeça, com as palmas voltadas uma para a outra.
Mantenha os cotovelos apontados para cima e próximos à cabeça.
Desça os halteres atrás da cabeça flexionando apenas os cotovelos.
Faça uma breve pausa quando os antebraços passarem abaixo da linha paralela ao chão.
Estenda os cotovelos para levar os halteres novamente acima da cabeça.',
  content_pt_ready = true
where slug = 'dumbbell-incline-triceps-extension-0330';

update public.exercises set
  description = 'Supino com halteres feito em banco declinado a 45 graus, voltado ao peito.',
  steps = array['Ajuste o banco em declínio de 45 graus.', 'Prenda os pés, deite-se e segure os halteres acima do peito.', 'Desça os halteres para os lados do peito.', 'Faça uma pausa embaixo.', 'Empurre os pesos de volta à posição inicial.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao empurrá-los para cima.',
  common_mistakes = array['Descer demais os cotovelos', 'Usar amplitudes diferentes em cada braço', 'Arquear a lombar', 'Repetições feitas com pressa']::text[],
  instructions = 'Ajuste o banco em declínio de 45 graus.
Prenda os pés, deite-se e segure os halteres acima do peito.
Desça os halteres para os lados do peito.
Faça uma pausa embaixo.
Empurre os pesos de volta à posição inicial.',
  content_pt_ready = true
where slug = 'decline-dumbbell-bench-press-0301';

update public.exercises set
  description = 'Puxada vertical com o peso do corpo em pegada neutra fechada, para trabalhar a parte alta das costas, bíceps e antebraços.',
  steps = array['Segure as alças paralelas com pegada neutra fechada e fique suspenso com os braços estendidos.', 'Cruze os tornozelos ou mantenha as pernas paradas, firme o abdômen e leve os ombros para baixo, longe das orelhas.', 'Leve os cotovelos para baixo e para trás para elevar o peito em direção às mãos.', 'Continue puxando até o queixo passar acima das mãos ou das alças.', 'Desça com controle até estender os braços novamente.', 'Faça uma breve pausa embaixo sem relaxar os ombros e repita.']::text[],
  breathing = 'Inspire embaixo antes de puxar, expire ao subir e inspire novamente ao descer com controle.',
  common_mistakes = array['Encolher os ombros em direção às orelhas durante a puxada.', 'Balançar as pernas ou dar impulso para subir.', 'Parar antes do fim, com o queixo abaixo das mãos.', 'Descer rápido até embaixo, sem controle.']::text[],
  instructions = 'Segure as alças paralelas com pegada neutra fechada e fique suspenso com os braços estendidos.
Cruze os tornozelos ou mantenha as pernas paradas, firme o abdômen e leve os ombros para baixo, longe das orelhas.
Leve os cotovelos para baixo e para trás para elevar o peito em direção às mãos.
Continue puxando até o queixo passar acima das mãos ou das alças.
Desça com controle até estender os braços novamente.
Faça uma breve pausa embaixo sem relaxar os ombros e repita.',
  content_pt_ready = true
where slug = 'chin-ups-narrow-parallel-grip-0253';

update public.exercises set
  description = 'Abdominal ajoelhado na polia alta, enrolando o tronco para baixo contra a resistência para trabalhar abdômen e oblíquos.',
  steps = array['Prenda a corda na polia alta e ajoelhe-se de frente para a máquina.', 'Segure as pontas da corda e leve as mãos ao lado da cabeça, com os cotovelos um pouco à frente.', 'Firme o abdômen e mantenha o quadril alinhado sobre os joelhos.', 'Aproxime as costelas da pelve, levando os cotovelos em direção às coxas.', 'Faça uma breve pausa embaixo, mantendo a tensão na corda.', 'Desenrole a coluna devagar e volte ao início sem deixar a torre de pesos bater.']::text[],
  breathing = 'Expire ao enrolar o tronco para baixo e inspire ao voltar devagar à posição inicial.',
  common_mistakes = array['Puxar a corda com os braços em vez de enrolar o tronco', 'Levar o quadril para trás e transformar o movimento em dobradiça de quadril', 'Dar trancos na subida e deixar a torre de pesos cair entre as repetições', 'Subir demais o peito e perder a tensão no abdômen no alto']::text[],
  instructions = 'Prenda a corda na polia alta e ajoelhe-se de frente para a máquina.
Segure as pontas da corda e leve as mãos ao lado da cabeça, com os cotovelos um pouco à frente.
Firme o abdômen e mantenha o quadril alinhado sobre os joelhos.
Aproxime as costelas da pelve, levando os cotovelos em direção às coxas.
Faça uma breve pausa embaixo, mantendo a tensão na corda.
Desenrole a coluna devagar e volte ao início sem deixar a torre de pesos bater.',
  content_pt_ready = true
where slug = 'cable-kneeling-crunch-0175';

update public.exercises set
  description = 'Exercício na polia com pegada fechada, voltado ao dorsal e aos músculos de apoio das costas.',
  steps = array['Prenda o pegador triangular ou de pegada fechada na polia.', 'Sente-se e prenda as coxas sob as almofadas.', 'Segure o pegador com pegada neutra, com as mãos paralelas.', 'Puxe o pegador até a parte alta do peito, mantendo o tronco na vertical.', 'Deixe o pegador voltar devagar ao alto, sem travar os cotovelos.']::text[],
  breathing = 'Expire ao puxar para baixo e inspire ao deixar subir.',
  common_mistakes = array['Inclinar demais o tronco para trás', 'Usar o impulso', 'Não acionar bem o dorsal', 'Arredondar os ombros para frente']::text[],
  instructions = 'Prenda o pegador triangular ou de pegada fechada na polia.
Sente-se e prenda as coxas sob as almofadas.
Segure o pegador com pegada neutra, com as mãos paralelas.
Puxe o pegador até a parte alta do peito, mantendo o tronco na vertical.
Deixe o pegador voltar devagar ao alto, sem travar os cotovelos.',
  content_pt_ready = true
where slug = 'cable-close-grip-lat-pulldown-0974';

update public.exercises set
  description = 'Crucifixo em banco declinado a 45 graus com halteres, para isolar a parte inferior do peito.',
  steps = array['Ajuste o banco em declínio de 45 graus e prenda os pés.', 'Deite-se com os braços estendidos acima do peito e os cotovelos levemente flexionados.', 'Desça os halteres para os lados em um arco amplo.', 'Faça uma pausa embaixo para sentir o alongamento.', 'Volte os halteres à posição inicial, contraindo o peito.']::text[],
  breathing = 'Inspire ao abrir os braços e expire ao unir os pesos.',
  common_mistakes = array['Estender totalmente os braços', 'Descer demais os halteres', 'Usar carga excessiva', 'Fazer a repetição com pressa']::text[],
  instructions = 'Ajuste o banco em declínio de 45 graus e prenda os pés.
Deite-se com os braços estendidos acima do peito e os cotovelos levemente flexionados.
Desça os halteres para os lados em um arco amplo.
Faça uma pausa embaixo para sentir o alongamento.
Volte os halteres à posição inicial, contraindo o peito.',
  content_pt_ready = true
where slug = 'decline-dumbbell-fly-0302';

update public.exercises set
  description = 'Exercício de core com rotação feito sentado na bola suíça, voltado aos oblíquos.',
  steps = array['Sente-se na bola suíça com os pés inteiros no chão e o abdômen contraído.', 'Mantenha os braços à frente do corpo ou cruzados no peito.', 'Gire o tronco para a direita, mantendo o quadril parado.', 'Faça uma pausa e gire para a esquerda.', 'Volte ao centro e repita alternando os lados.']::text[],
  breathing = 'Expire durante a rotação e inspire ao voltar ao centro.',
  common_mistakes = array['Deixar as costas curvarem', 'Girar demais o quadril', 'Esquecer de contrair o abdômen']::text[],
  instructions = 'Sente-se na bola suíça com os pés inteiros no chão e o abdômen contraído.
Mantenha os braços à frente do corpo ou cruzados no peito.
Gire o tronco para a direita, mantendo o quadril parado.
Faça uma pausa e gire para a esquerda.
Volte ao centro e repita alternando os lados.',
  content_pt_ready = true
where slug = 'seated-twist-on-stability-ball-0849';

update public.exercises set
  description = 'Exercício em máquina horizontal carregada com discos, que trabalha toda a coxa, especialmente o quadríceps.',
  steps = array['Sente-se na máquina e ajuste o assento conforme necessário.', 'Apoie os pés na plataforma, na largura dos ombros.', 'Empurre a plataforma estendendo as pernas.', 'Não trave os joelhos no fim do movimento.', 'Desça a plataforma com controle até a posição inicial.']::text[],
  breathing = 'Expire ao empurrar e inspire ao descer.',
  common_mistakes = array['Deixar os joelhos caírem para dentro ou para fora', 'Tirar o quadril do assento', 'Travar os joelhos no alto', 'Usar carga excessiva']::text[],
  instructions = 'Sente-se na máquina e ajuste o assento conforme necessário.
Apoie os pés na plataforma, na largura dos ombros.
Empurre a plataforma estendendo as pernas.
Não trave os joelhos no fim do movimento.
Desça a plataforma com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'lever-horizontal-leg-press-2611';

update public.exercises set
  description = 'Exercício de isolamento do ombro na polia feito com um braço por vez, elevando o braço para o lado para trabalhar a porção lateral do deltoide.',
  steps = array['Coloque a polia na posição mais baixa e fique de lado para ela.', 'Segure a alça com a mão de fora e deixe o braço ao lado da coxa.', 'Fique ereto com o cotovelo levemente flexionado e firme o abdômen.', 'Eleve o braço para o lado até a mão chegar à altura do ombro.', 'Faça uma breve pausa sem encolher o ombro.', 'Desça a alça com controle até a posição inicial.']::text[],
  breathing = 'Expire ao elevar a alça para o lado e inspire ao descê-la.',
  common_mistakes = array['Encolher o ombro em direção à orelha', 'Balançar o tronco para levantar a alça', 'Transformar a elevação lateral em elevação frontal', 'Elevar a mão muito acima da altura do ombro']::text[],
  instructions = 'Coloque a polia na posição mais baixa e fique de lado para ela.
Segure a alça com a mão de fora e deixe o braço ao lado da coxa.
Fique ereto com o cotovelo levemente flexionado e firme o abdômen.
Eleve o braço para o lado até a mão chegar à altura do ombro.
Faça uma breve pausa sem encolher o ombro.
Desça a alça com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'cable-lateral-raise-0178';

update public.exercises set
  description = 'Variação unilateral de rosca no banco Scott que acrescenta uma rotação de punho, trabalhando bíceps e antebraços tanto na subida quanto na descida.',
  steps = array['Sente-se no banco Scott e apoie os pés no chão.', 'Segure um halter em uma das mãos e apoie a parte de trás do braço no encosto, com o braço quase estendido.', 'Comece com a palma voltada para cima e suba o halter em direção ao ombro, sem tirar o braço do apoio.', 'Faça uma pausa perto do alto e gire o punho até a palma ficar voltada para baixo.', 'Desça o halter devagar até o braço ficar quase estendido, mantendo a palma para baixo.', 'Gire o punho de volta para a palma voltada para cima embaixo e repita antes de trocar de braço.']::text[],
  breathing = 'Expire ao subir o halter e inspire ao girar o punho e descê-lo.',
  common_mistakes = array['Tirar o braço do apoio do banco Scott', 'Balançar o halter em vez de fazer a rosca', 'Deixar o peso cair rápido na descida', 'Girar o punho antes de chegar ao alto']::text[],
  instructions = 'Sente-se no banco Scott e apoie os pés no chão.
Segure um halter em uma das mãos e apoie a parte de trás do braço no encosto, com o braço quase estendido.
Comece com a palma voltada para cima e suba o halter em direção ao ombro, sem tirar o braço do apoio.
Faça uma pausa perto do alto e gire o punho até a palma ficar voltada para baixo.
Desça o halter devagar até o braço ficar quase estendido, mantendo a palma para baixo.
Gire o punho de volta para a palma voltada para cima embaixo e repita antes de trocar de braço.',
  content_pt_ready = true
where slug = 'dumbbell-one-arm-zottman-preacher-curl-1672';

update public.exercises set
  description = 'Desenvolvimento em pé com barra W, que trabalha deltoides, tríceps e a parte alta do peito em toda a amplitude de empurrar.',
  steps = array['Fique em pé com os pés entre a largura do quadril e a dos ombros e segure a barra W na altura dos ombros, com pegada por cima.', 'Firme o abdômen e mantenha os punhos alinhados sobre os cotovelos.', 'Empurre a barra para cima da cabeça até estender totalmente os braços acima dos ombros.', 'Leve a cabeça um pouco para trás quando a barra passar pelo rosto e depois traga-a para baixo da barra no alto.', 'Desça a barra com controle até a altura dos ombros.', 'Repita cada repetição a partir de uma posição em pé estável.']::text[],
  breathing = 'Inspire e firme o tronco na altura dos ombros, expire ao empurrar acima da cabeça e inspire novamente ao descer a barra.',
  common_mistakes = array['Inclinar muito o tronco para trás e transformar o movimento em supino inclinado', 'Empurrar a barra à frente em vez de acima da cabeça', 'Abrir demais os cotovelos já no início', 'Descer a barra rápido demais e quicar nos ombros']::text[],
  instructions = 'Fique em pé com os pés entre a largura do quadril e a dos ombros e segure a barra W na altura dos ombros, com pegada por cima.
Firme o abdômen e mantenha os punhos alinhados sobre os cotovelos.
Empurre a barra para cima da cabeça até estender totalmente os braços acima dos ombros.
Leve a cabeça um pouco para trás quando a barra passar pelo rosto e depois traga-a para baixo da barra no alto.
Desça a barra com controle até a altura dos ombros.
Repita cada repetição a partir de uma posição em pé estável.',
  content_pt_ready = true
where slug = 'ez-barbell-anti-gravity-press-0445';

update public.exercises set
  description = 'Exercício de isolamento do tríceps com o tronco inclinado, estendendo os halteres para trás sem mover a parte de cima dos braços.',
  steps = array['Fique em pé com um halter em cada mão e incline o tronco à frente a partir do quadril, com as costas retas.', 'Flexione os cotovelos a cerca de 90 graus e mantenha a parte de cima dos braços junto ao tronco.', 'Firme o tronco e mantenha os cotovelos parados.', 'Estenda os braços levando os halteres para trás, até os cotovelos ficarem totalmente estendidos.', 'Contraia o tríceps no fim do movimento, atrás do corpo.', 'Flexione os cotovelos com controle para voltar à posição inicial.']::text[],
  breathing = 'Inspire ao flexionar os cotovelos até a posição inicial e expire ao estender os braços para trás.',
  common_mistakes = array['Balançar os halteres com os ombros ou o tronco', 'Deixar os cotovelos se afastarem das costelas', 'Abaixar a parte de cima dos braços durante a série', 'Deixar os pesos despencarem em vez de descer devagar']::text[],
  instructions = 'Fique em pé com um halter em cada mão e incline o tronco à frente a partir do quadril, com as costas retas.
Flexione os cotovelos a cerca de 90 graus e mantenha a parte de cima dos braços junto ao tronco.
Firme o tronco e mantenha os cotovelos parados.
Estenda os braços levando os halteres para trás, até os cotovelos ficarem totalmente estendidos.
Contraia o tríceps no fim do movimento, atrás do corpo.
Flexione os cotovelos com controle para voltar à posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-kickback-0333';

update public.exercises set
  description = 'Abdominal em pé na polia alta, enrolando o tronco para baixo contra a resistência para trabalhar abdômen e oblíquos.',
  steps = array['Coloque a polia na posição alta e fique de costas para a máquina.', 'Segure o acessório ao lado da cabeça com as duas mãos e flexione levemente os joelhos.', 'Firme o abdômen e mantenha o quadril praticamente parado.', 'Leve as costelas para baixo, em direção à pelve, aproximando os cotovelos das coxas.', 'Faça uma breve pausa embaixo e contraia o abdômen.', 'Desenrole o tronco devagar até o início, sem deixar a torre de pesos bater.']::text[],
  breathing = 'Inspire no alto, expire ao enrolar o tronco para baixo e inspire novamente ao voltar com controle.',
  common_mistakes = array['Inclinar o tronco a partir do quadril em vez de enrolar a coluna', 'Puxar o acessório para baixo com os braços', 'Ficar ereto demais e quase não mover o tronco', 'Deixar o peso puxar o tronco de volta para cima']::text[],
  instructions = 'Coloque a polia na posição alta e fique de costas para a máquina.
Segure o acessório ao lado da cabeça com as duas mãos e flexione levemente os joelhos.
Firme o abdômen e mantenha o quadril praticamente parado.
Leve as costelas para baixo, em direção à pelve, aproximando os cotovelos das coxas.
Faça uma breve pausa embaixo e contraia o abdômen.
Desenrole o tronco devagar até o início, sem deixar a torre de pesos bater.',
  content_pt_ready = true
where slug = 'cable-standing-crunch-0226';

update public.exercises set
  description = 'Levantamento composto clássico de membros inferiores com a barra apoiada no trapézio, voltado a quadríceps e glúteos.',
  steps = array['Apoie a barra na parte alta do trapézio e retire do suporte.', 'Fique em pé com os pés na largura dos ombros.', 'Desça no agachamento mantendo a coluna neutra.', 'Desça até as coxas ficarem paralelas ao chão ou abaixo disso.', 'Empurre com os calcanhares para voltar à posição em pé.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Arredondar a lombar', 'Tirar os calcanhares do chão']::text[],
  instructions = 'Apoie a barra na parte alta do trapézio e retire do suporte.
Fique em pé com os pés na largura dos ombros.
Desça no agachamento mantendo a coluna neutra.
Desça até as coxas ficarem paralelas ao chão ou abaixo disso.
Empurre com os calcanhares para voltar à posição em pé.',
  content_pt_ready = true
where slug = 'barbell-back-squat-1435';

update public.exercises set
  description = 'Rotação em pé na polia que trabalha os oblíquos girando o tronco na diagonal, cruzando o corpo.',
  steps = array['Ajuste a alça mais ou menos na altura dos ombros e fique de lado para a máquina, com os pés na largura do quadril.', 'Segure a alça com as duas mãos e estenda os braços à frente do peito, com os cotovelos levemente flexionados.', 'Firme o abdômen e gire o tronco para o lado oposto ao da máquina, conduzindo a alça na diagonal para baixo, cruzando o corpo.', 'Mantenha o quadril praticamente parado e termine com as mãos perto da parte externa do quadril oposto.', 'Conduza a alça de volta ao início com controle e repita todas as repetições antes de trocar de lado, ou inverta o percurso para ir de baixo para cima.']::text[],
  breathing = 'Expire ao girar e levar a alça cruzando o corpo; inspire ao voltar com controle.',
  common_mistakes = array['Girar o quadril e os pés junto com o cabo', 'Flexionar e estender os cotovelos para mover a carga', 'Deixar o cabo puxar o tronco de volta', 'Encolher os ombros em direção às orelhas']::text[],
  instructions = 'Ajuste a alça mais ou menos na altura dos ombros e fique de lado para a máquina, com os pés na largura do quadril.
Segure a alça com as duas mãos e estenda os braços à frente do peito, com os cotovelos levemente flexionados.
Firme o abdômen e gire o tronco para o lado oposto ao da máquina, conduzindo a alça na diagonal para baixo, cruzando o corpo.
Mantenha o quadril praticamente parado e termine com as mãos perto da parte externa do quadril oposto.
Conduza a alça de volta ao início com controle e repita todas as repetições antes de trocar de lado, ou inverta o percurso para ir de baixo para cima.',
  content_pt_ready = true
where slug = 'cable-twist-up-down-0862';

update public.exercises set
  description = 'Levantamento com barra baseado na dobradiça de quadril, que trabalha posteriores da coxa e glúteos descendo a barra pelas pernas com os joelhos quase estendidos.',
  steps = array['Fique em pé com os pés na largura do quadril e segure a barra à frente das coxas, com os braços estendidos.', 'Flexione levemente os joelhos e firme o abdômen.', 'Leve o quadril para trás e desça a barra pelas pernas, mantendo as costas retas e as pernas quase estendidas.', 'Desça até a barra chegar ao meio da canela ou até sentir um alongamento forte nos posteriores da coxa, sem perder a posição das costas.', 'Leve o quadril à frente e fique ereto, mantendo a barra perto das pernas em toda a subida.', 'Termine com o quadril estendido e os ombros alinhados sobre o quadril.']::text[],
  breathing = 'Inspire e firme o tronco antes de inclinar, e expire ao levar o quadril à frente para ficar em pé.',
  common_mistakes = array['Flexionar os joelhos como em um agachamento durante a descida', 'Deixar a barra se afastar à frente das pernas', 'Arredondar a lombar perto do fim da descida', 'Dar um tranco para sair de baixo em vez de subir de forma suave']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril e segure a barra à frente das coxas, com os braços estendidos.
Flexione levemente os joelhos e firme o abdômen.
Leve o quadril para trás e desça a barra pelas pernas, mantendo as costas retas e as pernas quase estendidas.
Desça até a barra chegar ao meio da canela ou até sentir um alongamento forte nos posteriores da coxa, sem perder a posição das costas.
Leve o quadril à frente e fique ereto, mantendo a barra perto das pernas em toda a subida.
Termine com o quadril estendido e os ombros alinhados sobre o quadril.',
  content_pt_ready = true
where slug = 'barbell-straight-leg-deadlift-0116';

update public.exercises set
  description = 'Exercício em máquina de alavanca que isola os glúteos com um movimento de extensão de quadril para trás.',
  steps = array['Ajuste a almofada da máquina na altura do peito e selecione a carga.', 'Apoie o pé que vai trabalhar na plataforma.', 'Segure as alças e firme o abdômen.', 'Estenda o quadril empurrando o pé para trás até onde for confortável.', 'Volte devagar à posição inicial e repita.']::text[],
  breathing = 'Expire ao empurrar para trás e inspire ao voltar.',
  common_mistakes = array['Usar a lombar para levantar', 'Balançar a perna com impulso', 'Não controlar a volta do movimento']::text[],
  instructions = 'Ajuste a almofada da máquina na altura do peito e selecione a carga.
Apoie o pé que vai trabalhar na plataforma.
Segure as alças e firme o abdômen.
Estenda o quadril empurrando o pé para trás até onde for confortável.
Volte devagar à posição inicial e repita.',
  content_pt_ready = true
where slug = 'lever-standing-rear-kick-drv-lever-standing-rear-kick';

update public.exercises set
  description = 'Desenvolvimento em pé com barra que constrói força e estabilidade geral nos ombros.',
  steps = array['Fique em pé com os pés na largura do quadril e a barra na altura dos ombros.', 'Segure a barra com as mãos um pouco mais afastadas que a largura dos ombros.', 'Firme o abdômen e contraia os glúteos.', 'Empurre a barra acima da cabeça até estender totalmente os braços.', 'Desça a barra devagar até os ombros.']::text[],
  breathing = 'Expire ao empurrar para cima e inspire ao descer.',
  common_mistakes = array['Inclinar demais o tronco para trás', 'Quicar a barra nos ombros', 'Abrir demais os cotovelos', 'Não descer a barra abaixo do queixo']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril e a barra na altura dos ombros.
Segure a barra com as mãos um pouco mais afastadas que a largura dos ombros.
Firme o abdômen e contraia os glúteos.
Empurre a barra acima da cabeça até estender totalmente os braços.
Desça a barra devagar até os ombros.',
  content_pt_ready = true
where slug = 'military-press-0553';

update public.exercises set
  description = 'Extensão de tríceps deitado feita com um halter por vez, descendo-o em direção à testa e estendendo o cotovelo de volta ao alto.',
  steps = array['Deite-se em um banco reto com um halter em cada mão e estenda os dois braços acima do peito, com as palmas voltadas uma para a outra.', 'Mantenha um braço parado acima do peito enquanto flexiona o outro cotovelo e desce esse halter ao lado da testa.', 'Pare quando o antebraço apontar para baixo e a parte de cima do braço continuar praticamente na vertical.', 'Estenda o braço flexionado para levar o halter de volta acima do peito.', 'Repita do outro lado, mantendo o primeiro braço estendido.', 'Continue alternando os lados, com os ombros e a cabeça apoiados no banco.']::text[],
  breathing = 'Inspire ao descer cada halter e expire ao estender o cotovelo para subi-lo.',
  common_mistakes = array['Abrir bastante os cotovelos durante a descida do halter', 'Deixar a parte de cima dos braços ir para trás em vez de ficar na vertical', 'Abaixar ou flexionar o braço que não está trabalhando', 'Transformar o movimento em supino a partir do peito']::text[],
  instructions = 'Deite-se em um banco reto com um halter em cada mão e estenda os dois braços acima do peito, com as palmas voltadas uma para a outra.
Mantenha um braço parado acima do peito enquanto flexiona o outro cotovelo e desce esse halter ao lado da testa.
Pare quando o antebraço apontar para baixo e a parte de cima do braço continuar praticamente na vertical.
Estenda o braço flexionado para levar o halter de volta acima do peito.
Repita do outro lado, mantendo o primeiro braço estendido.
Continue alternando os lados, com os ombros e a cabeça apoiados no banco.',
  content_pt_ready = true
where slug = 'dumbbell-lying-alternate-extension-1729';

update public.exercises set
  description = 'Variação de leg press com os pés próximos na plataforma, para enfatizar o quadríceps.',
  steps = array['Sente-se no leg press com os pés juntos na plataforma.', 'Ajuste o assento e a posição dos pés para ficar confortável e seguro.', 'Solte as travas de segurança e segure as alças de apoio.', 'Estenda os joelhos para empurrar a carga para cima.', 'Desça a plataforma devagar até a posição inicial.']::text[],
  breathing = 'Expire ao empurrar e inspire ao descer.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Deixar os calcanhares saírem da plataforma', 'Encurtar a amplitude do movimento']::text[],
  instructions = 'Sente-se no leg press com os pés juntos na plataforma.
Ajuste o assento e a posição dos pés para ficar confortável e seguro.
Solte as travas de segurança e segure as alças de apoio.
Estenda os joelhos para empurrar a carga para cima.
Desça a plataforma devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'close-feet-leg-press-drv-close-feet-leg-press';

update public.exercises set
  description = 'Rosca de bíceps sentado com um braço por vez, apoiando o braço na parte interna da coxa para isolar o bíceps.',
  steps = array['Sente-se no banco com os pés inteiros no chão e os joelhos afastados, segurando um halter em uma das mãos.', 'Incline-se um pouco à frente e apoie a parte de trás do braço na face interna da coxa do mesmo lado, perto do joelho.', 'Deixe o braço estendido para baixo, com a palma voltada para cima e o punho neutro.', 'Suba o halter em direção ao ombro do mesmo lado, sem mover a parte de cima do braço.', 'Contraia o bíceps no alto, quando o antebraço estiver quase na vertical.', 'Desça o halter devagar até estender totalmente o cotovelo, repita e depois troque de lado.']::text[],
  breathing = 'Inspire ao descer o halter e expire ao subi-lo.',
  common_mistakes = array['Tirar o cotovelo da coxa durante a rosca', 'Balançar o tronco para ajudar a subir o halter', 'Encurtar a repetição e não descer totalmente', 'Dobrar o punho para trás em vez de mantê-lo neutro']::text[],
  instructions = 'Sente-se no banco com os pés inteiros no chão e os joelhos afastados, segurando um halter em uma das mãos.
Incline-se um pouco à frente e apoie a parte de trás do braço na face interna da coxa do mesmo lado, perto do joelho.
Deixe o braço estendido para baixo, com a palma voltada para cima e o punho neutro.
Suba o halter em direção ao ombro do mesmo lado, sem mover a parte de cima do braço.
Contraia o bíceps no alto, quando o antebraço estiver quase na vertical.
Desça o halter devagar até estender totalmente o cotovelo, repita e depois troque de lado.',
  content_pt_ready = true
where slug = 'dumbbell-concentration-curl-0297';

update public.exercises set
  description = 'Exercício de core em pé na polia que leva a alça na diagonal cruzando o corpo, para trabalhar abdômen e oblíquos.',
  steps = array['Coloque a alça na posição baixa e fique de lado para a máquina, com os pés mais ou menos na largura dos ombros.', 'Segure a alça com as duas mãos perto do quadril mais próximo da máquina e estenda os braços, com os cotovelos levemente flexionados.', 'Firme o abdômen e vire um pouco o peito em direção à alça, sem arredondar as costas.', 'Leve a alça na diagonal para cima, cruzando o corpo em direção ao ombro oposto, girando o tronco e elevando os braços juntos.', 'Faça uma breve pausa no alto, com o quadril ainda voltado para frente e os braços estendidos.', 'Desça a alça com controle pelo mesmo caminho diagonal até o quadril de origem.', 'Faça todas as repetições de um lado, depois vire-se e repita do outro.']::text[],
  breathing = 'Inspire no início, expire ao elevar e girar cruzando o corpo e inspire ao voltar com controle.',
  common_mistakes = array['Flexionar os cotovelos e transformar o movimento em puxada de braço', 'Girar os joelhos para dentro em vez de girar o tronco', 'Inclinar o tronco para trás ou arquear a lombar no alto', 'Deixar o peso voltar rápido, sem controle']::text[],
  instructions = 'Coloque a alça na posição baixa e fique de lado para a máquina, com os pés mais ou menos na largura dos ombros.
Segure a alça com as duas mãos perto do quadril mais próximo da máquina e estenda os braços, com os cotovelos levemente flexionados.
Firme o abdômen e vire um pouco o peito em direção à alça, sem arredondar as costas.
Leve a alça na diagonal para cima, cruzando o corpo em direção ao ombro oposto, girando o tronco e elevando os braços juntos.
Faça uma breve pausa no alto, com o quadril ainda voltado para frente e os braços estendidos.
Desça a alça com controle pelo mesmo caminho diagonal até o quadril de origem.
Faça todas as repetições de um lado, depois vire-se e repita do outro.',
  content_pt_ready = true
where slug = 'cable-standing-lift-0230';

update public.exercises set
  description = 'Extensão de tríceps deitado com halteres, flexionando e estendendo os cotovelos para descer os pesos em direção à testa e subi-los novamente.',
  steps = array['Deite-se em um banco reto com um halter em cada mão e leve-os acima do peito, com as palmas voltadas uma para a outra.', 'Encaixe os ombros no banco e mantenha os punhos retos, para os halteres ficarem alinhados sobre os cotovelos.', 'Flexione os cotovelos e desça os halteres em direção às laterais da testa, mantendo a parte de cima dos braços praticamente parada.', 'Pare quando os cotovelos estiverem totalmente flexionados e os halteres próximos à cabeça.', 'Estenda os cotovelos para levar os halteres de volta acima do peito.', 'Repita sem deixar os cotovelos abrirem para os lados.']::text[],
  breathing = 'Inspire ao descer os halteres em direção à testa e expire ao estender os cotovelos para subi-los.',
  common_mistakes = array['Abrir bastante os cotovelos durante a descida dos halteres.', 'Deixar a parte de cima dos braços ir para trás ou à frente durante a repetição.', 'Descer demais os halteres atrás da cabeça em vez de ao lado da testa.', 'Dobrar os punhos para trás em vez de mantê-los retos.']::text[],
  instructions = 'Deite-se em um banco reto com um halter em cada mão e leve-os acima do peito, com as palmas voltadas uma para a outra.
Encaixe os ombros no banco e mantenha os punhos retos, para os halteres ficarem alinhados sobre os cotovelos.
Flexione os cotovelos e desça os halteres em direção às laterais da testa, mantendo a parte de cima dos braços praticamente parada.
Pare quando os cotovelos estiverem totalmente flexionados e os halteres próximos à cabeça.
Estenda os cotovelos para levar os halteres de volta acima do peito.
Repita sem deixar os cotovelos abrirem para os lados.',
  content_pt_ready = true
where slug = 'dumbbell-lying-triceps-extension-0351';

update public.exercises set
  description = 'Crucifixo inverso na polia baixa com as alças cruzadas, abrindo os braços para trás para trabalhar a parte posterior dos ombros e as costas altas.',
  steps = array['Coloque as duas alças nas polias baixas e fique no centro, entre elas.', 'Segure a alça da esquerda com a mão direita e a da direita com a mão esquerda, e dê um passo à frente para criar tensão.', 'Incline levemente o tronco à frente, com os joelhos um pouco flexionados, o peito erguido e as costas retas.', 'Comece com os braços apontados para baixo e cruzados à frente do corpo, com os cotovelos levemente flexionados.', 'Abra os dois braços para os lados e para trás em um arco amplo, até as mãos chegarem mais ou menos à altura dos ombros.', 'Contraia a parte de trás dos ombros e as costas altas na posição final.', 'Volte as alças devagar ao início, sem encolher os ombros nem mudar a posição do tronco.']::text[],
  breathing = 'Inspire ao voltar as alças ao início e expire ao abrir os braços para os lados e para trás.',
  common_mistakes = array['Ficar totalmente ereto e transformar o movimento em remada', 'Flexionar e estender os cotovelos durante a repetição', 'Encolher os ombros em direção às orelhas', 'Balançar o tronco para mover as alças']::text[],
  instructions = 'Coloque as duas alças nas polias baixas e fique no centro, entre elas.
Segure a alça da esquerda com a mão direita e a da direita com a mão esquerda, e dê um passo à frente para criar tensão.
Incline levemente o tronco à frente, com os joelhos um pouco flexionados, o peito erguido e as costas retas.
Comece com os braços apontados para baixo e cruzados à frente do corpo, com os cotovelos levemente flexionados.
Abra os dois braços para os lados e para trás em um arco amplo, até as mãos chegarem mais ou menos à altura dos ombros.
Contraia a parte de trás dos ombros e as costas altas na posição final.
Volte as alças devagar ao início, sem encolher os ombros nem mudar a posição do tronco.',
  content_pt_ready = true
where slug = 'cable-crossover-reverse-fly-0154';

update public.exercises set
  description = 'Extensão de quadril em máquina, para isolar e fortalecer os glúteos.',
  steps = array['Ajuste a máquina à sua altura.', 'Apoie um pé na plataforma e o peito na almofada.', 'Firme o abdômen e segure as alças para manter o equilíbrio.', 'Estenda o quadril empurrando a alavanca para trás com o calcanhar.', 'Volte à posição inicial e repita.']::text[],
  breathing = 'Expire ao estender o quadril e inspire ao voltar.',
  common_mistakes = array['Arquear demais a lombar', 'Usar o impulso', 'Travar o joelho no fim do movimento', 'Não completar a extensão']::text[],
  instructions = 'Ajuste a máquina à sua altura.
Apoie um pé na plataforma e o peito na almofada.
Firme o abdômen e segure as alças para manter o equilíbrio.
Estenda o quadril empurrando a alavanca para trás com o calcanhar.
Volte à posição inicial e repita.',
  content_pt_ready = true
where slug = 'lever-standing-hip-extension-2286';

update public.exercises set
  description = 'Exercício de dorsal na polia em que você leva a barra reta da altura dos ombros até as coxas, mantendo os braços praticamente estendidos.',
  steps = array['Prenda a barra reta na polia alta e fique de frente para a máquina.', 'Segure a barra com pegada por cima, dê um pequeno passo para trás e incline um pouco o tronco a partir do quadril.', 'Comece com os braços estendidos à frente, na altura dos ombros, e o tronco firme.', 'Leve a barra para baixo em um arco amplo, em direção às coxas, sem flexionar os cotovelos.', 'Contraia o dorsal embaixo, com a barra perto do quadril.', 'Deixe a barra subir devagar até a altura dos ombros, mantendo os braços estendidos e o tronco parado.']::text[],
  breathing = 'Inspire enquanto a barra sobe até o início e expire ao levá-la para baixo, em direção às coxas.',
  common_mistakes = array['Flexionar os cotovelos e transformar o movimento em extensão de tríceps', 'Inclinar o tronco para trás e usar balanço para mover a barra', 'Encolher os ombros em direção às orelhas', 'Deixar a barra se afastar do corpo embaixo']::text[],
  instructions = 'Prenda a barra reta na polia alta e fique de frente para a máquina.
Segure a barra com pegada por cima, dê um pequeno passo para trás e incline um pouco o tronco a partir do quadril.
Comece com os braços estendidos à frente, na altura dos ombros, e o tronco firme.
Leve a barra para baixo em um arco amplo, em direção às coxas, sem flexionar os cotovelos.
Contraia o dorsal embaixo, com a barra perto do quadril.
Deixe a barra subir devagar até a altura dos ombros, mantendo os braços estendidos e o tronco parado.',
  content_pt_ready = true
where slug = 'cable-straight-arm-pulldown-0238';

update public.exercises set
  description = 'Variação de agachamento com a barra apoiada à frente, na posição de rack, voltada ao quadríceps.',
  steps = array['Apoie a barra na altura da clavícula, com os cotovelos para cima.', 'Fique em pé com os pés na largura dos ombros.', 'Desça no agachamento mantendo o tronco ereto.', 'Desça até as coxas ficarem paralelas ao chão.', 'Empurre com os calcanhares para voltar à posição em pé.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Deixar os cotovelos caírem', 'Arredondar as costas', 'Tirar os calcanhares do chão']::text[],
  instructions = 'Apoie a barra na altura da clavícula, com os cotovelos para cima.
Fique em pé com os pés na largura dos ombros.
Desça no agachamento mantendo o tronco ereto.
Desça até as coxas ficarem paralelas ao chão.
Empurre com os calcanhares para voltar à posição em pé.',
  content_pt_ready = true
where slug = 'barbell-front-squat-0042';

update public.exercises set
  description = 'Exercício de isolamento do tríceps sentado, inclinando o tronco à frente e estendendo os halteres para trás ao esticar os cotovelos.',
  steps = array['Sente-se no banco com um halter em cada mão e os pés inteiros no chão.', 'Incline o tronco à frente a partir do quadril, mantendo as costas retas e o peito voltado para as coxas.', 'Leve os cotovelos para cima, junto ao tronco, e flexione-os a cerca de 90 graus.', 'Mantenha a parte de cima dos braços parada e estenda os cotovelos, levando os halteres para trás.', 'Contraia o tríceps com os braços totalmente estendidos.', 'Flexione os cotovelos devagar para voltar os halteres à posição inicial.']::text[],
  breathing = 'Inspire ao flexionar os cotovelos e descer os halteres, e expire ao estender os braços para trás.',
  common_mistakes = array['Balançar os halteres com os ombros', 'Deixar os cotovelos se afastarem do tronco', 'Abaixar a parte de cima dos braços durante a repetição', 'Arredondar as costas ao inclinar o tronco']::text[],
  instructions = 'Sente-se no banco com um halter em cada mão e os pés inteiros no chão.
Incline o tronco à frente a partir do quadril, mantendo as costas retas e o peito voltado para as coxas.
Leve os cotovelos para cima, junto ao tronco, e flexione-os a cerca de 90 graus.
Mantenha a parte de cima dos braços parada e estenda os cotovelos, levando os halteres para trás.
Contraia o tríceps com os braços totalmente estendidos.
Flexione os cotovelos devagar para voltar os halteres à posição inicial.',
  content_pt_ready = true
where slug = 'dumbbell-seated-kickback-0394';

update public.exercises set
  description = 'Remada curvada com barra e pegada por baixo (supinada), voltada ao dorsal e ao bíceps.',
  steps = array['Fique em pé com os pés na largura do quadril e a barra no chão.', 'Incline o tronco à frente a partir do quadril, com as costas retas, e segure a barra com pegada por baixo.', 'Deixe a barra suspensa com os braços estendidos, abaixo dos ombros.', 'Puxe a barra em direção ao tronco, com os cotovelos junto ao corpo.', 'Desça a barra com controle até a posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Arredondar a lombar', 'Abrir demais os cotovelos', 'Usar o impulso']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril e a barra no chão.
Incline o tronco à frente a partir do quadril, com as costas retas, e segure a barra com pegada por baixo.
Deixe a barra suspensa com os braços estendidos, abaixo dos ombros.
Puxe a barra em direção ao tronco, com os cotovelos junto ao corpo.
Desça a barra com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-underhand-bent-over-row-0027';

update public.exercises set
  description = 'Puxada sentado na polia, levando a barra de cima da cabeça até a parte alta do peito para trabalhar dorsal e braços.',
  steps = array['Ajuste o assento e a almofada de joelhos para que as coxas fiquem presas e você alcance a barra acima da cabeça.', 'Sente-se ereto com os pés inteiros no chão, segure a barra com pegada por cima um pouco mais aberta que os ombros e estenda os braços.', 'Incline levemente o tronco para trás e leve os ombros para baixo, longe das orelhas.', 'Leve os cotovelos para baixo e puxe a barra até a parte alta do peito.', 'Faça uma breve pausa mantendo o peito erguido e o tronco parado.', 'Estenda os braços devagar e deixe a barra subir com controle até a posição inicial.']::text[],
  breathing = 'Inspire enquanto a barra sobe e expire ao puxá-la até a parte alta do peito.',
  common_mistakes = array['Puxar a barra atrás da nuca', 'Balançar o tronco para trás para iniciar a repetição', 'Deixar os ombros encolherem no alto', 'Parar antes do fim e não estender totalmente os braços']::text[],
  instructions = 'Ajuste o assento e a almofada de joelhos para que as coxas fiquem presas e você alcance a barra acima da cabeça.
Sente-se ereto com os pés inteiros no chão, segure a barra com pegada por cima um pouco mais aberta que os ombros e estenda os braços.
Incline levemente o tronco para trás e leve os ombros para baixo, longe das orelhas.
Leve os cotovelos para baixo e puxe a barra até a parte alta do peito.
Faça uma breve pausa mantendo o peito erguido e o tronco parado.
Estenda os braços devagar e deixe a barra subir com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'cable-pulldown-0198';

update public.exercises set
  description = 'Flexão lateral de tronco feita sobre a bola suíça, voltada aos oblíquos.',
  steps = array['Posicione-se de lado sobre a bola suíça, com os pés bem apoiados.', 'Coloque a mão de cima atrás da cabeça e use a outra para manter o equilíbrio.', 'Desça o tronco sobre a bola até sentir o alongamento.', 'Contraia a lateral do corpo para subir o tronco na flexão lateral.', 'Desça com controle e repita.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Girar o tronco', 'Não estabilizar com o braço de baixo']::text[],
  instructions = 'Posicione-se de lado sobre a bola suíça, com os pés bem apoiados.
Coloque a mão de cima atrás da cabeça e use a outra para manter o equilíbrio.
Desça o tronco sobre a bola até sentir o alongamento.
Contraia a lateral do corpo para subir o tronco na flexão lateral.
Desça com controle e repita.',
  content_pt_ready = true
where slug = 'side-bend-on-stability-ball-0850';

update public.exercises set
  description = 'Exercício de trapézio em pé, segurando a barra à frente das coxas e elevando os ombros em linha reta.',
  steps = array['Fique em pé com os pés entre a largura do quadril e a dos ombros e segure a barra à frente das coxas com pegada por cima.', 'Deixe os braços estendidos, firme o tronco e mantenha o peito erguido.', 'Eleve os ombros em direção às orelhas, sem flexionar os cotovelos nem inclinar o tronco para trás.', 'Faça uma breve pausa no alto e contraia a parte superior do trapézio.', 'Desça os ombros com controle até a posição inicial.']::text[],
  breathing = 'Inspire antes de cada repetição, expire ao elevar os ombros e inspire ao descê-los.',
  common_mistakes = array['Flexionar os cotovelos para puxar a barra para cima.', 'Girar os ombros para frente ou para trás no alto.', 'Inclinar o tronco para trás e balançar para mover a barra.', 'Projetar a cabeça à frente durante a subida dos ombros.']::text[],
  instructions = 'Fique em pé com os pés entre a largura do quadril e a dos ombros e segure a barra à frente das coxas com pegada por cima.
Deixe os braços estendidos, firme o tronco e mantenha o peito erguido.
Eleve os ombros em direção às orelhas, sem flexionar os cotovelos nem inclinar o tronco para trás.
Faça uma breve pausa no alto e contraia a parte superior do trapézio.
Desça os ombros com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-shrug-0095';

update public.exercises set
  description = 'Crucifixo feito sobre a bola suíça, descendo os halteres em arco amplo e voltando a uni-los acima do peito.',
  steps = array['Sente-se na bola com um halter em cada mão apoiado nas coxas.', 'Caminhe com os pés à frente e role o corpo até apoiar cabeça, pescoço e parte alta das costas na bola; depois eleve o quadril para deixar o tronco nivelado.', 'Leve os halteres acima do peito, com as palmas voltadas uma para a outra e os cotovelos levemente flexionados.', 'Abra os braços para os lados em um arco amplo, mantendo a mesma leve flexão dos cotovelos.', 'Pare quando a parte de cima dos braços ficar mais ou menos alinhada com o tronco e o peito alongado.', 'Volte a unir os halteres acima do peito pelo mesmo arco e contraia o peito no alto.']::text[],
  breathing = 'Inspire ao abrir os halteres para os lados e expire ao uni-los novamente acima do peito.',
  common_mistakes = array['Deixar o quadril afundar abaixo da linha do tronco', 'Flexionar demais os cotovelos e transformar o movimento em supino', 'Descer os halteres muito abaixo da linha do peito', 'Encolher os ombros em direção às orelhas']::text[],
  instructions = 'Sente-se na bola com um halter em cada mão apoiado nas coxas.
Caminhe com os pés à frente e role o corpo até apoiar cabeça, pescoço e parte alta das costas na bola; depois eleve o quadril para deixar o tronco nivelado.
Leve os halteres acima do peito, com as palmas voltadas uma para a outra e os cotovelos levemente flexionados.
Abra os braços para os lados em um arco amplo, mantendo a mesma leve flexão dos cotovelos.
Pare quando a parte de cima dos braços ficar mais ou menos alinhada com o tronco e o peito alongado.
Volte a unir os halteres acima do peito pelo mesmo arco e contraia o peito no alto.',
  content_pt_ready = true
where slug = 'dumbbell-fly-on-exercise-ball-1277';

update public.exercises set
  description = 'Extensão de tríceps sentado acima da cabeça, usando um halter segurado com as duas mãos para flexionar e estender os cotovelos.',
  steps = array['Sente-se ereto em um banco ou cadeira, com os dois pés inteiros no chão.', 'Segure um halter com as duas mãos pelo cabo, com pegada por cima, e leve-o acima da cabeça.', 'Aproxime a parte de cima dos braços das orelhas e aponte os cotovelos para frente.', 'Desça o halter atrás da cabeça flexionando apenas os cotovelos.', 'Pare quando os antebraços passarem abaixo da linha paralela, mantendo a parte de cima dos braços praticamente parada.', 'Estenda os cotovelos para levar o halter de volta acima da cabeça.']::text[],
  breathing = 'Inspire ao descer o halter atrás da cabeça e expire ao estender os cotovelos para subi-lo.',
  common_mistakes = array['Abrir bastante os cotovelos para os lados.', 'Deixar a parte de cima dos braços ir para trás e se mover durante a repetição.', 'Arquear a lombar quando o peso vai acima da cabeça.', 'Descer demais o halter e bater na parte alta das costas.']::text[],
  instructions = 'Sente-se ereto em um banco ou cadeira, com os dois pés inteiros no chão.
Segure um halter com as duas mãos pelo cabo, com pegada por cima, e leve-o acima da cabeça.
Aproxime a parte de cima dos braços das orelhas e aponte os cotovelos para frente.
Desça o halter atrás da cabeça flexionando apenas os cotovelos.
Pare quando os antebraços passarem abaixo da linha paralela, mantendo a parte de cima dos braços praticamente parada.
Estenda os cotovelos para levar o halter de volta acima da cabeça.',
  content_pt_ready = true
where slug = 'dumbbell-pronate-grip-triceps-extension-0373';

update public.exercises set
  description = 'Puxada em máquina com pegada por baixo, para trabalhar o dorsal em um movimento de puxada vertical.',
  steps = array['Ajuste o assento para que os joelhos fiquem bem encaixados sob as almofadas e apoie os pés no chão.', 'Estenda os braços para cima e segure as alças com pegada por baixo, mais ou menos na largura dos ombros.', 'Sente-se ereto com o peito erguido e os braços totalmente estendidos acima da cabeça.', 'Puxe as alças em direção à parte alta do peito, levando os cotovelos para baixo e para trás.', 'Contraia as costas altas e o dorsal embaixo, sem inclinar muito o tronco para trás.', 'Deixe as alças subirem devagar até estender os braços novamente, mantendo o controle.']::text[],
  breathing = 'Inspire enquanto as alças sobem e expire ao puxá-las em direção ao peito.',
  common_mistakes = array['Inclinar muito o tronco para trás e transformar o movimento em remada', 'Puxar as alças atrás da nuca', 'Encolher os ombros em direção às orelhas', 'Deixar o peso bater no alto']::text[],
  instructions = 'Ajuste o assento para que os joelhos fiquem bem encaixados sob as almofadas e apoie os pés no chão.
Estenda os braços para cima e segure as alças com pegada por baixo, mais ou menos na largura dos ombros.
Sente-se ereto com o peito erguido e os braços totalmente estendidos acima da cabeça.
Puxe as alças em direção à parte alta do peito, levando os cotovelos para baixo e para trás.
Contraia as costas altas e o dorsal embaixo, sem inclinar muito o tronco para trás.
Deixe as alças subirem devagar até estender os braços novamente, mantendo o controle.',
  content_pt_ready = true
where slug = 'reverse-grip-machine-lat-pulldown-0673';

update public.exercises set
  description = 'Exercício de isolamento do ombro na polia feito com um braço por vez, elevando o braço para o lado para trabalhar a porção lateral do deltoide.',
  steps = array['Fique de lado para a máquina e segure a alça com a mão de fora.', 'Afaste-se até o cabo ficar tensionado, com o braço ao lado do corpo e o cotovelo levemente flexionado.', 'Firme o tronco e mantenha os ombros nivelados.', 'Eleve o braço para o lado até a mão chegar mais ou menos à altura do ombro.', 'Faça uma breve pausa sem encolher o ombro.', 'Desça a alça com controle até a posição inicial.', 'Faça as repetições de um lado e depois troque de braço.']::text[],
  breathing = 'Expire ao elevar o braço para o lado e inspire ao descê-lo com controle.',
  common_mistakes = array['Encolher o ombro que trabalha em direção à orelha', 'Balançar o tronco para iniciar a repetição', 'Transformar a elevação lateral em elevação frontal', 'Elevar a mão muito acima da altura do ombro']::text[],
  instructions = 'Fique de lado para a máquina e segure a alça com a mão de fora.
Afaste-se até o cabo ficar tensionado, com o braço ao lado do corpo e o cotovelo levemente flexionado.
Firme o tronco e mantenha os ombros nivelados.
Eleve o braço para o lado até a mão chegar mais ou menos à altura do ombro.
Faça uma breve pausa sem encolher o ombro.
Desça a alça com controle até a posição inicial.
Faça as repetições de um lado e depois troque de braço.',
  content_pt_ready = true
where slug = 'cable-one-arm-lateral-raise-0192';

update public.exercises set
  description = 'Puxada vertical voltada ao dorsal, usando uma alça individual na polia.',
  steps = array['Prenda uma alça individual na polia alta.', 'Sente-se ou fique em pé, com o braço acima da cabeça segurando a alça.', 'Estabilize o corpo e contraia o abdômen.', 'Puxe a alça até a altura do ombro ou da parte alta do peito.', 'Faça uma pausa e deixe a alça voltar devagar.']::text[],
  breathing = 'Expire ao puxar para baixo e inspire ao deixar subir.',
  common_mistakes = array['Arquear demais as costas', 'Deixar o ombro rodar para frente', 'Usar o impulso']::text[],
  instructions = 'Prenda uma alça individual na polia alta.
Sente-se ou fique em pé, com o braço acima da cabeça segurando a alça.
Estabilize o corpo e contraia o abdômen.
Puxe a alça até a altura do ombro ou da parte alta do peito.
Faça uma pausa e deixe a alça voltar devagar.',
  content_pt_ready = true
where slug = 'cable-one-arm-lateral-pulldown-2616';

update public.exercises set
  description = 'Variação de rosca com halteres em que cada mão cruza o corpo em direção ao ombro oposto, com pegada neutra.',
  steps = array['Fique em pé com um halter em cada mão ao lado do corpo e as palmas voltadas para dentro.', 'Firme o tronco e mantenha os cotovelos junto às costelas.', 'Suba um halter na diagonal, cruzando o corpo em direção ao ombro oposto, sem balançar.', 'Faça uma breve pausa perto da altura do ombro, com o punho reto e a palma voltada para dentro.', 'Desça o halter de volta ao lado do corpo com controle.', 'Repita com o outro braço, alternando os lados.']::text[],
  breathing = 'Expire ao subir o halter cruzando o corpo e inspire ao descê-lo.',
  common_mistakes = array['Balançar o tronco ou inclinar para trás para subir o halter', 'Deixar o cotovelo avançar e se afastar das costelas', 'Girar o punho para a palma ficar voltada para cima no alto', 'Deixar o halter cair rápido em vez de descer com controle']::text[],
  instructions = 'Fique em pé com um halter em cada mão ao lado do corpo e as palmas voltadas para dentro.
Firme o tronco e mantenha os cotovelos junto às costelas.
Suba um halter na diagonal, cruzando o corpo em direção ao ombro oposto, sem balançar.
Faça uma breve pausa perto da altura do ombro, com o punho reto e a palma voltada para dentro.
Desça o halter de volta ao lado do corpo com controle.
Repita com o outro braço, alternando os lados.',
  content_pt_ready = true
where slug = 'dumbbell-cross-body-hammer-curl-0298';

update public.exercises set
  description = 'Crucifixo com halteres feito sobre a bola suíça, com o tronco apoiado em ângulo inclinado.',
  steps = array['Segure um halter em cada mão e apoie a parte alta das costas na bola, de modo que o tronco fique inclinado para cima.', 'Apoie os pés com firmeza no chão e leve os halteres acima da parte alta do peito, com as palmas voltadas uma para a outra.', 'Mantenha os cotovelos levemente flexionados e abra os braços para os lados em um arco amplo.', 'Pare quando os cotovelos ficarem mais ou menos na altura do peito e você sentir o peito alongar.', 'Contraia o peito e suba os halteres pelo mesmo arco até uni-los acima do peito.']::text[],
  breathing = 'Inspire ao abrir os halteres para os lados e expire ao uni-los acima do peito.',
  common_mistakes = array['Estender os cotovelos e transformar o movimento em supino', 'Descer os halteres muito abaixo da linha do peito', 'Quicar o quadril ou deixar a bola rolar', 'Subir os halteres de forma desigual ou batê-los um no outro']::text[],
  instructions = 'Segure um halter em cada mão e apoie a parte alta das costas na bola, de modo que o tronco fique inclinado para cima.
Apoie os pés com firmeza no chão e leve os halteres acima da parte alta do peito, com as palmas voltadas uma para a outra.
Mantenha os cotovelos levemente flexionados e abra os braços para os lados em um arco amplo.
Pare quando os cotovelos ficarem mais ou menos na altura do peito e você sentir o peito alongar.
Contraia o peito e suba os halteres pelo mesmo arco até uni-los acima do peito.',
  content_pt_ready = true
where slug = 'dumbbell-incline-fly-on-exercise-ball-1278';

update public.exercises set
  description = 'Rosca de bíceps sentado em banco inclinado com halteres, que trabalha o bíceps em uma amplitude maior.',
  steps = array['Ajuste o banco inclinado e sente-se recostado com um halter em cada mão.', 'Deixe os braços estendidos para baixo, abaixo dos ombros, com as palmas voltadas para frente.', 'Mantenha a parte de cima dos braços parada e suba os halteres em direção aos ombros.', 'Faça uma breve pausa no alto e contraia o bíceps.', 'Desça os halteres devagar até estender totalmente os cotovelos.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao subi-los.',
  common_mistakes = array['Balançar os halteres para iniciar a rosca', 'Deixar os cotovelos avançarem durante a subida', 'Parar antes do fim e não descer totalmente os halteres', 'Dobrar os punhos para trás durante a rosca']::text[],
  instructions = 'Ajuste o banco inclinado e sente-se recostado com um halter em cada mão.
Deixe os braços estendidos para baixo, abaixo dos ombros, com as palmas voltadas para frente.
Mantenha a parte de cima dos braços parada e suba os halteres em direção aos ombros.
Faça uma breve pausa no alto e contraia o bíceps.
Desça os halteres devagar até estender totalmente os cotovelos.',
  content_pt_ready = true
where slug = 'dumbbell-incline-curl-0318';

update public.exercises set
  description = 'Exercício de isolamento do tríceps com corda na polia alta, estendendo os cotovelos acima da cabeça.',
  steps = array['Prenda a corda na polia alta.', 'Fique em pé (ou ajoelhado) de costas para a máquina.', 'Segure a corda, dê um passo à frente e incline levemente o tronco.', 'Mantenha a parte de cima dos braços parada e estenda os cotovelos, levando a corda à frente e para cima.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao estender e inspire ao flexionar os cotovelos.',
  common_mistakes = array['Mover a parte de cima dos braços', 'Abrir os cotovelos para os lados', 'Arquear ou balançar as costas']::text[],
  instructions = 'Prenda a corda na polia alta.
Fique em pé (ou ajoelhado) de costas para a máquina.
Segure a corda, dê um passo à frente e incline levemente o tronco.
Mantenha a parte de cima dos braços parada e estenda os cotovelos, levando a corda à frente e para cima.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'cable-rope-overhead-triceps-extension-0194';

update public.exercises set
  description = 'Rosca direta em pé, levando os halteres da lateral do corpo até os ombros para trabalhar o bíceps.',
  steps = array['Fique em pé com um halter em cada mão, os braços ao lado do corpo e as palmas voltadas para frente.', 'Firme o tronco e mantenha os cotovelos junto às costelas.', 'Suba os dois halteres em direção aos ombros, sem deixar a parte de cima dos braços balançar à frente.', 'Faça uma breve pausa no alto e contraia o bíceps.', 'Desça os halteres com controle até estender os braços.']::text[],
  breathing = 'Expire ao subir os halteres e inspire ao descê-los.',
  common_mistakes = array['Balançar o tronco para iniciar a rosca', 'Deixar os cotovelos avançarem durante a subida', 'Usar amplitude parcial e não descer totalmente', 'Dobrar os punhos para trás em vez de mantê-los neutros']::text[],
  instructions = 'Fique em pé com um halter em cada mão, os braços ao lado do corpo e as palmas voltadas para frente.
Firme o tronco e mantenha os cotovelos junto às costelas.
Suba os dois halteres em direção aos ombros, sem deixar a parte de cima dos braços balançar à frente.
Faça uma breve pausa no alto e contraia o bíceps.
Desça os halteres com controle até estender os braços.',
  content_pt_ready = true
where slug = 'dumbbell-biceps-curl-0294';

update public.exercises set
  description = 'Puxada na polia com pegada aberta, voltada principalmente ao dorsal, para desenvolver largura das costas e força na parte superior do corpo.',
  steps = array['Ajuste a almofada das coxas e sente-se na máquina de puxada.', 'Segure a barra longa acima da cabeça com pegada pronada (por cima), com as mãos mais afastadas que os ombros.', 'Incline levemente o tronco para trás, firme o abdômen e aproxime as escápulas.', 'Puxe a barra até a parte alta do peito, levando os cotovelos para baixo e para fora.', 'Faça uma breve pausa e deixe a barra voltar devagar à posição inicial.']::text[],
  breathing = 'Expire ao puxar a barra para baixo e inspire ao voltar ao início.',
  common_mistakes = array['Usar impulso ou balançar o corpo', 'Deixar os ombros encolherem para cima', 'Não estender totalmente os braços', 'Puxar a barra atrás da nuca']::text[],
  instructions = 'Ajuste a almofada das coxas e sente-se na máquina de puxada.
Segure a barra longa acima da cabeça com pegada pronada (por cima), com as mãos mais afastadas que os ombros.
Incline levemente o tronco para trás, firme o abdômen e aproxime as escápulas.
Puxe a barra até a parte alta do peito, levando os cotovelos para baixo e para fora.
Faça uma breve pausa e deixe a barra voltar devagar à posição inicial.',
  content_pt_ready = true
where slug = 'wide-grip-cable-lat-pulldown-drv-cable-bar-lateral-pulldown-wide-shoulder-grip';

update public.exercises set
  description = 'Extensão de tríceps deitado na polia, flexionando e estendendo os cotovelos para mover a corda acima do peito.',
  steps = array['Prenda a corda na polia baixa e posicione um banco reto alinhado com a polia.', 'Deite-se de costas no banco, com a cabeça voltada para o cabo, e segure a corda com pegada neutra.', 'Leve a corda acima do peito, com os braços totalmente estendidos.', 'Mantenha a parte de cima dos braços praticamente parada e flexione os cotovelos, descendo a corda em direção à testa.', 'Faça uma breve pausa com os cotovelos bem flexionados.', 'Estenda os cotovelos para levar a corda de volta acima do peito.']::text[],
  breathing = 'Inspire ao descer a corda em direção à testa e expire ao estender os cotovelos de volta ao início.',
  common_mistakes = array['Deixar os cotovelos abrirem bastante para os lados', 'Levar a parte de cima dos braços para trás e transformar o movimento em pullover', 'Descer a corda atrás da cabeça em vez de em direção à testa', 'Quicar para sair de baixo em vez de controlar o cabo']::text[],
  instructions = 'Prenda a corda na polia baixa e posicione um banco reto alinhado com a polia.
Deite-se de costas no banco, com a cabeça voltada para o cabo, e segure a corda com pegada neutra.
Leve a corda acima do peito, com os braços totalmente estendidos.
Mantenha a parte de cima dos braços praticamente parada e flexione os cotovelos, descendo a corda em direção à testa.
Faça uma breve pausa com os cotovelos bem flexionados.
Estenda os cotovelos para levar a corda de volta acima do peito.',
  content_pt_ready = true
where slug = 'cable-lying-triceps-extension-0186';

update public.exercises set
  description = 'Remada unilateral na polia com rotação de tronco, que aciona o dorsal e o core.',
  steps = array['Sente-se no banco de remada e segure uma alça individual com uma das mãos.', 'Mantenha as costas retas e os pés apoiados na plataforma.', 'Puxe a alça em direção ao tronco girando o ombro e a parte de cima do corpo para o lado que trabalha.', 'Faça uma pausa e contraia os músculos das costas no fim do movimento.', 'Volte o braço e o tronco devagar à posição inicial, com controle.']::text[],
  breathing = 'Expire ao puxar e girar, inspire ao estender e voltar.',
  common_mistakes = array['Girar além do necessário', 'Usar o impulso', 'Encolher o ombro']::text[],
  instructions = 'Sente-se no banco de remada e segure uma alça individual com uma das mãos.
Mantenha as costas retas e os pés apoiados na plataforma.
Puxe a alça em direção ao tronco girando o ombro e a parte de cima do corpo para o lado que trabalha.
Faça uma pausa e contraia os músculos das costas no fim do movimento.
Volte o braço e o tronco devagar à posição inicial, com controle.',
  content_pt_ready = true
where slug = 'cable-one-arm-twisting-seated-row-0861';

update public.exercises set
  description = 'Exercício de isolamento do peito em máquina, contraindo o peitoral em um movimento de crucifixo.',
  steps = array['Ajuste o assento e sente-se com as costas apoiadas no encosto.', 'Apoie os antebraços nas almofadas, com os cotovelos levemente flexionados.', 'Aproxime os braços em um arco amplo.', 'Contraia o peito no fim do movimento.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao aproximar os braços e inspire ao abrir.',
  common_mistakes = array['Travar os cotovelos', 'Arquear a lombar', 'Usar carga excessiva']::text[],
  instructions = 'Ajuste o assento e sente-se com as costas apoiadas no encosto.
Apoie os antebraços nas almofadas, com os cotovelos levemente flexionados.
Aproxime os braços em um arco amplo.
Contraia o peito no fim do movimento.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'pec-deck-fly-drv-lever-pec-deck-fly';

update public.exercises set
  description = 'Supino inclinado com halteres, para trabalhar a parte alta do peito, os ombros e o tríceps.',
  steps = array['Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.', 'Deite-se no banco e leve os halteres à altura do peito, com as palmas voltadas para frente.', 'Apoie os pés no chão e deixe os cotovelos um pouco abaixo da linha dos ombros.', 'Empurre os halteres acima da parte alta do peito até estender os braços.', 'Desça os halteres com controle para os lados da parte alta do peito.', 'Repita empurrando novamente pelo mesmo caminho.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao empurrá-los para cima.',
  common_mistakes = array['Abrir os cotovelos totalmente para os lados', 'Deixar os halteres irem em direção ao rosto', 'Quicar os halteres na altura do peito', 'Arquear a lombar e sair do banco']::text[],
  instructions = 'Ajuste o banco inclinado e sente-se com um halter em cada mão apoiado nas coxas.
Deite-se no banco e leve os halteres à altura do peito, com as palmas voltadas para frente.
Apoie os pés no chão e deixe os cotovelos um pouco abaixo da linha dos ombros.
Empurre os halteres acima da parte alta do peito até estender os braços.
Desça os halteres com controle para os lados da parte alta do peito.
Repita empurrando novamente pelo mesmo caminho.',
  content_pt_ready = true
where slug = 'dumbbell-incline-bench-press-0314';

update public.exercises set
  description = 'Encolhimento de ombros em máquina, elevando os ombros contra as alças para trabalhar a parte superior do trapézio.',
  steps = array['Ajuste a máquina para que as alças fiquem ao lado do corpo com os ombros relaxados.', 'Sente-se ou fique em pé apoiado na almofada e segure as alças com pegada firme por cima.', 'Estenda os braços, mantenha o peito erguido e o pescoço neutro.', 'Eleve os ombros em direção às orelhas sem flexionar os cotovelos.', 'Faça uma breve pausa no alto, mantendo o tronco parado.', 'Desça os ombros com controle até a posição inicial.']::text[],
  breathing = 'Inspire embaixo, expire ao elevar os ombros e inspire ao descê-los.',
  common_mistakes = array['Flexionar os cotovelos e transformar o movimento em remada', 'Girar os ombros para frente ou para trás', 'Inclinar o tronco para mover a carga', 'Projetar o queixo à frente durante a subida dos ombros']::text[],
  instructions = 'Ajuste a máquina para que as alças fiquem ao lado do corpo com os ombros relaxados.
Sente-se ou fique em pé apoiado na almofada e segure as alças com pegada firme por cima.
Estenda os braços, mantenha o peito erguido e o pescoço neutro.
Eleve os ombros em direção às orelhas sem flexionar os cotovelos.
Faça uma breve pausa no alto, mantendo o tronco parado.
Desça os ombros com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'lever-shrug-0604';

update public.exercises set
  description = 'Rotação de tronco deitado com resistência adicional, voltada aos oblíquos.',
  steps = array['Deite-se de costas com os braços abertos para dar apoio.', 'Segure um peso entre os pés (ou sobre o peito).', 'Eleve as pernas até formar um ângulo de 90 graus.', 'Gire as pernas devagar para um lado, mantendo os ombros apoiados.', 'Volte ao centro e repita para o outro lado.']::text[],
  breathing = 'Expire ao girar e inspire ao voltar ao centro.',
  common_mistakes = array['Deixar os ombros saírem do chão', 'Usar o impulso', 'Descer demais as pernas']::text[],
  instructions = 'Deite-se de costas com os braços abertos para dar apoio.
Segure um peso entre os pés (ou sobre o peito).
Eleve as pernas até formar um ângulo de 90 graus.
Gire as pernas devagar para um lado, mantendo os ombros apoiados.
Volte ao centro e repita para o outro lado.',
  content_pt_ready = true
where slug = 'weighted-lying-twist-0846';

update public.exercises set
  description = 'Leg press 45° com os pés afastados, movimento composto voltado ao quadríceps com maior participação de glúteos e adutores.',
  steps = array['Ajuste o assento e coloque a carga desejada.', 'Sente-se com as costas e a cabeça apoiadas no encosto e os pés inteiros e afastados na plataforma.', 'Solte as travas de segurança e segure as alças laterais.', 'Flexione os joelhos para descer a plataforma até as coxas chegarem a 90 graus ou um pouco além.', 'Empurre com os calcanhares para estender as pernas, sem travar os joelhos.']::text[],
  breathing = 'Inspire ao descer a plataforma e expire ao empurrá-la para cima.',
  common_mistakes = array['Deixar os joelhos caírem para dentro', 'Arredondar a lombar', 'Fazer meias repetições ou amplitude curta', 'Travar os joelhos no fim da extensão']::text[],
  instructions = 'Ajuste o assento e coloque a carga desejada.
Sente-se com as costas e a cabeça apoiadas no encosto e os pés inteiros e afastados na plataforma.
Solte as travas de segurança e segure as alças laterais.
Flexione os joelhos para descer a plataforma até as coxas chegarem a 90 graus ou um pouco além.
Empurre com os calcanhares para estender as pernas, sem travar os joelhos.',
  content_pt_ready = true
where slug = 'sled-45-degree-wide-leg-press-0740';

update public.exercises set
  description = 'Agachamento no Smith voltado ao quadríceps, que também trabalha glúteos e posteriores da coxa com trajetória de barra controlada.',
  steps = array['Apoie a barra do Smith na parte alta das costas e fique em pé com os pés mais ou menos na largura dos ombros, um pouco à frente da linha da barra.', 'Retire a barra do suporte e firme o abdômen, com o peito erguido e o olhar à frente.', 'Flexione joelhos e quadril juntos para descer em linha reta, com controle.', 'Desça até as coxas ficarem mais ou menos paralelas ao chão ou um pouco abaixo, mantendo os calcanhares apoiados.', 'Empurre com o meio do pé e os calcanhares para voltar a ficar em pé, até estender totalmente joelhos e quadril.', 'Termine ereto e repita na próxima repetição.']::text[],
  breathing = 'Inspire e firme o tronco antes de descer, e expire ao voltar à posição em pé.',
  common_mistakes = array['Deixar os pés exatamente sob a barra, fazendo os joelhos avançarem demais.', 'Tirar os calcanhares do chão na parte mais baixa.', 'Deixar os joelhos caírem para dentro na subida.', 'Arredondar a lombar durante a descida do quadril.']::text[],
  instructions = 'Apoie a barra do Smith na parte alta das costas e fique em pé com os pés mais ou menos na largura dos ombros, um pouco à frente da linha da barra.
Retire a barra do suporte e firme o abdômen, com o peito erguido e o olhar à frente.
Flexione joelhos e quadril juntos para descer em linha reta, com controle.
Desça até as coxas ficarem mais ou menos paralelas ao chão ou um pouco abaixo, mantendo os calcanhares apoiados.
Empurre com o meio do pé e os calcanhares para voltar a ficar em pé, até estender totalmente joelhos e quadril.
Termine ereto e repita na próxima repetição.',
  content_pt_ready = true
where slug = 'smith-chair-squat-0750';

update public.exercises set
  description = 'Alongamento no chão em quatro apoios, voltado aos adutores e à região da virilha.',
  steps = array['Comece em quatro apoios, com as mãos e os joelhos no chão.', 'Afaste os joelhos, mantendo canelas e pés alinhados com eles.', 'Aproxime o quadril do chão, mantendo as costas retas.', 'Leve o quadril suavemente para trás até sentir alongar a virilha.', 'Mantenha a posição e respire fundo.']::text[],
  breathing = 'Respire de forma lenta e profunda durante todo o alongamento.',
  common_mistakes = array['Arquear a lombar', 'Deixar os pés se juntarem', 'Alongar além do confortável']::text[],
  instructions = 'Comece em quatro apoios, com as mãos e os joelhos no chão.
Afaste os joelhos, mantendo canelas e pés alinhados com eles.
Aproxime o quadril do chão, mantendo as costas retas.
Leve o quadril suavemente para trás até sentir alongar a virilha.
Mantenha a posição e respire fundo.',
  content_pt_ready = true
where slug = 'all-fours-groin-stretch-drv-stretching-all-fours-squad-stretch';

update public.exercises set
  description = 'Postura de yoga que alonga e ativa glúteos, lombar e flexores do quadril.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.', 'Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.', 'Empurre com os calcanhares e eleve o quadril.', 'Mantenha a postura, contraindo glúteos e abdômen.', 'Desça o quadril de volta à posição inicial.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer.',
  common_mistakes = array['Arquear demais as costas', 'Deixar os joelhos caírem para fora ou para dentro', 'Não contrair o abdômen']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.
Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.
Empurre com os calcanhares e eleve o quadril.
Mantenha a postura, contraindo glúteos e abdômen.
Desça o quadril de volta à posição inicial.',
  content_pt_ready = true
where slug = 'bridge-pose-setu-bandhasana-drv-stretching-bridge-pose-setu-bandhasana';

update public.exercises set
  description = 'Exercício de isolamento do ombro em que você eleva a barra à frente do corpo para trabalhar a porção anterior do deltoide.',
  steps = array['Fique em pé com os pés na largura do quadril e segure a barra junto às coxas, com pegada por cima.', 'Firme o abdômen e mantenha os cotovelos levemente flexionados.', 'Eleve a barra à frente do corpo até a altura dos ombros.', 'Faça uma breve pausa sem encolher os ombros.', 'Desça a barra de volta às coxas com controle.', 'Reajuste a postura e repita o movimento.']::text[],
  breathing = 'Expire ao elevar a barra e inspire ao descê-la.',
  common_mistakes = array['Inclinar o tronco para trás para iniciar a subida.', 'Balançar a barra com o quadril.', 'Elevar a barra acima da altura dos ombros.', 'Encolher os ombros em direção às orelhas.']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril e segure a barra junto às coxas, com pegada por cima.
Firme o abdômen e mantenha os cotovelos levemente flexionados.
Eleve a barra à frente do corpo até a altura dos ombros.
Faça uma breve pausa sem encolher os ombros.
Desça a barra de volta às coxas com controle.
Reajuste a postura e repita o movimento.',
  content_pt_ready = true
where slug = 'barbell-front-raise-0041';

update public.exercises set
  description = 'Exercício de isolamento do tríceps na polia, empurrando a corda para baixo.',
  steps = array['Prenda a corda na polia alta e fique de frente para a máquina.', 'Segure a corda com as duas mãos, com os polegares voltados para dentro.', 'Mantenha os cotovelos junto ao corpo e incline levemente o tronco à frente.', 'Estenda os braços para baixo, afastando as pontas da corda no fim do movimento.', 'Volte devagar ao início sem deixar os cotovelos abrirem.']::text[],
  breathing = 'Expire ao empurrar para baixo e inspire ao voltar.',
  common_mistakes = array['Abrir os cotovelos para os lados', 'Usar o impulso', 'Não estender totalmente os braços']::text[],
  instructions = 'Prenda a corda na polia alta e fique de frente para a máquina.
Segure a corda com as duas mãos, com os polegares voltados para dentro.
Mantenha os cotovelos junto ao corpo e incline levemente o tronco à frente.
Estenda os braços para baixo, afastando as pontas da corda no fim do movimento.
Volte devagar ao início sem deixar os cotovelos abrirem.',
  content_pt_ready = true
where slug = 'cable-rope-triceps-pushdown-0200';

update public.exercises set
  description = 'Extensão de tríceps deitado com barra W, que trabalha o tríceps reduzindo a tensão nos punhos.',
  steps = array['Deite-se no banco e segure a barra W com pegada de largura média.', 'Estenda totalmente os braços acima do peito.', 'Flexione os cotovelos, descendo a barra em direção à testa.', 'Mantenha a parte de cima dos braços parada.', 'Estenda os braços até a posição inicial e repita.']::text[],
  breathing = 'Inspire ao descer a barra e expire ao estender os braços.',
  common_mistakes = array['Abrir os cotovelos para os lados', 'Mover a parte de cima dos braços', 'Descer a barra além da cabeça']::text[],
  instructions = 'Deite-se no banco e segure a barra W com pegada de largura média.
Estenda totalmente os braços acima do peito.
Flexione os cotovelos, descendo a barra em direção à testa.
Mantenha a parte de cima dos braços parada.
Estenda os braços até a posição inicial e repita.',
  content_pt_ready = true
where slug = 'ez-bar-lying-triceps-extension-0061';

update public.exercises set
  description = 'Rosca de bíceps com o peito apoiado em banco inclinado, o que limita o balanço do corpo e mantém a tensão nos braços.',
  steps = array['Ajuste o banco inclinado em cerca de 45 graus e deite-se de bruços com o peito apoiado.', 'Segure um halter em cada mão, com os braços estendidos para baixo e as palmas voltadas para frente.', 'Mantenha a parte de cima dos braços parada e suba os dois halteres em direção aos ombros.', 'Faça uma breve pausa no alto e contraia o bíceps.', 'Desça os halteres devagar até estender totalmente os braços.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao subi-los.',
  common_mistakes = array['Tirar o peito do banco para balançar os pesos', 'Deixar os cotovelos avançarem durante a rosca', 'Encurtar a repetição e não descer totalmente os halteres', 'Dobrar os punhos para trás em vez de mantê-los neutros']::text[],
  instructions = 'Ajuste o banco inclinado em cerca de 45 graus e deite-se de bruços com o peito apoiado.
Segure um halter em cada mão, com os braços estendidos para baixo e as palmas voltadas para frente.
Mantenha a parte de cima dos braços parada e suba os dois halteres em direção aos ombros.
Faça uma breve pausa no alto e contraia o bíceps.
Desça os halteres devagar até estender totalmente os braços.',
  content_pt_ready = true
where slug = 'dumbbell-prone-incline-curl-0374';

update public.exercises set
  description = 'Supino em máquina carregada com discos, que reproduz o movimento do supino livre para trabalhar todo o peito com segurança.',
  steps = array['Deite-se de costas no banco da máquina.', 'Segure as alças com firmeza, com os cotovelos flexionados.', 'Contraia o peito e empurre as alças à frente e para cima.', 'Estenda os braços sem travar os cotovelos.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao empurrar e inspire ao voltar.',
  common_mistakes = array['Deixar os ombros rolarem para frente', 'Tirar a lombar do banco', 'Usar carga excessiva', 'Deixar os punhos dobrarem']::text[],
  instructions = 'Deite-se de costas no banco da máquina.
Segure as alças com firmeza, com os cotovelos flexionados.
Contraia o peito e empurre as alças à frente e para cima.
Estenda os braços sem travar os cotovelos.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'lever-lying-chest-press-0577';

update public.exercises set
  description = 'Supino reto com barra, para trabalhar peito, tríceps e ombros em um movimento de empurrar na horizontal.',
  steps = array['Deite-se no banco reto com os olhos abaixo da barra e apoie os pés com firmeza no chão.', 'Segure a barra um pouco mais aberta que a largura dos ombros e estenda os braços para retirá-la do suporte acima do peito.', 'Desça a barra com controle até o meio do peito, mantendo os punhos alinhados sobre os antebraços.', 'Toque levemente o peito e empurre a barra para cima até estender totalmente os braços.', 'Ao terminar a série, conduza a barra de volta ao suporte.']::text[],
  breathing = 'Inspire ao descer a barra até o peito e expire ao empurrá-la para cima.',
  common_mistakes = array['Deixar a barra ir em direção ao pescoço ou ao estômago', 'Abrir os cotovelos totalmente para os lados', 'Dobrar os punhos para trás sob a barra', 'Tirar o quadril do banco durante o movimento']::text[],
  instructions = 'Deite-se no banco reto com os olhos abaixo da barra e apoie os pés com firmeza no chão.
Segure a barra um pouco mais aberta que a largura dos ombros e estenda os braços para retirá-la do suporte acima do peito.
Desça a barra com controle até o meio do peito, mantendo os punhos alinhados sobre os antebraços.
Toque levemente o peito e empurre a barra para cima até estender totalmente os braços.
Ao terminar a série, conduza a barra de volta ao suporte.',
  content_pt_ready = true
where slug = 'barbell-bench-press-0025';

update public.exercises set
  description = 'Elevação com barra e tronco inclinado, voltada à porção posterior do deltoide, abrindo os braços para os lados.',
  steps = array['Fique em pé segurando a barra com pegada por cima, na largura dos ombros.', 'Flexione levemente os joelhos e incline o tronco a partir do quadril até ficar quase paralelo ao chão.', 'Deixe a barra pendida abaixo do peito, com os braços estendidos e o pescoço neutro.', 'Eleve a barra para os lados e para cima, levando a parte de cima dos braços até a altura dos ombros.', 'Faça uma breve pausa no alto, mantendo o tronco parado.', 'Desça a barra com controle até a posição inicial.']::text[],
  breathing = 'Inspire ao descer a barra e ajustar a inclinação, e expire ao elevá-la para os lados.',
  common_mistakes = array['Arredondar a lombar ao inclinar o tronco', 'Balançar o tronco para jogar a barra para cima', 'Encolher os ombros em direção às orelhas', 'Flexionar demais os cotovelos e transformar o movimento em remada']::text[],
  instructions = 'Fique em pé segurando a barra com pegada por cima, na largura dos ombros.
Flexione levemente os joelhos e incline o tronco a partir do quadril até ficar quase paralelo ao chão.
Deixe a barra pendida abaixo do peito, com os braços estendidos e o pescoço neutro.
Eleve a barra para os lados e para cima, levando a parte de cima dos braços até a altura dos ombros.
Faça uma breve pausa no alto, mantendo o tronco parado.
Desça a barra com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-rear-delt-raise-0075';

update public.exercises set
  description = 'Alongamento sentado que abre o quadril e a virilha, juntando os pés e deixando os joelhos caírem para os lados.',
  steps = array['Sente-se ereto com os pés unidos e os joelhos flexionados para os lados.', 'Segure os pés com as mãos.', 'Mantenha a coluna alongada e os ombros relaxados.', 'Pressione suavemente os joelhos em direção ao chão.', 'Mantenha a posição, respirando fundo.']::text[],
  breathing = 'Respire de forma uniforme durante todo o alongamento.',
  common_mistakes = array['Arredondar as costas', 'Quicar os joelhos', 'Forçar os joelhos para baixo']::text[],
  instructions = 'Sente-se ereto com os pés unidos e os joelhos flexionados para os lados.
Segure os pés com as mãos.
Mantenha a coluna alongada e os ombros relaxados.
Pressione suavemente os joelhos em direção ao chão.
Mantenha a posição, respirando fundo.',
  content_pt_ready = true
where slug = 'butterfly-yoga-pose-1494';

update public.exercises set
  description = 'A ponte é uma postura de yoga que eleva o quadril para ativar os glúteos e abrir o peito e os flexores do quadril.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.', 'Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.', 'Empurre com os calcanhares para tirar o quadril do chão, formando uma linha reta dos joelhos aos ombros.', 'Contraia os glúteos e mantenha a posição no alto por alguns segundos.', 'Desça o quadril com movimento controlado.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire ao descer.',
  common_mistakes = array['Deixar os joelhos abrirem para fora', 'Arquear demais a lombar', 'Não contrair os glúteos']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.
Deixe os braços ao lado do corpo, com as palmas voltadas para baixo.
Empurre com os calcanhares para tirar o quadril do chão, formando uma linha reta dos joelhos aos ombros.
Contraia os glúteos e mantenha a posição no alto por alguns segundos.
Desça o quadril com movimento controlado.',
  content_pt_ready = true
where slug = 'bridge-pose-setu-bandhasana-glutes';

update public.exercises set
  description = 'Rotação de core com barra em landmine, levando a barra de um lado para o outro com quadril, ombros e oblíquos.',
  steps = array['Fique de frente para a extremidade livre da barra, com os pés mais ou menos na largura dos ombros, e segure a ponta com as duas mãos à frente do peito.', 'Flexione levemente os joelhos, firme o abdômen e mantenha os braços estendidos, sem travar os cotovelos.', 'Gire ombros e quadril juntos para descer a barra em direção a um dos quadris.', 'Empurre com os pés e gire cruzando o corpo, levando a barra em arco para o lado oposto.', 'Controle a barra na mudança de direção e continue girando de um lado para o outro, com o peito voltado para ela.', 'Mantenha o movimento fluido e equilibrado nos dois lados até o fim da série.']::text[],
  breathing = 'Inspire quando a barra vai para um lado e expire ao girá-la para o outro.',
  common_mistakes = array['Girar apenas os braços, com o tronco parado', 'Deixar a lombar arquear durante o movimento da barra', 'Travar os joelhos e manter os pés rígidos no chão', 'Dar trancos na barra em vez de controlar o arco']::text[],
  instructions = 'Fique de frente para a extremidade livre da barra, com os pés mais ou menos na largura dos ombros, e segure a ponta com as duas mãos à frente do peito.
Flexione levemente os joelhos, firme o abdômen e mantenha os braços estendidos, sem travar os cotovelos.
Gire ombros e quadril juntos para descer a barra em direção a um dos quadris.
Empurre com os pés e gire cruzando o corpo, levando a barra em arco para o lado oposto.
Controle a barra na mudança de direção e continue girando de um lado para o outro, com o peito voltado para ela.
Mantenha o movimento fluido e equilibrado nos dois lados até o fim da série.',
  content_pt_ready = true
where slug = 'landmine-180-0562';

update public.exercises set
  description = 'Rosca sentado em banco inclinado com pegada neutra, que trabalha bíceps e antebraços limitando o balanço do corpo.',
  steps = array['Ajuste o banco inclinado e sente-se recostado com um halter em cada mão.', 'Deixe os braços estendidos ao lado do corpo, com as palmas voltadas uma para a outra.', 'Mantenha a parte de cima dos braços parada e suba os dois halteres em direção aos ombros.', 'Pare quando os antebraços ficarem quase na vertical e contraia o bíceps.', 'Desça os halteres devagar até estender totalmente os cotovelos.', 'Repita sem balançar o tronco nem deixar os ombros rolarem para frente.']::text[],
  breathing = 'Expire ao subir os halteres e inspire ao descê-los.',
  common_mistakes = array['Balançar os halteres para cima com o tronco', 'Deixar os cotovelos avançarem durante a rosca', 'Girar as palmas para cima no alto', 'Encurtar a fase de descida']::text[],
  instructions = 'Ajuste o banco inclinado e sente-se recostado com um halter em cada mão.
Deixe os braços estendidos ao lado do corpo, com as palmas voltadas uma para a outra.
Mantenha a parte de cima dos braços parada e suba os dois halteres em direção aos ombros.
Pare quando os antebraços ficarem quase na vertical e contraia o bíceps.
Desça os halteres devagar até estender totalmente os cotovelos.
Repita sem balançar o tronco nem deixar os ombros rolarem para frente.',
  content_pt_ready = true
where slug = 'dumbbell-incline-hammer-curl-0320';

update public.exercises set
  description = 'Exercício sentado em máquina em que você empurra as pernas para fora contra as almofadas, trabalhando os abdutores do quadril e a parte externa dos glúteos.',
  steps = array['Ajuste o assento para que os joelhos fiquem flexionados a cerca de 90 graus e as almofadas encostem na parte externa das pernas.', 'Sente-se ereto com as costas no encosto, apoie os pés nos suportes e segure as alças.', 'Comece com as pernas juntas e os joelhos alinhados com o eixo da máquina.', 'Empurre os joelhos para fora contra as almofadas, até onde sua amplitude confortável permitir.', 'Faça uma breve pausa mantendo o quadril apoiado no assento.', 'Volte a juntar as pernas devagar até as almofadas quase se tocarem e repita.']::text[],
  breathing = 'Expire ao empurrar os joelhos para fora e inspire ao voltar à posição inicial.',
  common_mistakes = array['Inclinar o tronco à frente ou balançar para trás para mover a carga.', 'Deixar as pernas se juntarem de golpe na volta.', 'Tirar o quadril do assento no ponto mais aberto.', 'Girar demais os pés para facilitar o movimento.']::text[],
  instructions = 'Ajuste o assento para que os joelhos fiquem flexionados a cerca de 90 graus e as almofadas encostem na parte externa das pernas.
Sente-se ereto com as costas no encosto, apoie os pés nos suportes e segure as alças.
Comece com as pernas juntas e os joelhos alinhados com o eixo da máquina.
Empurre os joelhos para fora contra as almofadas, até onde sua amplitude confortável permitir.
Faça uma breve pausa mantendo o quadril apoiado no assento.
Volte a juntar as pernas devagar até as almofadas quase se tocarem e repita.',
  content_pt_ready = true
where slug = 'lever-seated-hip-abduction-0597';

update public.exercises set
  description = 'Variação de rosca com barra em que a barra fica próxima ao tronco e os cotovelos vão para trás durante a subida.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril e segure a barra junto às coxas com pegada por baixo.', 'Leve os ombros levemente para trás e mantenha os cotovelos atrás da linha do tronco.', 'Suba a barra deslizando-a perto da frente do corpo, enquanto os cotovelos vão para trás.', 'Suba até a barra chegar à parte alta do abdômen ou à parte baixa do peito, sem deixá-la se afastar.', 'Desça a barra devagar pelo mesmo caminho até estender os braços novamente.']::text[],
  breathing = 'Inspire embaixo, expire ao arrastar a barra para cima e inspire ao descê-la.',
  common_mistakes = array['Deixar a barra balançar à frente, longe do corpo', 'Dobrar os punhos para trás durante a subida', 'Balançar o tronco para iniciar a rosca', 'Abrir os cotovelos para os lados']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril e segure a barra junto às coxas com pegada por baixo.
Leve os ombros levemente para trás e mantenha os cotovelos atrás da linha do tronco.
Suba a barra deslizando-a perto da frente do corpo, enquanto os cotovelos vão para trás.
Suba até a barra chegar à parte alta do abdômen ou à parte baixa do peito, sem deixá-la se afastar.
Desça a barra devagar pelo mesmo caminho até estender os braços novamente.',
  content_pt_ready = true
where slug = 'barbell-drag-curl-0038';

update public.exercises set
  description = 'Puxada na polia com pegada por baixo (supinada), que enfatiza a parte inferior do dorsal e o bíceps.',
  steps = array['Prenda a barra na polia e sente-se com os joelhos fixos sob a almofada.', 'Segure a barra com pegada supinada, na largura dos ombros.', 'Incline levemente o tronco para trás, com o peito erguido e os braços totalmente estendidos.', 'Puxe a barra até a parte alta do peito, contraindo o dorsal.', 'Volte a barra devagar à posição inicial, com controle.']::text[],
  breathing = 'Expire ao puxar para baixo e inspire ao deixar subir.',
  common_mistakes = array['Usar impulso demais', 'Deixar os ombros arredondarem', 'Inclinar demais o tronco para trás']::text[],
  instructions = 'Prenda a barra na polia e sente-se com os joelhos fixos sob a almofada.
Segure a barra com pegada supinada, na largura dos ombros.
Incline levemente o tronco para trás, com o peito erguido e os braços totalmente estendidos.
Puxe a barra até a parte alta do peito, contraindo o dorsal.
Volte a barra devagar à posição inicial, com controle.',
  content_pt_ready = true
where slug = 'reverse-grip-cable-lat-pulldown-0207';

update public.exercises set
  description = 'Agachamento em máquina de trenó inclinado com as costas apoiadas, para trabalhar quadríceps, glúteos e pernas em amplitude controlada.',
  steps = array['Fique na plataforma do aparelho com as costas no encosto e os ombros sob as almofadas.', 'Apoie os pés mais ou menos na largura dos ombros, com as pontas levemente voltadas para fora, e segure as alças.', 'Destrave o aparelho e desça flexionando joelhos e quadril até as coxas ficarem paralelas ou até sua posição mais profunda com controle.', 'Mantenha o pé inteiro apoiado na plataforma, com os joelhos acompanhando a direção das pontas dos pés.', 'Empurre com os calcanhares e o meio do pé para estender joelhos e quadril e subir o aparelho.', 'Pare um pouco antes de travar os joelhos e siga para a próxima repetição.']::text[],
  breathing = 'Inspire ao descer e expire ao empurrar para cima.',
  common_mistakes = array['Apoiar os pés muito abaixo, fazendo os calcanhares saírem da plataforma', 'Deixar os joelhos caírem para dentro na descida', 'Arredondar a lombar ou tirar o quadril do encosto', 'Quicar para sair de baixo em vez de fazer uma breve pausa']::text[],
  instructions = 'Fique na plataforma do aparelho com as costas no encosto e os ombros sob as almofadas.
Apoie os pés mais ou menos na largura dos ombros, com as pontas levemente voltadas para fora, e segure as alças.
Destrave o aparelho e desça flexionando joelhos e quadril até as coxas ficarem paralelas ou até sua posição mais profunda com controle.
Mantenha o pé inteiro apoiado na plataforma, com os joelhos acompanhando a direção das pontas dos pés.
Empurre com os calcanhares e o meio do pé para estender joelhos e quadril e subir o aparelho.
Pare um pouco antes de travar os joelhos e siga para a próxima repetição.',
  content_pt_ready = true
where slug = 'sled-hack-squat-0743';

update public.exercises set
  description = 'Exercício de isolamento do ombro em máquina, elevando os braços para os lados para trabalhar a porção lateral do deltoide.',
  steps = array['Ajuste o assento para que os braços da máquina fiquem alinhados com seus ombros ao sentar.', 'Sente-se com as costas no encosto e apoie os antebraços ou as mãos nas almofadas ou alças.', 'Comece com os braços ao lado do corpo e os cotovelos levemente flexionados.', 'Eleve os braços da máquina para os lados até a parte de cima dos braços chegar à altura dos ombros.', 'Faça uma breve pausa no alto, sem encolher os ombros.', 'Desça os braços com controle até a posição inicial.']::text[],
  breathing = 'Expire ao elevar os braços para os lados e inspire ao descê-los.',
  common_mistakes = array['Encolher os ombros em direção às orelhas', 'Balançar ou quicar a carga embaixo', 'Elevar os braços muito acima da altura dos ombros', 'Tirar as costas do encosto']::text[],
  instructions = 'Ajuste o assento para que os braços da máquina fiquem alinhados com seus ombros ao sentar.
Sente-se com as costas no encosto e apoie os antebraços ou as mãos nas almofadas ou alças.
Comece com os braços ao lado do corpo e os cotovelos levemente flexionados.
Eleve os braços da máquina para os lados até a parte de cima dos braços chegar à altura dos ombros.
Faça uma breve pausa no alto, sem encolher os ombros.
Desça os braços com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'lever-lateral-raise-0584';

update public.exercises set
  description = 'Variação de leg press feita com a barra do Smith, deitado de costas ou em posição inclinada.',
  steps = array['Ajuste as travas de segurança e coloque a carga adequada.', 'Deite-se sob a barra do Smith e apoie os pés nela, mais afastados que a largura dos ombros.', 'Retire a barra do suporte girando os pés para cima.', 'Desça a barra devagar em direção ao tronco até as pernas formarem mais ou menos 90 graus.', 'Empurre a barra para cima estendendo joelhos e quadril.']::text[],
  breathing = 'Inspire ao descer a barra e expire ao empurrá-la para cima.',
  common_mistakes = array['Posicionar os pés de forma incorreta', 'Empurrar apenas com as pontas dos pés', 'Movimento com amplitude curta', 'Deixar os joelhos caírem para dentro']::text[],
  instructions = 'Ajuste as travas de segurança e coloque a carga adequada.
Deite-se sob a barra do Smith e apoie os pés nela, mais afastados que a largura dos ombros.
Retire a barra do suporte girando os pés para cima.
Desça a barra devagar em direção ao tronco até as pernas formarem mais ou menos 90 graus.
Empurre a barra para cima estendendo joelhos e quadril.',
  content_pt_ready = true
where slug = 'smith-machine-leg-press-0748';

update public.exercises set
  description = 'Extensão de tríceps sentado com halter acima da cabeça, descendo o peso atrás da cabeça e estendendo os cotovelos para subi-lo.',
  steps = array['Sente-se ereto no banco, com os dois pés inteiros no chão.', 'Segure um halter pela extremidade de cima com as duas mãos e leve-o acima da cabeça.', 'Mantenha a parte de cima dos braços próxima à cabeça e firme o tronco.', 'Flexione os cotovelos para descer o halter atrás da cabeça com controle.', 'Pare quando os antebraços passarem abaixo da linha paralela, mantendo os cotovelos apontados para cima.', 'Estenda os cotovelos para levar o halter de volta acima da cabeça.']::text[],
  breathing = 'Inspire ao descer o halter atrás da cabeça e expire ao estender os cotovelos para subi-lo.',
  common_mistakes = array['Abrir bastante os cotovelos para os lados.', 'Arquear a lombar quando o peso vai acima da cabeça.', 'Deixar a parte de cima dos braços ir para trás e à frente durante a repetição.', 'Descer demais o halter atrás da cabeça, sem controle.']::text[],
  instructions = 'Sente-se ereto no banco, com os dois pés inteiros no chão.
Segure um halter pela extremidade de cima com as duas mãos e leve-o acima da cabeça.
Mantenha a parte de cima dos braços próxima à cabeça e firme o tronco.
Flexione os cotovelos para descer o halter atrás da cabeça com controle.
Pare quando os antebraços passarem abaixo da linha paralela, mantendo os cotovelos apontados para cima.
Estenda os cotovelos para levar o halter de volta acima da cabeça.',
  content_pt_ready = true
where slug = 'dumbbell-seated-triceps-extension-2188';

update public.exercises set
  description = 'Exercício sentado em máquina que trabalha a parte interna das coxas, aproximando as pernas contra a resistência.',
  steps = array['Ajuste o assento e as almofadas para que os joelhos fiquem alinhados com o eixo de giro da máquina.', 'Sente-se ereto com as costas no encosto, posicione as pernas por fora das almofadas e segure as alças.', 'Apoie os pés nos suportes e comece com as pernas confortavelmente afastadas.', 'Aproxime as pernas pressionando as almofadas para dentro.', 'Contraia brevemente a parte interna das coxas quando as almofadas se juntarem.', 'Abra as almofadas devagar até a posição inicial, sem deixar a carga bater.']::text[],
  breathing = 'Expire ao aproximar as pernas e inspire ao voltar à posição inicial.',
  common_mistakes = array['Inclinar o tronco à frente ou tirar a lombar do encosto.', 'Deixar as almofadas abrirem de golpe na volta.', 'Fazer repetições curtas e com impulso em vez de movimento controlado.', 'Girar demais os pés e os joelhos para forçar o movimento.']::text[],
  instructions = 'Ajuste o assento e as almofadas para que os joelhos fiquem alinhados com o eixo de giro da máquina.
Sente-se ereto com as costas no encosto, posicione as pernas por fora das almofadas e segure as alças.
Apoie os pés nos suportes e comece com as pernas confortavelmente afastadas.
Aproxime as pernas pressionando as almofadas para dentro.
Contraia brevemente a parte interna das coxas quando as almofadas se juntarem.
Abra as almofadas devagar até a posição inicial, sem deixar a carga bater.',
  content_pt_ready = true
where slug = 'lever-seated-hip-adduction-0598';

update public.exercises set
  description = 'Supino inclinado com barra, para trabalhar a parte alta do peito, os ombros e o tríceps.',
  steps = array['Ajuste o banco inclinado e deite-se com os olhos abaixo da barra e os pés inteiros no chão.', 'Segure a barra um pouco mais aberta que a largura dos ombros, com os punhos retos, e leve as escápulas para baixo e para trás.', 'Retire a barra do suporte e mantenha-a acima da parte alta do peito, com os braços estendidos.', 'Desça a barra com controle até a parte alta do peito, mantendo os cotovelos levemente fechados.', 'Empurre a barra para cima até estender os braços novamente, mantendo a trajetória sobre os ombros.', 'Depois da última repetição, encaixe a barra nos suportes com controle.']::text[],
  breathing = 'Inspire ao descer a barra até o peito e expire ao empurrá-la para cima.',
  common_mistakes = array['Abrir os cotovelos totalmente para os lados', 'Quicar a barra no peito', 'Tirar os pés do chão ou se deslocar no banco', 'Descer a barra em direção ao pescoço ou ao estômago']::text[],
  instructions = 'Ajuste o banco inclinado e deite-se com os olhos abaixo da barra e os pés inteiros no chão.
Segure a barra um pouco mais aberta que a largura dos ombros, com os punhos retos, e leve as escápulas para baixo e para trás.
Retire a barra do suporte e mantenha-a acima da parte alta do peito, com os braços estendidos.
Desça a barra com controle até a parte alta do peito, mantendo os cotovelos levemente fechados.
Empurre a barra para cima até estender os braços novamente, mantendo a trajetória sobre os ombros.
Depois da última repetição, encaixe a barra nos suportes com controle.',
  content_pt_ready = true
where slug = 'barbell-incline-bench-press-0047';

update public.exercises set
  description = 'Exercício de isolamento que eleva o braço à frente usando a polia, voltado à porção anterior do deltoide.',
  steps = array['Prenda a alça na polia baixa e fique de costas para a máquina.', 'Segure a alça com uma das mãos, com o braço ao lado do corpo.', 'Com o braço estendido, eleve-o à frente até a altura do ombro.', 'Faça uma breve pausa no alto.', 'Desça devagar até o início e repita.']::text[],
  breathing = 'Expire ao elevar e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Encolher o ombro', 'Passar demais do ponto no alto']::text[],
  instructions = 'Prenda a alça na polia baixa e fique de costas para a máquina.
Segure a alça com uma das mãos, com o braço ao lado do corpo.
Com o braço estendido, eleve-o à frente até a altura do ombro.
Faça uma breve pausa no alto.
Desça devagar até o início e repita.',
  content_pt_ready = true
where slug = 'cable-one-arm-front-raise-0162';

update public.exercises set
  description = 'Supino declinado com barra em banco inclinado para baixo, para trabalhar peito, tríceps e ombros.',
  steps = array['Deite-se no banco declinado e prenda as pernas sob as almofadas, com os olhos abaixo da barra.', 'Segure a barra um pouco mais aberta que a largura dos ombros e encaixe as escápulas no banco.', 'Retire a barra do suporte e mantenha-a acima da parte baixa do peito, com os punhos retos e os cotovelos estendidos.', 'Desça a barra com controle até a parte baixa do peito ou a parte alta do esterno, mantendo os cotovelos a cerca de 45 graus.', 'Empurre a barra para cima até estender os cotovelos, retornando acima da parte baixa do peito.', 'Repita mantendo a mesma trajetória e um ritmo controlado.']::text[],
  breathing = 'Inspire ao descer a barra até o peito e expire ao empurrá-la para cima.',
  common_mistakes = array['Quicar a barra no peito', 'Abrir os cotovelos totalmente para os lados', 'Deixar os punhos dobrarem para trás sob a barra', 'Empurrar a barra em direção ao rosto em vez de sobre o peito']::text[],
  instructions = 'Deite-se no banco declinado e prenda as pernas sob as almofadas, com os olhos abaixo da barra.
Segure a barra um pouco mais aberta que a largura dos ombros e encaixe as escápulas no banco.
Retire a barra do suporte e mantenha-a acima da parte baixa do peito, com os punhos retos e os cotovelos estendidos.
Desça a barra com controle até a parte baixa do peito ou a parte alta do esterno, mantendo os cotovelos a cerca de 45 graus.
Empurre a barra para cima até estender os cotovelos, retornando acima da parte baixa do peito.
Repita mantendo a mesma trajetória e um ritmo controlado.',
  content_pt_ready = true
where slug = 'barbell-decline-bench-press-0033';

update public.exercises set
  description = 'Remada em máquina que desenvolve o meio das costas e o dorsal por meio de uma puxada horizontal.',
  steps = array['Deite-se de bruços sobre o apoio de peito da máquina de remada T e segure as alças.', 'Firme a parte de cima do corpo e aproxime as escápulas.', 'Puxe as alças em direção ao peito ou às costelas mais baixas.', 'Faça uma pausa no alto e contraia as costas.', 'Desça a carga com controle até o alongamento completo.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Arquear a lombar', 'Não estender totalmente os braços', 'Quicar a carga', 'Deixar os ombros arredondarem para frente']::text[],
  instructions = 'Deite-se de bruços sobre o apoio de peito da máquina de remada T e segure as alças.
Firme a parte de cima do corpo e aproxime as escápulas.
Puxe as alças em direção ao peito ou às costelas mais baixas.
Faça uma pausa no alto e contraia as costas.
Desça a carga com controle até o alongamento completo.',
  content_pt_ready = true
where slug = 'lever-t-bar-row-drv-lever-t-bar-row';

update public.exercises set
  description = 'Crucifixo inverso em máquina, puxando as alças para os lados e para trás sentado com o peito apoiado.',
  steps = array['Ajuste o assento para que as alças fiquem mais ou menos na altura dos ombros ao sentar.', 'Sente-se com o peito no apoio, os pés inteiros no chão, e segure as alças com pegada por cima.', 'Comece com os braços à frente do corpo e os cotovelos levemente flexionados.', 'Puxe as alças para os lados e para trás em um arco amplo, até a parte de cima dos braços alinhar com os ombros.', 'Contraia a parte de trás dos ombros e as costas altas no fim do movimento.', 'Volte as alças devagar ao início, sem deixar a carga bater.']::text[],
  breathing = 'Expire ao puxar as alças para trás e inspire ao voltar à posição inicial.',
  common_mistakes = array['Encolher os ombros em direção às orelhas', 'Estender os cotovelos e transformar o movimento em empurrada', 'Tirar o peito do apoio', 'Puxar as alças para trás com impulso']::text[],
  instructions = 'Ajuste o assento para que as alças fiquem mais ou menos na altura dos ombros ao sentar.
Sente-se com o peito no apoio, os pés inteiros no chão, e segure as alças com pegada por cima.
Comece com os braços à frente do corpo e os cotovelos levemente flexionados.
Puxe as alças para os lados e para trás em um arco amplo, até a parte de cima dos braços alinhar com os ombros.
Contraia a parte de trás dos ombros e as costas altas no fim do movimento.
Volte as alças devagar ao início, sem deixar a carga bater.',
  content_pt_ready = true
where slug = 'lever-seated-reverse-fly-0602';

update public.exercises set
  description = 'Alongamento ajoelhado voltado aos flexores do quadril, com rotação do tronco cruzando o corpo.',
  steps = array['Comece em posição de avanço ajoelhado, com um joelho no chão e o pé oposto à frente.', 'Encaixe a pelve para baixo e leve o peso à frente, sentindo alongar o flexor do quadril da perna de trás.', 'Gire o tronco cruzando o corpo, para o lado oposto ao da perna de trás.', 'Mantenha de 20 a 30 segundos, respirando de forma constante.', 'Solte e repita do outro lado.']::text[],
  breathing = 'Inspire para se preparar e expire ao girar e aprofundar o alongamento.',
  common_mistakes = array['Arquear as costas', 'Deixar o joelho da frente cair para dentro', 'Inclinar demais o tronco à frente']::text[],
  instructions = 'Comece em posição de avanço ajoelhado, com um joelho no chão e o pé oposto à frente.
Encaixe a pelve para baixo e leve o peso à frente, sentindo alongar o flexor do quadril da perna de trás.
Gire o tronco cruzando o corpo, para o lado oposto ao da perna de trás.
Mantenha de 20 a 30 segundos, respirando de forma constante.
Solte e repita do outro lado.',
  content_pt_ready = true
where slug = 'crossover-kneeling-hip-flexor-stretch-drv-stretching-crossover-kneeling-hip-flexor-stretch';

update public.exercises set
  description = 'Extensão de tríceps em pé na polia feita com um braço por vez, estendendo o cotovelo com a parte de cima do braço fixa.',
  steps = array['Fique de lado para a máquina e segure a alça com uma das mãos.', 'Afaste-se até o cabo ficar tensionado e eleve o braço até ficar mais ou menos paralelo ao chão.', 'Flexione o cotovelo levando a alça em direção à lateral da cabeça, mantendo a parte de cima do braço parada.', 'Estenda o cotovelo empurrando a alça para longe, até o braço ficar reto.', 'Faça uma breve pausa com o tríceps contraído e volte com controle.', 'Faça todas as repetições de um lado e depois troque de braço.']::text[],
  breathing = 'Inspire ao flexionar o cotovelo e aproximar a alça; expire ao estender o braço.',
  common_mistakes = array['Deixar o cotovelo subir e descer durante a repetição', 'Girar o tronco para ajudar a mover a alça', 'Abaixar o braço em vez de mantê-lo nivelado', 'Usar impulso e deixar o cabo voltar de golpe']::text[],
  instructions = 'Fique de lado para a máquina e segure a alça com uma das mãos.
Afaste-se até o cabo ficar tensionado e eleve o braço até ficar mais ou menos paralelo ao chão.
Flexione o cotovelo levando a alça em direção à lateral da cabeça, mantendo a parte de cima do braço parada.
Estenda o cotovelo empurrando a alça para longe, até o braço ficar reto.
Faça uma breve pausa com o tríceps contraído e volte com controle.
Faça todas as repetições de um lado e depois troque de braço.',
  content_pt_ready = true
where slug = 'cable-standing-one-arm-triceps-extension-0231';

update public.exercises set
  description = 'Rosca de bíceps com um braço apoiado na bola suíça, o que limita o uso de impulso e isola os flexores do cotovelo.',
  steps = array['Sente-se ereto na bola suíça, com os dois pés inteiros no chão e afastados para dar equilíbrio.', 'Segure um halter em uma das mãos com a palma voltada para cima e apoie a parte de trás do braço na bola.', 'Deixe o braço quase totalmente estendido, com o halter pendido abaixo do cotovelo.', 'Suba o halter em direção ao ombro sem tirar o cotovelo da bola.', 'Contraia o bíceps no alto, mantendo o punho reto.', 'Desça o halter devagar até o braço ficar quase reto, repita e depois troque de lado.']::text[],
  breathing = 'Inspire ao descer o halter e expire ao subi-lo.',
  common_mistakes = array['Deixar o cotovelo escorregar ou sair da bola durante a rosca.', 'Rolar o ombro para frente para ajudar a subir o halter.', 'Dobrar o punho para trás ou para dentro no alto.', 'Balançar o corpo na bola para gerar impulso.']::text[],
  instructions = 'Sente-se ereto na bola suíça, com os dois pés inteiros no chão e afastados para dar equilíbrio.
Segure um halter em uma das mãos com a palma voltada para cima e apoie a parte de trás do braço na bola.
Deixe o braço quase totalmente estendido, com o halter pendido abaixo do cotovelo.
Suba o halter em direção ao ombro sem tirar o cotovelo da bola.
Contraia o bíceps no alto, mantendo o punho reto.
Desça o halter devagar até o braço ficar quase reto, repita e depois troque de lado.',
  content_pt_ready = true
where slug = 'dumbbell-preacher-curl-over-exercise-ball-1673';

update public.exercises set
  description = 'Exercício de isolamento do antebraço feito sentado, flexionando os punhos com pegada neutra.',
  steps = array['Sente-se no banco com os pés inteiros no chão e um halter em cada mão, com as palmas voltadas uma para a outra.', 'Apoie os antebraços nas coxas, perto dos joelhos, deixando os punhos passarem um pouco além deles.', 'Comece com os punhos retos e as mãos pendidas, com controle.', 'Suba os halteres flexionando apenas os punhos, mantendo os antebraços apoiados nas coxas.', 'Contraia brevemente no alto, sem girar as palmas para cima ou para baixo.', 'Desça os halteres devagar até o início, estendendo totalmente os punhos.']::text[],
  breathing = 'Expire ao flexionar os punhos para cima e inspire ao descer os halteres.',
  common_mistakes = array['Tirar os antebraços das coxas para balançar os halteres', 'Girar as palmas para cima ou para baixo durante o movimento', 'Quicar os halteres embaixo', 'Usar os ombros ou os cotovelos para ajudar']::text[],
  instructions = 'Sente-se no banco com os pés inteiros no chão e um halter em cada mão, com as palmas voltadas uma para a outra.
Apoie os antebraços nas coxas, perto dos joelhos, deixando os punhos passarem um pouco além deles.
Comece com os punhos retos e as mãos pendidas, com controle.
Suba os halteres flexionando apenas os punhos, mantendo os antebraços apoiados nas coxas.
Contraia brevemente no alto, sem girar as palmas para cima ou para baixo.
Desça os halteres devagar até o início, estendendo totalmente os punhos.',
  content_pt_ready = true
where slug = 'dumbbell-seated-neutral-wrist-curl-0397';

update public.exercises set
  description = 'Rosca de bíceps com barra e peito apoiado em banco inclinado, que isola a flexão do cotovelo com pouco balanço do corpo.',
  steps = array['Ajuste o banco inclinado e deite-se de bruços com o peito apoiado e os pés no chão.', 'Segure a barra com pegada por baixo, mais ou menos na largura dos ombros, e deixe os braços estendidos para baixo.', 'Firme o tronco contra o banco e mantenha a parte de cima dos braços parada.', 'Suba a barra flexionando os cotovelos até ela chegar perto da frente dos ombros.', 'Contraia o bíceps brevemente no alto, sem tirar o peito do banco.', 'Desça a barra com controle até estender totalmente os cotovelos.']::text[],
  breathing = 'Inspire embaixo, expire ao subir a barra e inspire novamente ao descê-la.',
  common_mistakes = array['Tirar o peito do banco para ajudar a subir a barra', 'Deixar os cotovelos avançarem durante a rosca', 'Balançar o corpo ou chutar com as pernas para gerar impulso', 'Deixar a barra cair rápido em vez de descer com controle']::text[],
  instructions = 'Ajuste o banco inclinado e deite-se de bruços com o peito apoiado e os pés no chão.
Segure a barra com pegada por baixo, mais ou menos na largura dos ombros, e deixe os braços estendidos para baixo.
Firme o tronco contra o banco e mantenha a parte de cima dos braços parada.
Suba a barra flexionando os cotovelos até ela chegar perto da frente dos ombros.
Contraia o bíceps brevemente no alto, sem tirar o peito do banco.
Desça a barra com controle até estender totalmente os cotovelos.',
  content_pt_ready = true
where slug = 'barbell-prone-incline-curl-0072';

update public.exercises set
  description = 'Rosca de bíceps em pé na polia com um braço por vez e pegada por baixo, que trabalha a flexão do cotovelo sob tensão constante.',
  steps = array['Coloque a alça na posição mais baixa e fique de frente para a máquina.', 'Segure a alça com uma das mãos em pegada por baixo e deixe o braço estendido ao lado do corpo.', 'Dê um passo para trás até o cabo ficar tensionado e fique ereto, com os pés mais ou menos na largura do quadril.', 'Mantenha o cotovelo junto ao corpo e suba a alça em direção ao ombro.', 'Contraia o bíceps no alto sem deixar a parte de cima do braço avançar.', 'Desça a alça devagar até estender o braço, repita e depois troque de lado.']::text[],
  breathing = 'Expire ao subir a alça e inspire ao descê-la.',
  common_mistakes = array['Deixar o cotovelo avançar durante a rosca', 'Balançar o tronco para trás para mover a carga', 'Dobrar demais o punho em vez de mantê-lo neutro', 'Deixar a alça cair rápido na descida']::text[],
  instructions = 'Coloque a alça na posição mais baixa e fique de frente para a máquina.
Segure a alça com uma das mãos em pegada por baixo e deixe o braço estendido ao lado do corpo.
Dê um passo para trás até o cabo ficar tensionado e fique ereto, com os pés mais ou menos na largura do quadril.
Mantenha o cotovelo junto ao corpo e suba a alça em direção ao ombro.
Contraia o bíceps no alto sem deixar a parte de cima do braço avançar.
Desça a alça devagar até estender o braço, repita e depois troque de lado.',
  content_pt_ready = true
where slug = 'cable-standing-inner-curl-0229';

update public.exercises set
  description = 'Cadeira extensora: exercício sentado em máquina que fortalece o quadríceps estendendo os joelhos contra a alavanca almofadada.',
  steps = array['Ajuste o assento e o encosto para que os joelhos fiquem alinhados com o eixo de giro da máquina.', 'Sente-se recostado no encosto e posicione as canelas atrás do rolo inferior.', 'Segure as alças e comece com os joelhos flexionados e as pontas dos pés voltadas para frente.', 'Estenda os joelhos para levantar o rolo até as pernas ficarem quase retas.', 'Faça uma breve pausa mantendo as coxas apoiadas no assento.', 'Desça o rolo com controle até flexionar os joelhos novamente.']::text[],
  breathing = 'Expire ao estender os joelhos e inspire ao descer o rolo.',
  common_mistakes = array['Deixar os joelhos muito à frente ou muito atrás do eixo da máquina.', 'Balançar a carga para cima com impulso.', 'Travar os joelhos com força no alto.', 'Tirar o quadril ou a lombar do assento.']::text[],
  instructions = 'Ajuste o assento e o encosto para que os joelhos fiquem alinhados com o eixo de giro da máquina.
Sente-se recostado no encosto e posicione as canelas atrás do rolo inferior.
Segure as alças e comece com os joelhos flexionados e as pontas dos pés voltadas para frente.
Estenda os joelhos para levantar o rolo até as pernas ficarem quase retas.
Faça uma breve pausa mantendo as coxas apoiadas no assento.
Desça o rolo com controle até flexionar os joelhos novamente.',
  content_pt_ready = true
where slug = 'lever-leg-extension-0585';

update public.exercises set
  description = 'Supino inclinado em máquina, que enfatiza a parte alta do peito e os ombros.',
  steps = array['Ajuste a altura do assento para deixar as alças na melhor posição.', 'Sente-se e segure as alças com os cotovelos flexionados.', 'Empurre as alças para cima e à frente, acima do peito.', 'Evite travar totalmente os cotovelos.', 'Desça as alças devagar até a posição inicial.']::text[],
  breathing = 'Expire ao empurrar e inspire ao descer.',
  common_mistakes = array['Abrir demais os cotovelos', 'Travar os cotovelos no fim', 'Arquear as costas e sair do assento', 'Segurar as alças de forma desigual']::text[],
  instructions = 'Ajuste a altura do assento para deixar as alças na melhor posição.
Sente-se e segure as alças com os cotovelos flexionados.
Empurre as alças para cima e à frente, acima do peito.
Evite travar totalmente os cotovelos.
Desça as alças devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'lever-incline-hammer-chest-press-1299';

update public.exercises set
  description = 'Movimento ritmado dos braços para aumentar a mobilidade do peito e aquecer o peitoral.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Abra os dois braços para os lados, na altura dos ombros.', 'Leve os braços à frente, cruzando-os na frente do peito.', 'Abra bem os braços novamente, alongando o peito.', 'Repita o balanço pelo número de repetições desejado.']::text[],
  breathing = 'Respire naturalmente durante todo o movimento.',
  common_mistakes = array['Balançar os braços com força demais', 'Deixar os ombros encolherem', 'Girar demais o tronco']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Abra os dois braços para os lados, na altura dos ombros.
Leve os braços à frente, cruzando-os na frente do peito.
Abra bem os braços novamente, alongando o peito.
Repita o balanço pelo número de repetições desejado.',
  content_pt_ready = true
where slug = 'dynamic-chest-stretch-1167';

update public.exercises set
  description = 'Elevação de panturrilha no leg press 45°, empurrando com a parte da frente dos pés para subir e descer os calcanhares.',
  steps = array['Sente-se no leg press 45° e apoie a parte da frente dos dois pés na borda inferior da plataforma, deixando os calcanhares para fora.', 'Estenda as pernas o suficiente para sustentar o aparelho, mantendo os joelhos levemente flexionados.', 'Deixe os calcanhares descerem pelo movimento dos tornozelos até sentir alongar a panturrilha.', 'Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.', 'Faça uma breve pausa no alto, mantendo as pernas estáveis.', 'Desça os calcanhares com controle até a posição de alongamento e repita.']::text[],
  breathing = 'Inspire ao descer os calcanhares e expire ao empurrar com a parte da frente dos pés para subi-los.',
  common_mistakes = array['Flexionar e estender os joelhos em vez de mover apenas os tornozelos', 'Apoiar o pé inteiro na plataforma, impedindo a descida dos calcanhares', 'Quicar para sair de baixo em vez de descer com controle', 'Girar demais as pontas dos pés para dentro ou para fora durante a repetição']::text[],
  instructions = 'Sente-se no leg press 45° e apoie a parte da frente dos dois pés na borda inferior da plataforma, deixando os calcanhares para fora.
Estenda as pernas o suficiente para sustentar o aparelho, mantendo os joelhos levemente flexionados.
Deixe os calcanhares descerem pelo movimento dos tornozelos até sentir alongar a panturrilha.
Empurre com a parte da frente dos pés e eleve os calcanhares o mais alto que conseguir.
Faça uma breve pausa no alto, mantendo as pernas estáveis.
Desça os calcanhares com controle até a posição de alongamento e repita.',
  content_pt_ready = true
where slug = 'sled-45-degree-calf-press-0738';

update public.exercises set
  description = 'Rosca direta em pé com barra, levando-a das coxas até a altura dos ombros com pegada por baixo.',
  steps = array['Fique em pé com os pés na largura do quadril e segure a barra junto às coxas com pegada por baixo.', 'Leve os ombros para trás, firme o tronco e mantenha os cotovelos junto ao corpo.', 'Suba a barra flexionando os cotovelos até ela chegar mais ou menos à altura dos ombros.', 'Faça uma breve pausa no alto e contraia o bíceps, sem deixar os cotovelos avançarem.', 'Desça a barra devagar até as coxas, estendendo os braços.']::text[],
  breathing = 'Expire ao subir a barra e inspire ao descê-la com controle.',
  common_mistakes = array['Balançar o tronco para iniciar o movimento da barra', 'Deixar os cotovelos avançarem durante a subida', 'Dobrar os punhos para trás em vez de mantê-los neutros', 'Deixar a barra cair rápido na descida']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril e segure a barra junto às coxas com pegada por baixo.
Leve os ombros para trás, firme o tronco e mantenha os cotovelos junto ao corpo.
Suba a barra flexionando os cotovelos até ela chegar mais ou menos à altura dos ombros.
Faça uma breve pausa no alto e contraia o bíceps, sem deixar os cotovelos avançarem.
Desça a barra devagar até as coxas, estendendo os braços.',
  content_pt_ready = true
where slug = 'barbell-curl-0031';

update public.exercises set
  description = 'Crucifixo na polia deitado em banco reto, que mantém tensão contínua no peito.',
  steps = array['Coloque um banco reto entre duas polias e prenda as alças.', 'Deite-se e segure uma alça em cada mão, com os braços estendidos.', 'Com os cotovelos levemente flexionados, una as alças acima do peito.', 'Contraia o peito no alto.', 'Volte devagar à posição inicial, com controle.']::text[],
  breathing = 'Expire ao unir as mãos e inspire ao voltar.',
  common_mistakes = array['Travar os cotovelos', 'Deixar os cabos voltarem de golpe', 'Usar carga excessiva']::text[],
  instructions = 'Coloque um banco reto entre duas polias e prenda as alças.
Deite-se e segure uma alça em cada mão, com os braços estendidos.
Com os cotovelos levemente flexionados, una as alças acima do peito.
Contraia o peito no alto.
Volte devagar à posição inicial, com controle.',
  content_pt_ready = true
where slug = 'flat-bench-cable-fly-0620';

update public.exercises set
  description = 'Alongamento estático suave para liberar a tensão do pescoço, levando o queixo em direção ao peito.',
  steps = array['Sente-se ou fique em pé com as costas retas.', 'Leve suavemente o queixo em direção ao peito.', 'Relaxe os ombros e sinta o alongamento ao longo do pescoço.', 'Mantenha a posição de 15 a 30 segundos.', 'Volte devagar à posição neutra.']::text[],
  breathing = 'Respire de forma profunda e uniforme durante todo o alongamento.',
  common_mistakes = array['Quicar durante o alongamento', 'Tensionar os ombros', 'Alongar o pescoço além do confortável']::text[],
  instructions = 'Sente-se ou fique em pé com as costas retas.
Leve suavemente o queixo em direção ao peito.
Relaxe os ombros e sinta o alongamento ao longo do pescoço.
Mantenha a posição de 15 a 30 segundos.
Volte devagar à posição neutra.',
  content_pt_ready = true
where slug = 'chin-to-chest-stretch-drv-stretching-chin-to-chest-stretch';

update public.exercises set
  description = 'Rosca de bíceps na polia feita com um braço por vez, mantendo o cotovelo junto ao corpo.',
  steps = array['Fique ao lado da máquina e segure a alça com uma das mãos, com a palma voltada para cima.', 'Afaste-se até o cabo ficar tensionado e fique ereto, com o cotovelo encostado na lateral do corpo.', 'Suba a alça flexionando o cotovelo, sem deixar a parte de cima do braço avançar.', 'Suba até o antebraço ficar próximo ao bíceps e contraia o braço brevemente.', 'Desça a alça devagar até estender o braço, mantendo a tensão no cabo.', 'Faça todas as repetições com um braço e depois troque de lado.']::text[],
  breathing = 'Expire ao subir a alça e inspire ao descê-la.',
  common_mistakes = array['Deixar o cotovelo avançar durante a rosca', 'Encolher o ombro em direção à orelha', 'Inclinar o tronco para trás para mover a carga', 'Deixar a alça cair rápido na descida']::text[],
  instructions = 'Fique ao lado da máquina e segure a alça com uma das mãos, com a palma voltada para cima.
Afaste-se até o cabo ficar tensionado e fique ereto, com o cotovelo encostado na lateral do corpo.
Suba a alça flexionando o cotovelo, sem deixar a parte de cima do braço avançar.
Suba até o antebraço ficar próximo ao bíceps e contraia o braço brevemente.
Desça a alça devagar até estender o braço, mantendo a tensão no cabo.
Faça todas as repetições com um braço e depois troque de lado.',
  content_pt_ready = true
where slug = 'cable-one-arm-curl-0190';

update public.exercises set
  description = 'Exercício de mobilidade com movimentos circulares do tornozelo, voltado à panturrilha e à flexibilidade do tornozelo.',
  steps = array['Sente-se ou fique em pé e tire um dos pés do chão.', 'Estique a ponta do pé e gire o tornozelo devagar em círculos.', 'Faça vários círculos no sentido horário e depois inverta para o sentido anti-horário.', 'Repita com o outro tornozelo.', 'Mantenha a respiração constante e o movimento controlado.']::text[],
  breathing = 'Respire normalmente durante todo o alongamento.',
  common_mistakes = array['Fazer os movimentos com pressa', 'Fazer círculos muito pequenos', 'Não trocar o sentido do giro']::text[],
  instructions = 'Sente-se ou fique em pé e tire um dos pés do chão.
Estique a ponta do pé e gire o tornozelo devagar em círculos.
Faça vários círculos no sentido horário e depois inverta para o sentido anti-horário.
Repita com o outro tornozelo.
Mantenha a respiração constante e o movimento controlado.',
  content_pt_ready = true
where slug = 'feet-and-ankles-rotation-stretch-drv-stretching-feet-and-ankles-rotation-stretch';

update public.exercises set
  description = 'Rosca de bíceps sentado com um braço apoiado no banco Scott, para isolar os flexores do cotovelo e limitar o impulso do corpo.',
  steps = array['Sente-se no banco Scott e apoie os pés inteiros no chão.', 'Segure um halter com a palma voltada para cima e apoie bem a parte de trás do braço no encosto.', 'Comece com o braço quase estendido, deixando o halter suspenso pouco acima da base do apoio.', 'Suba o halter flexionando o cotovelo, mantendo o braço pressionado contra o apoio.', 'Suba até o halter chegar perto do ombro e contraia o bíceps brevemente.', 'Desça o halter devagar até o braço ficar quase estendido, repita e depois troque de lado.']::text[],
  breathing = 'Expire ao subir o halter e inspire ao descê-lo com controle.',
  common_mistakes = array['Tirar o braço do apoio durante a rosca', 'Balançar o halter em vez de mover de forma suave', 'Parar antes do fim e não descer quase até a extensão completa', 'Dobrar o punho para trás durante a subida']::text[],
  instructions = 'Sente-se no banco Scott e apoie os pés inteiros no chão.
Segure um halter com a palma voltada para cima e apoie bem a parte de trás do braço no encosto.
Comece com o braço quase estendido, deixando o halter suspenso pouco acima da base do apoio.
Suba o halter flexionando o cotovelo, mantendo o braço pressionado contra o apoio.
Suba até o halter chegar perto do ombro e contraia o bíceps brevemente.
Desça o halter devagar até o braço ficar quase estendido, repita e depois troque de lado.',
  content_pt_ready = true
where slug = 'dumbbell-seated-preacher-curl-0402';

update public.exercises set
  description = 'Exercício de isolamento na polia voltado ao tríceps, estendendo o braço para baixo contra a resistência.',
  steps = array['Fique de frente para a torre de pesos, com o acessório na posição alta.', 'Segure a barra ou a corda com as duas mãos.', 'Mantenha os cotovelos junto ao corpo.', 'Empurre o acessório para baixo até estender totalmente os braços.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao empurrar para baixo e inspire ao voltar.',
  common_mistakes = array['Usar carga excessiva', 'Deixar os cotovelos abrirem para os lados', 'Inclinar o corpo sobre a barra']::text[],
  instructions = 'Fique de frente para a torre de pesos, com o acessório na posição alta.
Segure a barra ou a corda com as duas mãos.
Mantenha os cotovelos junto ao corpo.
Empurre o acessório para baixo até estender totalmente os braços.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'cable-triceps-pushdown-1723';

update public.exercises set
  description = 'Rosca de bíceps em pé, subindo os pesos da lateral do corpo até os ombros com as palmas voltadas para frente.',
  steps = array['Fique em pé com um peso em cada mão ao lado do corpo e as palmas voltadas para frente.', 'Deixe os pés mais ou menos na largura do quadril e mantenha os cotovelos junto às costelas.', 'Suba os pesos flexionando os cotovelos até as mãos chegarem à altura dos ombros.', 'Faça uma breve pausa no alto sem deixar os cotovelos avançarem.', 'Desça os pesos com controle até estender totalmente os braços ao lado do corpo.']::text[],
  breathing = 'Expire ao subir os pesos e inspire ao descê-los com controle.',
  common_mistakes = array['Balançar o tronco para subir os pesos', 'Deixar os cotovelos avançarem no alto', 'Deixar os pesos caírem rápido na descida', 'Dobrar os punhos para trás em vez de mantê-los neutros']::text[],
  instructions = 'Fique em pé com um peso em cada mão ao lado do corpo e as palmas voltadas para frente.
Deixe os pés mais ou menos na largura do quadril e mantenha os cotovelos junto às costelas.
Suba os pesos flexionando os cotovelos até as mãos chegarem à altura dos ombros.
Faça uma breve pausa no alto sem deixar os cotovelos avançarem.
Desça os pesos com controle até estender totalmente os braços ao lado do corpo.',
  content_pt_ready = true
where slug = 'weighted-standing-curl-0853';

update public.exercises set
  description = 'Exercícios aeróbicos em aparelhos como esteira, bicicleta, elíptico ou remo, que melhoram o condicionamento cardiovascular e a resistência.',
  steps = array['Escolha um aparelho aeróbico adequado ao seu nível de condicionamento.', 'Ajuste resistência, velocidade e inclinação conforme preferir.', 'Comece o movimento, mantendo um ritmo constante e boa postura.', 'Continue pelo tempo planejado, acompanhando a intensidade.', 'Desacelere gradualmente e saia do aparelho com segurança.']::text[],
  breathing = 'Respire de forma constante durante todo o treino.',
  common_mistakes = array['Postura inadequada', 'Subir ou descer do aparelho com pressa', 'Forçar a intensidade cedo demais']::text[],
  instructions = 'Escolha um aparelho aeróbico adequado ao seu nível de condicionamento.
Ajuste resistência, velocidade e inclinação conforme preferir.
Comece o movimento, mantendo um ritmo constante e boa postura.
Continue pelo tempo planejado, acompanhando a intensidade.
Desacelere gradualmente e saia do aparelho com segurança.',
  content_pt_ready = true
where slug = 'cardio-machine-workouts-drv-cardio-exercises-machines';

update public.exercises set
  description = 'Qualquer atividade aeróbica contínua em aparelho, para elevar a frequência cardíaca e a resistência.',
  steps = array['Escolha o aparelho aeróbico de sua preferência (esteira, bicicleta, entre outros).', 'Ajuste resistência, inclinação e demais configurações conforme preferir.', 'Comece com um aquecimento breve.', 'Faça o exercício em intensidade constante ou variada.', 'Desacelere ao final da sessão.']::text[],
  breathing = 'Respire de forma ritmada conforme a intensidade: expire no esforço e inspire na recuperação.',
  common_mistakes = array['Curvar as costas ou manter postura inadequada', 'Usar resistência ou velocidade excessivas', 'Pular o aquecimento ou a volta à calma']::text[],
  instructions = 'Escolha o aparelho aeróbico de sua preferência (esteira, bicicleta, entre outros).
Ajuste resistência, inclinação e demais configurações conforme preferir.
Comece com um aquecimento breve.
Faça o exercício em intensidade constante ou variada.
Desacelere ao final da sessão.',
  content_pt_ready = true
where slug = 'cardio-machine-exercise-drv-cardio-exercises-machine';

update public.exercises set
  description = 'Alongamento para aumentar a flexibilidade e a mobilidade dos pés e dos músculos do tornozelo.',
  steps = array['Sente-se ou fique em pé com as pernas estendidas ou em posição confortável.', 'Aponte as pontas dos pés para baixo para alongar o topo dos pés e a frente dos tornozelos.', 'Puxe as pontas dos pés para cima, em direção às canelas, para alongar a panturrilha e a parte de trás dos tornozelos.', 'Mantenha cada posição de 15 a 30 segundos.', 'Repita a sequência por várias vezes.']::text[],
  breathing = 'Respire normalmente durante todo o exercício, ou expire ao relaxar em cada alongamento.',
  common_mistakes = array['Quicar durante o alongamento', 'Alongar demais ou forçar a amplitude', 'Prender a respiração']::text[],
  instructions = 'Sente-se ou fique em pé com as pernas estendidas ou em posição confortável.
Aponte as pontas dos pés para baixo para alongar o topo dos pés e a frente dos tornozelos.
Puxe as pontas dos pés para cima, em direção às canelas, para alongar a panturrilha e a parte de trás dos tornozelos.
Mantenha cada posição de 15 a 30 segundos.
Repita a sequência por várias vezes.',
  content_pt_ready = true
where slug = 'feet-and-ankles-stretch-drv-stretching-feet-and-ankles-stretch';

update public.exercises set
  description = 'Alongamento que combina flexão do tronco com movimento das pernas para trabalhar abdômen e flexores do quadril.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés inteiros no chão.', 'Cruze os braços sobre o peito ou estenda-os em direção aos joelhos.', 'Contraia o abdômen para subir o tronco, enrolando a coluna.', 'Alcance os joelhos no alto para intensificar o movimento.', 'Desça com controle até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Dar trancos no movimento', 'Usar impulso em vez da força muscular', 'Tensionar o pescoço']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés inteiros no chão.
Cruze os braços sobre o peito ou estenda-os em direção aos joelhos.
Contraia o abdômen para subir o tronco, enrolando a coluna.
Alcance os joelhos no alto para intensificar o movimento.
Desça com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'flexion-leg-sit-up-stretch-drv-stretching-flexion-leg-sit-up';

update public.exercises set
  description = 'Mergulho em máquina feito sentado, voltado a tríceps, peito e ombros.',
  steps = array['Ajuste o assento e selecione a carga adequada.', 'Sente-se e segure as alças com firmeza.', 'Empurre as alças para baixo estendendo totalmente os braços.', 'Faça uma breve pausa no fim da extensão.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao empurrar para baixo e inspire ao voltar.',
  common_mistakes = array['Deixar os cotovelos abrirem para os lados', 'Usar carga excessiva', 'Balançar ou dar trancos no movimento']::text[],
  instructions = 'Ajuste o assento e selecione a carga adequada.
Sente-se e segure as alças com firmeza.
Empurre as alças para baixo estendendo totalmente os braços.
Faça uma breve pausa no fim da extensão.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'lever-seated-dip-1451';

update public.exercises set
  description = 'Alongamento clássico em que você inclina o tronco à frente para alcançar os pés, alongando posteriores da coxa e lombar.',
  steps = array['Fique em pé (ou sentado) com as pernas estendidas.', 'Incline o tronco devagar à frente a partir do quadril, mantendo as costas retas.', 'Alcance ou toque as pontas dos pés com as mãos.', 'Mantenha os joelhos estendidos, sem travar.', 'Sustente o alongamento e volte à posição inicial.']::text[],
  breathing = 'Expire ao inclinar à frente e inspire ao voltar à posição ereta.',
  common_mistakes = array['Arredondar demais as costas', 'Quicar ou forçar o alongamento', 'Travar os joelhos']::text[],
  instructions = 'Fique em pé (ou sentado) com as pernas estendidas.
Incline o tronco devagar à frente a partir do quadril, mantendo as costas retas.
Alcance ou toque as pontas dos pés com as mãos.
Mantenha os joelhos estendidos, sem travar.
Sustente o alongamento e volte à posição inicial.',
  content_pt_ready = true
where slug = 'front-toe-touch-stretch-drv-stretching-front-toe-touch';

update public.exercises set
  description = 'Extensão e alongamento suave das costas apoiando o corpo sobre a bola suíça, para mobilizar a coluna.',
  steps = array['Sente-se na bola com os pés na largura do quadril.', 'Caminhe devagar com os pés à frente, rolando o corpo até as costas ficarem apoiadas sobre a bola.', 'Estenda os braços acima da cabeça ou deixe-os ao lado do corpo para dar apoio.', 'Relaxe no alongamento, deixando a coluna se estender suavemente.', 'Mantenha pelo tempo desejado e volte com cuidado à posição sentada.']::text[],
  breathing = 'Respire de forma profunda e constante durante todo o alongamento.',
  common_mistakes = array['Arquear demais as costas', 'Deixar o quadril afundar muito', 'Perder o equilíbrio sobre a bola']::text[],
  instructions = 'Sente-se na bola com os pés na largura do quadril.
Caminhe devagar com os pés à frente, rolando o corpo até as costas ficarem apoiadas sobre a bola.
Estenda os braços acima da cabeça ou deixe-os ao lado do corpo para dar apoio.
Relaxe no alongamento, deixando a coluna se estender suavemente.
Mantenha pelo tempo desejado e volte com cuidado à posição sentada.',
  content_pt_ready = true
where slug = 'exercise-ball-spinal-stretch-1339';

update public.exercises set
  description = 'Corrida em esteira, uma forma comum de exercício aeróbico em ambiente fechado, com intensidades variadas.',
  steps = array['Suba na esteira e posicione os pés nas laterais.', 'Escolha a velocidade e a inclinação desejadas.', 'Comece a correr, segurando nas barras laterais se precisar de equilíbrio.', 'Concentre-se em passadas suaves e postura ereta.', 'Desacelere reduzindo a velocidade gradualmente antes de parar.']::text[],
  breathing = 'Inspire pelo nariz e expire pela boca, no ritmo das passadas.',
  common_mistakes = array['Segurar nas barras por tempo demais', 'Curvar as costas', 'Dar passadas longas demais', 'Ficar olhando para baixo']::text[],
  instructions = 'Suba na esteira e posicione os pés nas laterais.
Escolha a velocidade e a inclinação desejadas.
Comece a correr, segurando nas barras laterais se precisar de equilíbrio.
Concentre-se em passadas suaves e postura ereta.
Desacelere reduzindo a velocidade gradualmente antes de parar.',
  content_pt_ready = true
where slug = 'treadmill-running-drv-treadmill-running';

update public.exercises set
  description = 'Alongamento que trabalha flexores do quadril e quadríceps a partir de uma posição ajoelhada ou de avanço.',
  steps = array['Comece meio ajoelhado, com um joelho no chão e o outro pé à frente.', 'Mantenha o tronco ereto, com as mãos no quadril ou no joelho da frente.', 'Leve o quadril um pouco à frente para intensificar o alongamento.', 'Sinta o alongamento no flexor do quadril e na coxa da perna de trás.', 'Mantenha pelo tempo desejado e troque de perna.']::text[],
  breathing = 'Respire de forma profunda e constante durante todo o alongamento.',
  common_mistakes = array['Inclinar o tronco à frente', 'Arquear a lombar', 'Deixar o joelho da frente passar da ponta do pé']::text[],
  instructions = 'Comece meio ajoelhado, com um joelho no chão e o outro pé à frente.
Mantenha o tronco ereto, com as mãos no quadril ou no joelho da frente.
Leve o quadril um pouco à frente para intensificar o alongamento.
Sinta o alongamento no flexor do quadril e na coxa da perna de trás.
Mantenha pelo tempo desejado e troque de perna.',
  content_pt_ready = true
where slug = 'hip-flexor-and-quadriceps-stretch-1564';

update public.exercises set
  description = 'Alongamento com rotação deitado, que melhora a mobilidade da coluna e alonga oblíquos e lombar.',
  steps = array['Deite-se de costas com os braços abertos para os lados.', 'Eleve uma perna estendida em direção ao teto.', 'Leve a perna elevada cruzando o corpo, para o lado oposto.', 'Deixe o pé tocar o chão ou se aproximar dele.', 'Sustente o alongamento e troque de perna.']::text[],
  breathing = 'Expire ao entrar na rotação e inspire ao voltar ao centro.',
  common_mistakes = array['Tirar os ombros do chão', 'Girar rápido demais', 'Prender a respiração', 'Deixar o quadril subir']::text[],
  instructions = 'Deite-se de costas com os braços abertos para os lados.
Eleve uma perna estendida em direção ao teto.
Leve a perna elevada cruzando o corpo, para o lado oposto.
Deixe o pé tocar o chão ou se aproximar dele.
Sustente o alongamento e troque de perna.',
  content_pt_ready = true
where slug = 'iron-cross-stretch-1419';

update public.exercises set
  description = 'Extensão de tríceps sentado em máquina de alavanca, flexionando e estendendo os cotovelos.',
  steps = array['Ajuste o assento para que as alças fiquem mais ou menos na altura dos olhos ou da testa ao sentar.', 'Sente-se com as costas no encosto e os pés inteiros no chão.', 'Segure as alças com as palmas voltadas para baixo e estenda os braços à frente.', 'Mantenha a parte de cima dos braços parada e flexione os cotovelos, descendo as alças em direção à testa.', 'Faça uma breve pausa com os cotovelos totalmente flexionados e as alças próximas à cabeça.', 'Empurre as alças para longe estendendo os cotovelos até os braços ficarem retos novamente.']::text[],
  breathing = 'Inspire ao flexionar os cotovelos e descer as alças, e expire ao estender os braços para empurrá-las.',
  common_mistakes = array['Abrir bastante os cotovelos para os lados.', 'Rolar os ombros para frente e afundar o peito.', 'Deixar as alças caírem rápido em direção à cabeça.', 'Balançar a parte de cima dos braços durante a repetição.']::text[],
  instructions = 'Ajuste o assento para que as alças fiquem mais ou menos na altura dos olhos ou da testa ao sentar.
Sente-se com as costas no encosto e os pés inteiros no chão.
Segure as alças com as palmas voltadas para baixo e estenda os braços à frente.
Mantenha a parte de cima dos braços parada e flexione os cotovelos, descendo as alças em direção à testa.
Faça uma breve pausa com os cotovelos totalmente flexionados e as alças próximas à cabeça.
Empurre as alças para longe estendendo os cotovelos até os braços ficarem retos novamente.',
  content_pt_ready = true
where slug = 'lever-triceps-extension-0607';

update public.exercises set
  description = 'Alongamento dinâmico para aumentar a mobilidade do quadril com movimentos circulares da perna.',
  steps = array['Fique em pé com os pés na largura dos ombros e as mãos no quadril.', 'Eleve um joelho à frente do corpo.', 'Faça um círculo com o joelho e a coxa, abrindo para fora.', 'Ao fim da série, inverta o sentido e faça círculos para dentro.', 'Troque de perna e repita.']::text[],
  breathing = 'Inspire e expire naturalmente durante o alongamento.',
  common_mistakes = array['Fazer os círculos com pressa', 'Balançar o corpo todo', 'Prender a respiração']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros e as mãos no quadril.
Eleve um joelho à frente do corpo.
Faça um círculo com o joelho e a coxa, abrindo para fora.
Ao fim da série, inverta o sentido e faça círculos para dentro.
Troque de perna e repita.',
  content_pt_ready = true
where slug = 'hip-circles-stretch-0257';

update public.exercises set
  description = 'Remada com halteres e peito apoiado em banco inclinado, voltada às costas altas e limitando o impulso do corpo.',
  steps = array['Ajuste o banco inclinado em um ângulo moderado e deite-se de bruços com o peito apoiado e os pés no chão.', 'Segure um halter em cada mão, com os braços estendidos para baixo e as palmas voltadas uma para a outra.', 'Firme o abdômen e leve os ombros para baixo e para trás.', 'Puxe os halteres em direção às costelas mais baixas, flexionando os cotovelos e levando-os para trás.', 'Contraia as costas altas no alto, sem tirar o peito do banco.', 'Desça os halteres com controle até estender totalmente os braços.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao puxá-los em direção às costelas.',
  common_mistakes = array['Encolher os ombros em direção às orelhas', 'Dar trancos nos halteres usando o impulso do corpo', 'Abrir os cotovelos totalmente para os lados', 'Tirar o peito do banco no alto']::text[],
  instructions = 'Ajuste o banco inclinado em um ângulo moderado e deite-se de bruços com o peito apoiado e os pés no chão.
Segure um halter em cada mão, com os braços estendidos para baixo e as palmas voltadas uma para a outra.
Firme o abdômen e leve os ombros para baixo e para trás.
Puxe os halteres em direção às costelas mais baixas, flexionando os cotovelos e levando-os para trás.
Contraia as costas altas no alto, sem tirar o peito do banco.
Desça os halteres com controle até estender totalmente os braços.',
  content_pt_ready = true
where slug = 'dumbbell-incline-row-0327';

update public.exercises set
  description = 'Exercício aeróbico feito sentado, pedalando em uma bicicleta ergométrica para elevar a frequência cardíaca e a resistência.',
  steps = array['Ajuste o selim e o guidão em alturas adequadas.', 'Sente-se ereto e segure o guidão de forma leve.', 'Apoie os pés com firmeza nos pedais.', 'Comece a pedalar com resistência e ritmo confortáveis.', 'Continue pelo tempo planejado, mantendo a boa postura.']::text[],
  breathing = 'Respire de forma uniforme e profunda durante toda a sessão.',
  common_mistakes = array['Curvar o tronco à frente', 'Quicar no selim', 'Pedalar apenas com as pontas dos pés', 'Deixar o selim muito baixo ou muito alto']::text[],
  instructions = 'Ajuste o selim e o guidão em alturas adequadas.
Sente-se ereto e segure o guidão de forma leve.
Apoie os pés com firmeza nos pedais.
Comece a pedalar com resistência e ritmo confortáveis.
Continue pelo tempo planejado, mantendo a boa postura.',
  content_pt_ready = true
where slug = 'stationary-bike-2138';

update public.exercises set
  description = 'Alongamento com foco na extensão do quadril, voltado a flexores do quadril e à região anterior do quadril encurtados.',
  steps = array['Deite-se de bruços com as pernas estendidas.', 'Apoie as mãos abaixo dos ombros, com os cotovelos flexionados.', 'Pressione as palmas no chão, elevando o peito e estendendo suavemente o quadril.', 'Sustente o alongamento em uma tensão confortável.', 'Desça devagar.']::text[],
  breathing = 'Inspire ao se preparar e expire ao subir para o alongamento.',
  common_mistakes = array['Arquear demais a lombar', 'Forçar o alongamento', 'Prender a respiração']::text[],
  instructions = 'Deite-se de bruços com as pernas estendidas.
Apoie as mãos abaixo dos ombros, com os cotovelos flexionados.
Pressione as palmas no chão, elevando o peito e estendendo suavemente o quadril.
Sustente o alongamento em uma tensão confortável.
Desça devagar.',
  content_pt_ready = true
where slug = 'hip-extension-stretch-drv-stretching-hip-extension-stretch';

update public.exercises set
  description = 'Remada alta em pé com halteres, voltada aos ombros e à parte superior do trapézio, conduzindo o movimento pelos cotovelos.',
  steps = array['Fique em pé com um halter em cada mão à frente das coxas e as palmas voltadas para o corpo.', 'Firme o abdômen e mantenha o peito erguido.', 'Puxe os halteres para cima, junto à frente do corpo, levando os cotovelos para cima e para fora.', 'Suba até os halteres chegarem mais ou menos à altura da parte alta do peito, com os cotovelos acima das mãos.', 'Faça uma breve pausa e desça os halteres até as coxas com controle.']::text[],
  breathing = 'Expire ao puxar os halteres para cima e inspire ao descê-los.',
  common_mistakes = array['Puxar os halteres até o queixo', 'Dobrar bastante os punhos no alto', 'Balançar o tronco para iniciar a subida', 'Deixar as mãos subirem mais que os cotovelos']::text[],
  instructions = 'Fique em pé com um halter em cada mão à frente das coxas e as palmas voltadas para o corpo.
Firme o abdômen e mantenha o peito erguido.
Puxe os halteres para cima, junto à frente do corpo, levando os cotovelos para cima e para fora.
Suba até os halteres chegarem mais ou menos à altura da parte alta do peito, com os cotovelos acima das mãos.
Faça uma breve pausa e desça os halteres até as coxas com controle.',
  content_pt_ready = true
where slug = 'dumbbell-upright-row-0437';

update public.exercises set
  description = 'Remada com halteres e peito apoiado, voltada à porção posterior do deltoide e às costas altas, abrindo bem os cotovelos.',
  steps = array['Deite-se de bruços em um banco reto com um halter em cada mão, o peito apoiado e os braços estendidos para baixo.', 'Apoie os pés com firmeza no chão e deixe as palmas voltadas uma para a outra.', 'Abra os cotovelos para os lados e puxe os halteres em direção à parte alta do peito.', 'Contraia as costas altas no alto, mantendo o peito no banco.', 'Desça os halteres com controle até estender os braços novamente.', 'Repita sem balançar os pesos nem encolher os ombros.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao puxá-los em direção à parte alta do peito.',
  common_mistakes = array['Puxar os cotovelos junto às costelas, como em uma remada comum', 'Encolher os ombros em direção às orelhas', 'Tirar o peito do banco para mover os pesos', 'Balançar os halteres em vez de descer com controle']::text[],
  instructions = 'Deite-se de bruços em um banco reto com um halter em cada mão, o peito apoiado e os braços estendidos para baixo.
Apoie os pés com firmeza no chão e deixe as palmas voltadas uma para a outra.
Abra os cotovelos para os lados e puxe os halteres em direção à parte alta do peito.
Contraia as costas altas no alto, mantendo o peito no banco.
Desça os halteres com controle até estender os braços novamente.
Repita sem balançar os pesos nem encolher os ombros.',
  content_pt_ready = true
where slug = 'dumbbell-lying-rear-delt-row-1328';

update public.exercises set
  description = 'Alongamento de mobilidade ajoelhado que melhora a rotação da coluna torácica e abre o peito e os ombros.',
  steps = array['Ajoelhe-se no chão, em quatro apoios ou em posição de avanço.', 'Coloque uma das mãos atrás da cabeça ou do pescoço.', 'Gire o cotovelo e a parte de cima do corpo para cima, abrindo o peito.', 'Mantenha por um instante no ponto máximo da rotação.', 'Volte ao início e repita; depois troque de lado.']::text[],
  breathing = 'Expire ao girar e inspire ao voltar ao início.',
  common_mistakes = array['Girar a partir da lombar', 'Forçar o alongamento', 'Deixar o quadril se mover']::text[],
  instructions = 'Ajoelhe-se no chão, em quatro apoios ou em posição de avanço.
Coloque uma das mãos atrás da cabeça ou do pescoço.
Gire o cotovelo e a parte de cima do corpo para cima, abrindo o peito.
Mantenha por um instante no ponto máximo da rotação.
Volte ao início e repita; depois troque de lado.',
  content_pt_ready = true
where slug = 'kneeling-back-rotation-stretch-drv-stretching-kneeling-back-rotation-stretch';

update public.exercises set
  description = 'Alongamento de quadríceps feito de bruços, que permite flexionar bem o joelho.',
  steps = array['Deite-se de bruços com as pernas estendidas.', 'Flexione um joelho, levando o calcanhar em direção ao glúteo.', 'Estenda o braço para trás e segure o tornozelo com a mão.', 'Aproxime suavemente o calcanhar do glúteo até sentir o alongamento.', 'Sustente e depois troque de lado.']::text[],
  breathing = 'Expire ao puxar e inspire ao soltar.',
  common_mistakes = array['Puxar com força demais', 'Deixar a pelve sair do chão', 'Deixar o joelho abrir para o lado']::text[],
  instructions = 'Deite-se de bruços com as pernas estendidas.
Flexione um joelho, levando o calcanhar em direção ao glúteo.
Estenda o braço para trás e segure o tornozelo com a mão.
Aproxime suavemente o calcanhar do glúteo até sentir o alongamento.
Sustente e depois troque de lado.',
  content_pt_ready = true
where slug = 'lying-quadriceps-stretch-drv-stretching-quadriceps-lying-stretch';

update public.exercises set
  description = 'Rosca de bíceps em máquina com os braços apoiados no banco Scott, para isolar a flexão do cotovelo.',
  steps = array['Ajuste o assento para que as axilas fiquem próximas ao topo do apoio.', 'Sente-se e apoie a parte de trás dos braços no encosto.', 'Segure as alças com pegada por baixo e estenda os braços até a posição inicial.', 'Mantenha o peito erguido e suba as alças em direção aos ombros flexionando os cotovelos.', 'Contraia o bíceps brevemente no alto, sem tirar os braços do apoio.', 'Desça as alças com controle até os braços ficarem quase estendidos.']::text[],
  breathing = 'Expire ao subir as alças e inspire ao descê-las com controle.',
  common_mistakes = array['Tirar os braços do apoio durante a subida', 'Usar os ombros ou balançar o tronco para iniciar a rosca', 'Deixar a carga cair rápido na descida', 'Dobrar os punhos para trás em vez de mantê-los retos']::text[],
  instructions = 'Ajuste o assento para que as axilas fiquem próximas ao topo do apoio.
Sente-se e apoie a parte de trás dos braços no encosto.
Segure as alças com pegada por baixo e estenda os braços até a posição inicial.
Mantenha o peito erguido e suba as alças em direção aos ombros flexionando os cotovelos.
Contraia o bíceps brevemente no alto, sem tirar os braços do apoio.
Desça as alças com controle até os braços ficarem quase estendidos.',
  content_pt_ready = true
where slug = 'lever-preacher-curl-0592';

update public.exercises set
  description = 'Aparelho aeróbico de baixo impacto com movimento lateral de deslize, que aciona os músculos dos membros inferiores e melhora a resistência.',
  steps = array['Suba no aparelho e posicione os pés nos pedais.', 'Segure as alças para ter estabilidade.', 'Inicie o movimento empurrando uma perna para fora, enquanto a outra acompanha.', 'Mantenha um movimento lateral ritmado e deslizante.', 'Continue pelo tempo ou intensidade desejados.']::text[],
  breathing = 'Mantenha a respiração constante e controlada durante todo o exercício.',
  common_mistakes = array['Inclinar o tronco à frente', 'Deixar os joelhos caírem para dentro', 'Fazer movimentos com trancos']::text[],
  instructions = 'Suba no aparelho e posicione os pés nos pedais.
Segure as alças para ter estabilidade.
Inicie o movimento empurrando uma perna para fora, enquanto a outra acompanha.
Mantenha um movimento lateral ritmado e deslizante.
Continue pelo tempo ou intensidade desejados.',
  content_pt_ready = true
where slug = 'walk-wave-machine-drv-walk-wave-machine';

update public.exercises set
  description = 'Remada com halteres e tronco inclinado, voltada à porção posterior do deltoide, abrindo os cotovelos para os lados.',
  steps = array['Fique em pé com os pés entre a largura do quadril e a dos ombros, segurando um halter em cada mão ao lado do corpo.', 'Incline o tronco a partir do quadril, flexione levemente os joelhos e deixe os halteres pendidos abaixo dos ombros, com as palmas voltadas uma para a outra.', 'Firme o abdômen e mantenha as costas retas enquanto leva os cotovelos para cima e para os lados.', 'Suba até a parte de cima dos braços ficar mais ou menos alinhada com os ombros e contraia as costas altas.', 'Desça os halteres com controle até a posição inicial e repita.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao puxá-los para cima e para os lados.',
  common_mistakes = array['Arredondar a lombar ao inclinar o tronco.', 'Encolher os ombros em direção às orelhas.', 'Puxar os halteres para trás, junto às costelas.', 'Balançar o tronco para iniciar cada repetição.']::text[],
  instructions = 'Fique em pé com os pés entre a largura do quadril e a dos ombros, segurando um halter em cada mão ao lado do corpo.
Incline o tronco a partir do quadril, flexione levemente os joelhos e deixe os halteres pendidos abaixo dos ombros, com as palmas voltadas uma para a outra.
Firme o abdômen e mantenha as costas retas enquanto leva os cotovelos para cima e para os lados.
Suba até a parte de cima dos braços ficar mais ou menos alinhada com os ombros e contraia as costas altas.
Desça os halteres com controle até a posição inicial e repita.',
  content_pt_ready = true
where slug = 'dumbbell-rear-delt-row-0377';

update public.exercises set
  description = 'Alongamento estático voltado ao tríceps e ao dorsal, flexionando o cotovelo acima da cabeça em posição ajoelhada.',
  steps = array['Ajoelhe-se no chão ou no colchonete.', 'Eleve um braço acima da cabeça e flexione o cotovelo, levando a mão às costas.', 'Use a outra mão para empurrar suavemente o cotovelo flexionado.', 'Sustente o alongamento.', 'Troque de braço e repita.']::text[],
  breathing = 'Respire de forma profunda e constante durante todo o alongamento.',
  common_mistakes = array['Arquear as costas', 'Empurrar com força demais', 'Deixar o cotovelo abrir para o lado']::text[],
  instructions = 'Ajoelhe-se no chão ou no colchonete.
Eleve um braço acima da cabeça e flexione o cotovelo, levando a mão às costas.
Use a outra mão para empurrar suavemente o cotovelo flexionado.
Sustente o alongamento.
Troque de braço e repita.',
  content_pt_ready = true
where slug = 'kneeling-triceps-stretch-1771';

update public.exercises set
  description = 'Alongamento sentado voltado à parte interna das coxas e ao quadril.',
  steps = array['Sente-se no chão com as costas retas.', 'Junte as solas dos pés e deixe os joelhos caírem para os lados.', 'Segure os tornozelos ou os pés para dar apoio.', 'Aproxime suavemente os pés do corpo e incline-se um pouco à frente.', 'Mantenha a posição sem quicar.']::text[],
  breathing = 'Respire de forma profunda e regular enquanto sustenta o alongamento.',
  common_mistakes = array['Forçar os joelhos para baixo', 'Curvar os ombros', 'Quicar durante o alongamento']::text[],
  instructions = 'Sente-se no chão com as costas retas.
Junte as solas dos pés e deixe os joelhos caírem para os lados.
Segure os tornozelos ou os pés para dar apoio.
Aproxime suavemente os pés do corpo e incline-se um pouco à frente.
Mantenha a posição sem quicar.',
  content_pt_ready = true
where slug = 'seated-boat-stretch-drv-stretching-boat-stretch';

update public.exercises set
  description = 'Alongamento estático que abre o peito estendendo os braços acima da cabeça e levando-os para trás.',
  steps = array['Fique em pé com os pés na largura do quadril.', 'Entrelace os dedos e estenda os braços acima da cabeça.', 'Leve suavemente os braços para trás da cabeça.', 'Aproxime as escápulas.', 'Sustente o alongamento de 15 a 30 segundos.']::text[],
  breathing = 'Respire de forma profunda e constante durante todo o alongamento.',
  common_mistakes = array['Arquear demais a lombar', 'Flexionar os cotovelos', 'Deixar os ombros encolherem']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril.
Entrelace os dedos e estenda os braços acima da cabeça.
Leve suavemente os braços para trás da cabeça.
Aproxime as escápulas.
Sustente o alongamento de 15 a 30 segundos.',
  content_pt_ready = true
where slug = 'overhead-chest-stretch-1259';

update public.exercises set
  description = 'Alongamento dinâmico para aquecer e mobilizar quadril, parte interna das coxas e pernas.',
  steps = array['Fique em pé com os pés mais afastados que a largura do quadril.', 'Passe o peso para um lado, flexionando esse joelho e mantendo a outra perna estendida.', 'Desça em um avanço lateral profundo, mantendo a postura ereta.', 'Empurre com a perna flexionada e volte à posição inicial.', 'Repita para o lado oposto, alternando de forma dinâmica.']::text[],
  breathing = 'Inspire ao se preparar e expire ao entrar em cada avanço.',
  common_mistakes = array['Deixar o joelho cair para dentro', 'Tirar o calcanhar do chão', 'Arredondar as costas']::text[],
  instructions = 'Fique em pé com os pés mais afastados que a largura do quadril.
Passe o peso para um lado, flexionando esse joelho e mantendo a outra perna estendida.
Desça em um avanço lateral profundo, mantendo a postura ereta.
Empurre com a perna flexionada e volte à posição inicial.
Repita para o lado oposto, alternando de forma dinâmica.',
  content_pt_ready = true
where slug = 'plyometric-side-lunge-stretch-drv-stretching-plyo-side-lunge-stretch';

update public.exercises set
  description = 'Alongamento no chão para trabalhar o dorsal e melhorar a mobilidade do ombro.',
  steps = array['Ajoelhe-se e sente o quadril sobre os calcanhares.', 'Estenda os dois braços à frente, com as palmas no chão.', 'Aproxime o peito do chão.', 'Sustente o alongamento, sentindo a lateral do corpo se alongar.', 'Se quiser, desloque as mãos para cada lado para intensificar.']::text[],
  breathing = 'Inspire fundo ao estender os braços à frente e expire ao aprofundar o alongamento.',
  common_mistakes = array['Arquear demais a lombar', 'Flexionar demais os cotovelos', 'Tirar o quadril dos calcanhares', 'Tensionar os ombros']::text[],
  instructions = 'Ajoelhe-se e sente o quadril sobre os calcanhares.
Estenda os dois braços à frente, com as palmas no chão.
Aproxime o peito do chão.
Sustente o alongamento, sentindo a lateral do corpo se alongar.
Se quiser, desloque as mãos para cada lado para intensificar.',
  content_pt_ready = true
where slug = 'kneeling-lat-stretch-1346';

update public.exercises set
  description = 'Alongamento voltado a tríceps e ombros, estendendo os braços atrás do corpo e baixando o tronco.',
  steps = array['Sente-se com as pernas estendidas e os braços atrás do quadril.', 'Apoie as mãos no chão, com os dedos apontados para frente.', 'Empurre com as palmas para elevar o peito.', 'Mantenha os braços estendidos sem travar os cotovelos.', 'Sustente o alongamento, depois desça devagar e relaxe.']::text[],
  breathing = 'Respire de forma profunda e constante durante todo o alongamento.',
  common_mistakes = array['Travar os cotovelos com força', 'Deixar os ombros arredondarem para frente', 'Arquear demais a lombar']::text[],
  instructions = 'Sente-se com as pernas estendidas e os braços atrás do quadril.
Apoie as mãos no chão, com os dedos apontados para frente.
Empurre com as palmas para elevar o peito.
Mantenha os braços estendidos sem travar os cotovelos.
Sustente o alongamento, depois desça devagar e relaxe.',
  content_pt_ready = true
where slug = 'reverse-dip-stretch-0672';

update public.exercises set
  description = 'Alongamento profundo de flexor do quadril com o pé de trás elevado, para ganhar flexibilidade.',
  steps = array['Fique de costas para um banco e apoie um dos pés nele.', 'Dê um passo à frente com o outro pé e desça em avanço.', 'Encaixe a pelve para baixo, mantendo o peito erguido.', 'Incline-se suavemente à frente para intensificar o alongamento.', 'Sustente e depois troque de perna.']::text[],
  breathing = 'Inspire para se preparar e expire ao aprofundar o alongamento.',
  common_mistakes = array['Arquear demais a lombar', 'Deixar o joelho passar da ponta do pé', 'Inclinar o tronco à frente']::text[],
  instructions = 'Fique de costas para um banco e apoie um dos pés nele.
Dê um passo à frente com o outro pé e desça em avanço.
Encaixe a pelve para baixo, mantendo o peito erguido.
Incline-se suavemente à frente para intensificar o alongamento.
Sustente e depois troque de perna.',
  content_pt_ready = true
where slug = 'rear-foot-elevated-hip-flexor-stretch-drv-stretching-hip-flexor-stretch-rear-foot-elevated';

update public.exercises set
  description = 'Alongamento estático voltado aos músculos da parte externa da perna.',
  steps = array['Sente-se com uma perna cruzada sobre a outra.', 'Segure o pé e puxe-o suavemente para dentro.', 'Gire a sola em direção à linha média do corpo.', 'Mantenha de 20 a 30 segundos.', 'Troque de lado e repita.']::text[],
  breathing = 'Respire normalmente durante todo o alongamento.',
  common_mistakes = array['Alongar com força demais', 'Não sustentar pelo tempo suficiente', 'Posicionar o pé de forma incorreta']::text[],
  instructions = 'Sente-se com uma perna cruzada sobre a outra.
Segure o pé e puxe-o suavemente para dentro.
Gire a sola em direção à linha média do corpo.
Mantenha de 20 a 30 segundos.
Troque de lado e repita.',
  content_pt_ready = true
where slug = 'peroneals-stretch-1388';

update public.exercises set
  description = 'Alongamento estático suave voltado aos músculos laterais do pescoço, que melhora a mobilidade e reduz a tensão.',
  steps = array['Sente-se ou fique em pé com boa postura.', 'Incline devagar a cabeça para um lado, aproximando a orelha do ombro.', 'Sustente o alongamento de 15 a 30 segundos.', 'Volte ao centro.', 'Repita para o lado oposto.']::text[],
  breathing = 'Respire normalmente durante todo o alongamento.',
  common_mistakes = array['Forçar o alongamento', 'Girar a cabeça em vez de inclinar', 'Fazer movimentos com trancos']::text[],
  instructions = 'Sente-se ou fique em pé com boa postura.
Incline devagar a cabeça para um lado, aproximando a orelha do ombro.
Sustente o alongamento de 15 a 30 segundos.
Volte ao centro.
Repita para o lado oposto.',
  content_pt_ready = true
where slug = 'neck-side-stretch-1403';

update public.exercises set
  description = 'Alongamento voltado a flexores do quadril e posteriores da coxa, dando um passo à frente em avanço profundo.',
  steps = array['Dê um passo à frente em avanço, mantendo a perna de trás estendida.', 'Apoie as duas mãos no chão, uma de cada lado do pé da frente.', 'Desça o quadril suavemente, mantendo a perna de trás estendida.', 'Erga o peito para aprofundar o alongamento.', 'Sustente e depois troque de perna.']::text[],
  breathing = 'Inspire ao entrar na posição e expire ao aprofundar o alongamento.',
  common_mistakes = array['Deixar o joelho passar da ponta do pé', 'Descer demais o quadril', 'Arquear demais as costas']::text[],
  instructions = 'Dê um passo à frente em avanço, mantendo a perna de trás estendida.
Apoie as duas mãos no chão, uma de cada lado do pé da frente.
Desça o quadril suavemente, mantendo a perna de trás estendida.
Erga o peito para aprofundar o alongamento.
Sustente e depois troque de perna.',
  content_pt_ready = true
where slug = 'runner-s-stretch-1585';

update public.exercises set
  description = 'Exercício aeróbico de baixo impacto no elíptico em pé, que trabalha a resistência do corpo todo.',
  steps = array['Suba nos pedais e segure as alças.', 'Escolha a resistência e a inclinação desejadas.', 'Comece a mover os pés em um trajeto elíptico e suave.', 'Empurre e puxe as alças com os braços, em sincronia com as passadas.', 'Mantenha uma cadência constante e a postura ereta.']::text[],
  breathing = 'Mantenha uma respiração ritmada e profunda durante todo o treino.',
  common_mistakes = array['Inclinar demais o tronco à frente ou para trás', 'Usar apenas as pernas ou apenas os braços', 'Fazer movimentos truncados e rápidos demais']::text[],
  instructions = 'Suba nos pedais e segure as alças.
Escolha a resistência e a inclinação desejadas.
Comece a mover os pés em um trajeto elíptico e suave.
Empurre e puxe as alças com os braços, em sincronia com as passadas.
Mantenha uma cadência constante e a postura ereta.',
  content_pt_ready = true
where slug = 'elliptical-trainer-2141';

update public.exercises set
  description = 'Alongamento no chão voltado a flexores do quadril e posteriores da coxa, puxando uma perna flexionada em direção ao peito.',
  steps = array['Deite-se de costas com as duas pernas flexionadas.', 'Segure um dos joelhos com as duas mãos.', 'Puxe o joelho suavemente em direção ao peito.', 'Sustente o alongamento, mantendo as costas apoiadas.', 'Troque de lado e repita.']::text[],
  breathing = 'Expire ao puxar o joelho e inspire ao soltar.',
  common_mistakes = array['Puxar o joelho com força demais', 'Arquear a lombar', 'Prender a respiração']::text[],
  instructions = 'Deite-se de costas com as duas pernas flexionadas.
Segure um dos joelhos com as duas mãos.
Puxe o joelho suavemente em direção ao peito.
Sustente o alongamento, mantendo as costas apoiadas.
Troque de lado e repita.',
  content_pt_ready = true
where slug = 'single-leg-stretch-bent-knee-drv-stretching-single-leg-stretch-bent-knee';

update public.exercises set
  description = 'Alongamento estático sentado, inclinando o tronco à frente para trabalhar a musculatura das costas.',
  steps = array['Sente-se confortavelmente no chão, com as pernas estendidas ou cruzadas.', 'Incline o tronco à frente a partir do quadril, mantendo as costas relaxadas.', 'Estenda os braços à frente, em direção aos pés ou ao chão.', 'Aproxime o peito dos joelhos, respirando fundo.', 'Sustente o alongamento e relaxe na posição.']::text[],
  breathing = 'Inspire antes de inclinar e expire ao levar o tronco à frente.',
  common_mistakes = array['Arredondar demais as costas', 'Forçar o alongamento', 'Prender a respiração']::text[],
  instructions = 'Sente-se confortavelmente no chão, com as pernas estendidas ou cruzadas.
Incline o tronco à frente a partir do quadril, mantendo as costas relaxadas.
Estenda os braços à frente, em direção aos pés ou ao chão.
Aproxime o peito dos joelhos, respirando fundo.
Sustente o alongamento e relaxe na posição.',
  content_pt_ready = true
where slug = 'seated-bent-over-back-stretch-drv-stretching-sitting-bent-over-back-stretch';

update public.exercises set
  description = 'Abdominal em pé com elástico, que trabalha abdômen e oblíquos por meio da flexão da coluna.',
  steps = array['Prenda o elástico em um ponto fixo mais ou menos na altura da cintura e fique de costas para ele.', 'Segure o elástico junto ao peito com as duas mãos e dê um passo à frente até ele ficar tensionado.', 'Deixe os pés mais ou menos na largura do quadril e flexione levemente os joelhos.', 'Firme o abdômen e leve as costelas para baixo, inclinando o tronco à frente.', 'Faça uma breve pausa embaixo, mantendo o quadril praticamente parado.', 'Desenrole o tronco devagar e volte à posição ereta com controle.']::text[],
  breathing = 'Expire ao enrolar o tronco à frente e inspire ao voltar à posição ereta.',
  common_mistakes = array['Puxar o elástico com os braços em vez de enrolar o tronco.', 'Inclinar a partir do quadril, como uma reverência, em vez de enrolar em abdominal.', 'Deixar o elástico puxar o tronco de volta de golpe.', 'Ficar perto demais do ponto fixo, deixando o elástico sem tensão.']::text[],
  instructions = 'Prenda o elástico em um ponto fixo mais ou menos na altura da cintura e fique de costas para ele.
Segure o elástico junto ao peito com as duas mãos e dê um passo à frente até ele ficar tensionado.
Deixe os pés mais ou menos na largura do quadril e flexione levemente os joelhos.
Firme o abdômen e leve as costelas para baixo, inclinando o tronco à frente.
Faça uma breve pausa embaixo, mantendo o quadril praticamente parado.
Desenrole o tronco devagar e volte à posição ereta com controle.',
  content_pt_ready = true
where slug = 'band-standing-crunch-1005';

update public.exercises set
  description = 'Exercício com elástico que fortalece a parte interna da coxa por meio da adução do quadril.',
  steps = array['Prenda o elástico em um ponto fixo firme, na altura do tornozelo.', 'Prenda a outra extremidade no tornozelo que vai trabalhar.', 'Fique em pé e, se precisar, segure em um apoio.', 'Leve a perna que trabalha cruzando à frente do corpo, aproximando-a da linha média.', 'Volte devagar à posição inicial e repita.']::text[],
  breathing = 'Expire ao levar a perna para dentro e inspire ao voltar.',
  common_mistakes = array['Usar o impulso', 'Girar o quadril para fora', 'Flexionar demais a perna de apoio']::text[],
  instructions = 'Prenda o elástico em um ponto fixo firme, na altura do tornozelo.
Prenda a outra extremidade no tornozelo que vai trabalhar.
Fique em pé e, se precisar, segure em um apoio.
Leve a perna que trabalha cruzando à frente do corpo, aproximando-a da linha média.
Volte devagar à posição inicial e repita.',
  content_pt_ready = true
where slug = 'band-hip-adduction-drv-band-hip-adduction';

update public.exercises set
  description = 'Sequência de alongamentos sentado com as pernas bem afastadas, para melhorar a flexibilidade do quadril, dos posteriores da coxa e da lombar.',
  steps = array['Sente-se com as pernas estendidas e bem afastadas.', 'Mantenha os joelhos e as pontas dos pés voltados para cima.', 'Sente-se ereto e incline o tronco à frente a partir do quadril.', 'Caminhe com as mãos à frente, mantendo as costas retas.', 'Sustente o alongamento ou desloque-se suavemente de um lado para o outro.']::text[],
  breathing = 'Inspire para se preparar e expire ao alongar à frente.',
  common_mistakes = array['Deixar os joelhos girarem para dentro', 'Arredondar demais as costas', 'Ir além do confortável']::text[],
  instructions = 'Sente-se com as pernas estendidas e bem afastadas.
Mantenha os joelhos e as pontas dos pés voltados para cima.
Sente-se ereto e incline o tronco à frente a partir do quadril.
Caminhe com as mãos à frente, mantendo as costas retas.
Sustente o alongamento ou desloque-se suavemente de um lado para o outro.',
  content_pt_ready = true
where slug = 'seated-wide-angle-pose-sequence-1587';

update public.exercises set
  description = 'Alongamento estático da parte interna das coxas, feito com um avanço lateral sustentado.',
  steps = array['Fique em pé com os pés bem afastados.', 'Passe o peso para uma perna, flexionando esse joelho.', 'Mantenha a outra perna estendida e a ponta do pé voltada para frente.', 'Incline-se suavemente em direção ao joelho flexionado para alongar bem a parte interna da coxa.', 'Sustente e depois troque de lado.']::text[],
  breathing = 'Respire de forma profunda e constante enquanto sustenta o alongamento.',
  common_mistakes = array['Deixar o calcanhar sair do chão', 'Girar o quadril', 'Inclinar o tronco à frente a partir da cintura']::text[],
  instructions = 'Fique em pé com os pés bem afastados.
Passe o peso para uma perna, flexionando esse joelho.
Mantenha a outra perna estendida e a ponta do pé voltada para frente.
Incline-se suavemente em direção ao joelho flexionado para alongar bem a parte interna da coxa.
Sustente e depois troque de lado.',
  content_pt_ready = true
where slug = 'standing-adductor-stretch-drv-stretching-adductor-stretch';

update public.exercises set
  description = 'Exercício de isolamento do ombro que eleva um braço à frente contra a resistência do elástico, voltado à porção anterior do deltoide.',
  steps = array['Fique em pé com um dos pés sobre o elástico para criar resistência.', 'Segure a alça com uma das mãos na altura da coxa, com a palma voltada para baixo.', 'Mantenha o braço estendido e eleve-o à frente até a altura do ombro.', 'Faça uma breve pausa no alto.', 'Desça o braço devagar e repita.']::text[],
  breathing = 'Expire ao elevar e inspire ao descer.',
  common_mistakes = array['Balançar o braço', 'Flexionar o cotovelo', 'Elevar acima da altura do ombro']::text[],
  instructions = 'Fique em pé com um dos pés sobre o elástico para criar resistência.
Segure a alça com uma das mãos na altura da coxa, com a palma voltada para baixo.
Mantenha o braço estendido e eleve-o à frente até a altura do ombro.
Faça uma breve pausa no alto.
Desça o braço devagar e repita.',
  content_pt_ready = true
where slug = 'band-one-arm-front-raise-1017';

update public.exercises set
  description = 'Elevação de panturrilha em pé com elástico, para fortalecer a panturrilha.',
  steps = array['Fique em pé sobre o elástico, com os pés na largura dos ombros.', 'Segure as alças ao lado do corpo ou na altura dos ombros para criar resistência.', 'Mantenha o tronco ereto e firme o abdômen.', 'Eleve os calcanhares até ficar na parte da frente dos pés, contraindo a panturrilha.', 'Desça os calcanhares devagar até o chão.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Repetições parciais', 'Deixar os calcanhares caírem rápido demais', 'Inclinar o tronco à frente ou para trás']::text[],
  instructions = 'Fique em pé sobre o elástico, com os pés na largura dos ombros.
Segure as alças ao lado do corpo ou na altura dos ombros para criar resistência.
Mantenha o tronco ereto e firme o abdômen.
Eleve os calcanhares até ficar na parte da frente dos pés, contraindo a panturrilha.
Desça os calcanhares devagar até o chão.',
  content_pt_ready = true
where slug = 'band-standing-calf-raise-0999';

update public.exercises set
  description = 'Alongamento estático de panturrilha usando uma corda ou faixa para puxar o pé para cima.',
  steps = array['Sente-se no chão com uma perna estendida.', 'Passe a corda ou o elástico pela parte da frente do pé.', 'Segure as pontas da corda e puxe o pé suavemente em sua direção.', 'Mantenha o joelho estendido para alongar mais.', 'Sustente o alongamento e depois troque de perna.']::text[],
  breathing = 'Respire fundo e relaxe durante todo o alongamento.',
  common_mistakes = array['Flexionar o joelho', 'Dar trancos na corda', 'Prender a respiração']::text[],
  instructions = 'Sente-se no chão com uma perna estendida.
Passe a corda ou o elástico pela parte da frente do pé.
Segure as pontas da corda e puxe o pé suavemente em sua direção.
Mantenha o joelho estendido para alongar mais.
Sustente o alongamento e depois troque de perna.',
  content_pt_ready = true
where slug = 'calf-stretch-with-rope-1378';

update public.exercises set
  description = 'Alongamento sentado com faixa ou elástico para trabalhar a panturrilha.',
  steps = array['Sente-se no chão com as pernas estendidas.', 'Passe a faixa pela parte da frente de um dos pés.', 'Segure as pontas da faixa e puxe o pé suavemente em sua direção.', 'Mantenha o joelho estendido e sustente pelo tempo desejado.', 'Troque de lado e repita.']::text[],
  breathing = 'Respire de forma profunda e constante durante o alongamento; expire suavemente ao aprofundá-lo.',
  common_mistakes = array['Flexionar o joelho', 'Puxar com força demais', 'Deixar as costas arredondarem']::text[],
  instructions = 'Sente-se no chão com as pernas estendidas.
Passe a faixa pela parte da frente de um dos pés.
Segure as pontas da faixa e puxe o pé suavemente em sua direção.
Mantenha o joelho estendido e sustente pelo tempo desejado.
Troque de lado e repita.',
  content_pt_ready = true
where slug = 'calf-stretch-with-strap-1599';

update public.exercises set
  description = 'Alongamento feito sentado, com foco em alongar a panturrilha.',
  steps = array['Sente-se com as pernas estendidas à frente.', 'Passe uma toalha ou elástico pela parte da frente de um dos pés.', 'Mantenha o joelho estendido e puxe a ponta do pé em sua direção.', 'Sustente a posição, sentindo alongar a panturrilha.', 'Repita com a outra perna.']::text[],
  breathing = 'Respire de forma constante e profunda durante todo o alongamento.',
  common_mistakes = array['Flexionar o joelho', 'Arredondar as costas', 'Puxar a ponta do pé com força demais']::text[],
  instructions = 'Sente-se com as pernas estendidas à frente.
Passe uma toalha ou elástico pela parte da frente de um dos pés.
Mantenha o joelho estendido e puxe a ponta do pé em sua direção.
Sustente a posição, sentindo alongar a panturrilha.
Repita com a outra perna.',
  content_pt_ready = true
where slug = 'seated-calf-stretch-1390';

update public.exercises set
  description = 'Alongamento feito em um degrau para trabalhar e aumentar a flexibilidade da panturrilha.',
  steps = array['Fique com a parte da frente dos pés sobre um degrau.', 'Apoie-se em um corrimão, na parede ou em outro objeto firme.', 'Desça os calcanhares devagar abaixo do nível do degrau até sentir alongar a panturrilha.', 'Sustente o alongamento de 15 a 30 segundos.', 'Suba os calcanhares novamente e repita conforme quiser.']::text[],
  breathing = 'Expire ao descer para o alongamento e inspire ao voltar.',
  common_mistakes = array['Deixar os calcanhares caírem rápido demais', 'Arredondar as costas', 'Quicar durante o alongamento']::text[],
  instructions = 'Fique com a parte da frente dos pés sobre um degrau.
Apoie-se em um corrimão, na parede ou em outro objeto firme.
Desça os calcanhares devagar abaixo do nível do degrau até sentir alongar a panturrilha.
Sustente o alongamento de 15 a 30 segundos.
Suba os calcanhares novamente e repita conforme quiser.',
  content_pt_ready = true
where slug = 'stairs-calf-stretch-drv-stretching-stairs-calf-stretch';

update public.exercises set
  description = 'Alongamento estático de panturrilha usando um banco como apoio.',
  steps = array['Fique de frente para um banco ou outra superfície firme.', 'Apoie a parte da frente de um pé na borda, mantendo o calcanhar no chão.', 'Incline o corpo à frente mantendo o joelho estendido.', 'Sustente o alongamento de 15 a 30 segundos.', 'Troque de perna e repita.']::text[],
  breathing = 'Expire ao relaxar no alongamento e inspire ao aliviar a tensão.',
  common_mistakes = array['Flexionar demais o joelho', 'Deixar o pé girar para dentro ou para fora', 'Forçar o alongamento']::text[],
  instructions = 'Fique de frente para um banco ou outra superfície firme.
Apoie a parte da frente de um pé na borda, mantendo o calcanhar no chão.
Incline o corpo à frente mantendo o joelho estendido.
Sustente o alongamento de 15 a 30 segundos.
Troque de perna e repita.',
  content_pt_ready = true
where slug = 'standing-bench-calf-stretch-drv-stretching-standing-bench-calf-stretch';

update public.exercises set
  description = 'Exercício aeróbico em que você gira a corda com as mãos e dá pequenos saltos repetidos enquanto ela passa sob os pés.',
  steps = array['Segure uma alça em cada mão, com a corda atrás dos calcanhares.', 'Fique em pé com os pés próximos e os cotovelos junto ao corpo.', 'Gire a corda com os punhos, passando-a por cima da cabeça.', 'Salte apenas o suficiente para a corda passar sob os pés.', 'Aterrisse suavemente na parte da frente dos pés, com os joelhos levemente flexionados.', 'Mantenha a corda em um ritmo suave e repita os saltos.']::text[],
  breathing = 'Respire de forma constante e natural, expirando suavemente a cada poucos saltos e mantendo um ritmo relaxado.',
  common_mistakes = array['Girar os braços em círculos grandes em vez de usar os punhos', 'Saltar alto demais a cada repetição', 'Aterrissar com o pé inteiro ou com os joelhos rígidos', 'Deixar as mãos se afastarem do quadril']::text[],
  instructions = 'Segure uma alça em cada mão, com a corda atrás dos calcanhares.
Fique em pé com os pés próximos e os cotovelos junto ao corpo.
Gire a corda com os punhos, passando-a por cima da cabeça.
Salte apenas o suficiente para a corda passar sob os pés.
Aterrisse suavemente na parte da frente dos pés, com os joelhos levemente flexionados.
Mantenha a corda em um ritmo suave e repita os saltos.',
  content_pt_ready = true
where slug = 'jump-rope-2612';

update public.exercises set
  description = 'Alongamento e mobilidade de ombro com elástico, para aquecer deltoides e manguito rotador.',
  steps = array['Fique em pé e segure o elástico com as mãos mais afastadas que os ombros.', 'Mantenha os braços estendidos, com o elástico à frente das coxas.', 'Eleve o elástico devagar acima da cabeça, mantendo os braços estendidos.', 'Leve o elástico atrás da cabeça e desça até a lombar.', 'Inverta o movimento para voltar à posição inicial.']::text[],
  breathing = 'Respire naturalmente durante todo o alongamento.',
  common_mistakes = array['Flexionar os braços', 'Fazer o movimento com pressa', 'Arquear a lombar']::text[],
  instructions = 'Fique em pé e segure o elástico com as mãos mais afastadas que os ombros.
Mantenha os braços estendidos, com o elástico à frente das coxas.
Eleve o elástico devagar acima da cabeça, mantendo os braços estendidos.
Leve o elástico atrás da cabeça e desça até a lombar.
Inverta o movimento para voltar à posição inicial.',
  content_pt_ready = true
where slug = 'band-shoulder-warm-up-stretch-drv-stretching-band-warm-up-shoulder-stretch';

update public.exercises set
  description = 'Remada com elástico e tronco inclinado, abrindo os cotovelos para trabalhar a porção posterior do deltoide e as costas altas.',
  steps = array['Pise no meio do elástico com os pés mais ou menos na largura do quadril e segure uma extremidade em cada mão.', 'Incline o tronco à frente a partir do quadril, com os joelhos levemente flexionados, até o tronco ficar inclinado e os braços pendidos abaixo dos ombros.', 'Abaixe os ombros e mantenha o peito aberto, com as palmas voltadas uma para a outra ou levemente para dentro.', 'Leve os cotovelos para fora e para trás até as mãos chegarem mais ou menos à altura da parte baixa do peito.', 'Contraia a parte de trás dos ombros e as costas altas no alto, sem encolher os ombros.', 'Desça as mãos com controle até estender os braços novamente.']::text[],
  breathing = 'Inspire ao voltar ao início e expire ao puxar o elástico.',
  common_mistakes = array['Ficar ereto demais e transformar o movimento em remada comum', 'Encolher os ombros em direção às orelhas no alto', 'Puxar as mãos baixo demais, em direção à cintura', 'Arredondar as costas ao inclinar o tronco']::text[],
  instructions = 'Pise no meio do elástico com os pés mais ou menos na largura do quadril e segure uma extremidade em cada mão.
Incline o tronco à frente a partir do quadril, com os joelhos levemente flexionados, até o tronco ficar inclinado e os braços pendidos abaixo dos ombros.
Abaixe os ombros e mantenha o peito aberto, com as palmas voltadas uma para a outra ou levemente para dentro.
Leve os cotovelos para fora e para trás até as mãos chegarem mais ou menos à altura da parte baixa do peito.
Contraia a parte de trás dos ombros e as costas altas no alto, sem encolher os ombros.
Desça as mãos com controle até estender os braços novamente.',
  content_pt_ready = true
where slug = 'band-standing-rear-delt-row-1022';

update public.exercises set
  description = 'Remada alta com barra e pegada aberta, movimento composto voltado aos ombros e às costas altas.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Segure a barra com pegada aberta e por cima.', 'Deixe a barra apoiada à frente das coxas.', 'Puxe a barra em linha reta em direção ao peito, com os cotovelos para os lados.', 'Desça a barra devagar até a posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao descer.',
  common_mistakes = array['Encolher demais os ombros', 'Usar impulso em excesso', 'Deixar as mãos muito próximas']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Segure a barra com pegada aberta e por cima.
Deixe a barra apoiada à frente das coxas.
Puxe a barra em linha reta em direção ao peito, com os cotovelos para os lados.
Desça a barra devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-wide-grip-upright-row-0123';

update public.exercises set
  description = 'Exercício de condicionamento com cordas, usando ondas alternadas dos braços para trabalhar ombros, antebraços e core.',
  steps = array['Firme a base com os pés mais ou menos na largura dos ombros e flexione levemente os joelhos.', 'Segure uma ponta de corda em cada mão, com as palmas voltadas uma para a outra e os braços à frente.', 'Firme o abdômen e suba uma mão enquanto desce a outra para iniciar as ondas.', 'Continue alternando os braços rapidamente para manter ondas contínuas nas cordas.', 'Mantenha os joelhos levemente flexionados e o tronco estável, com ondas regulares.']::text[],
  breathing = 'Respire de forma constante, expirando ao impulsionar o braço e inspirando na troca.',
  common_mistakes = array['Ficar totalmente ereto com os joelhos travados', 'Balançar o tronco inteiro em vez dos braços', 'Deixar as ondas ficarem irregulares ou pararem', 'Elevar os ombros em direção às orelhas']::text[],
  instructions = 'Firme a base com os pés mais ou menos na largura dos ombros e flexione levemente os joelhos.
Segure uma ponta de corda em cada mão, com as palmas voltadas uma para a outra e os braços à frente.
Firme o abdômen e suba uma mão enquanto desce a outra para iniciar as ondas.
Continue alternando os braços rapidamente para manter ondas contínuas nas cordas.
Mantenha os joelhos levemente flexionados e o tronco estável, com ondas regulares.',
  content_pt_ready = true
where slug = 'battling-ropes-0128';

update public.exercises set
  description = 'Remada na polia com corda, voltada à porção posterior do deltoide, levando os cotovelos para fora e para trás.',
  steps = array['Prenda a corda na polia baixa e fique de frente para a máquina.', 'Segure a corda com as duas mãos, dê um passo para trás para criar tensão e deixe os pés mais ou menos na largura do quadril.', 'Flexione levemente os joelhos e incline um pouco o tronco à frente, com as costas retas e os braços estendidos à frente.', 'Conduza o movimento pelos cotovelos e puxe a corda em direção à parte alta do peito, afastando as pontas.', 'Faça uma breve pausa com os cotovelos para fora e para trás e as escápulas aproximadas.', 'Desça a corda com controle até estender os braços, sem arredondar os ombros.']::text[],
  breathing = 'Inspire ao levar a corda à frente e expire ao puxá-la em direção à parte alta do peito.',
  common_mistakes = array['Ficar totalmente ereto e transformar o movimento em remada comum', 'Encolher os ombros em direção às orelhas durante a puxada', 'Puxar principalmente com as mãos, enrolando a corda para dentro', 'Arredondar a parte alta das costas quando a corda vai à frente']::text[],
  instructions = 'Prenda a corda na polia baixa e fique de frente para a máquina.
Segure a corda com as duas mãos, dê um passo para trás para criar tensão e deixe os pés mais ou menos na largura do quadril.
Flexione levemente os joelhos e incline um pouco o tronco à frente, com as costas retas e os braços estendidos à frente.
Conduza o movimento pelos cotovelos e puxe a corda em direção à parte alta do peito, afastando as pontas.
Faça uma breve pausa com os cotovelos para fora e para trás e as escápulas aproximadas.
Desça a corda com controle até estender os braços, sem arredondar os ombros.',
  content_pt_ready = true
where slug = 'cable-rear-delt-row-with-rope-0203';

update public.exercises set
  description = 'Alongamento sentado voltado a melhorar a flexibilidade e a mobilidade da parte da frente, de baixo e de trás dos ombros.',
  steps = array['Sente-se ereto com os pés inteiros no chão.', 'Eleve os braços acima da cabeça, alongando para cima.', 'Abaixe suavemente os ombros, afastando-os das orelhas.', 'Aproxime levemente as escápulas.', 'Sustente o alongamento, respirando de forma uniforme.']::text[],
  breathing = 'Inspire para começar e expire ao aprofundar o alongamento.',
  common_mistakes = array['Encolher os ombros', 'Curvar o tronco à frente', 'Prender a respiração']::text[],
  instructions = 'Sente-se ereto com os pés inteiros no chão.
Eleve os braços acima da cabeça, alongando para cima.
Abaixe suavemente os ombros, afastando-os das orelhas.
Aproxime levemente as escápulas.
Sustente o alongamento, respirando de forma uniforme.',
  content_pt_ready = true
where slug = 'seated-shoulder-flexor-depressor-retractor-stretch-2203';

update public.exercises set
  description = 'Exercício de lombar no banco de hiperextensão a 45 graus, voltado aos eretores da coluna e à cadeia posterior.',
  steps = array['Posicione-se no banco de hiperextensão a 45 graus, com os tornozelos presos.', 'Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.', 'Desça o tronco à frente a partir do quadril.', 'Pare quando o tronco ficar um pouco abaixo da linha paralela ao chão.', 'Suba o tronco até alinhá-lo com as pernas.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Arredondar as costas', 'Passar do ponto no alto', 'Usar o impulso']::text[],
  instructions = 'Posicione-se no banco de hiperextensão a 45 graus, com os tornozelos presos.
Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.
Desça o tronco à frente a partir do quadril.
Pare quando o tronco ficar um pouco abaixo da linha paralela ao chão.
Suba o tronco até alinhá-lo com as pernas.',
  content_pt_ready = true
where slug = '45-degree-hyperextension-0489';

update public.exercises set
  description = 'Extensão de tronco em máquina, que trabalha lombar, glúteos e posteriores da coxa movendo o tronco contra a resistência.',
  steps = array['Ajuste a máquina para que o encosto apoie confortavelmente a parte alta das costas e os pés fiquem presos na plataforma.', 'Sente-se ereto contra o apoio e segure as alças ou as barras laterais.', 'Firme o abdômen e incline o tronco à frente com controle, dentro da amplitude da máquina.', 'Pare embaixo ao sentir um alongamento confortável, mantendo os pés pressionados na plataforma.', 'Empurre o tronco de volta contra o apoio até retornar à posição ereta.', 'Repita de forma suave, sem quicar nem dar trancos no apoio.']::text[],
  breathing = 'Inspire ao inclinar à frente e expire ao estender de volta à posição ereta.',
  common_mistakes = array['Usar impulso e quicar para sair da posição mais baixa', 'Fazer uma amplitude curta e com pressa', 'Deixar os pés saírem ou se deslocarem na plataforma', 'Passar muito da posição ereta no alto']::text[],
  instructions = 'Ajuste a máquina para que o encosto apoie confortavelmente a parte alta das costas e os pés fiquem presos na plataforma.
Sente-se ereto contra o apoio e segure as alças ou as barras laterais.
Firme o abdômen e incline o tronco à frente com controle, dentro da amplitude da máquina.
Pare embaixo ao sentir um alongamento confortável, mantendo os pés pressionados na plataforma.
Empurre o tronco de volta contra o apoio até retornar à posição ereta.
Repita de forma suave, sem quicar nem dar trancos no apoio.',
  content_pt_ready = true
where slug = 'lever-back-extension-0573';

update public.exercises set
  description = 'Alongamento suave sentado, levando os braços à frente para aliviar a tensão da lombar.',
  steps = array['Sente-se com as pernas estendidas ou cruzadas.', 'Estenda os dois braços à frente do corpo.', 'Incline devagar a partir do quadril, levando o tronco à frente.', 'Relaxe as costas e os ombros.', 'Sustente o alongamento e volte à posição ereta.']::text[],
  breathing = 'Inspire fundo antes de inclinar e expire ao estender os braços à frente.',
  common_mistakes = array['Arredondar demais a parte alta das costas', 'Forçar o alongamento', 'Prender a respiração']::text[],
  instructions = 'Sente-se com as pernas estendidas ou cruzadas.
Estenda os dois braços à frente do corpo.
Incline devagar a partir do quadril, levando o tronco à frente.
Relaxe as costas e os ombros.
Sustente o alongamento e volte à posição ereta.',
  content_pt_ready = true
where slug = 'seated-lower-back-stretch-0690';

update public.exercises set
  description = 'Levantamento terra com barra guiada no Smith, para desenvolver força na lombar, nos glúteos e nos posteriores da coxa.',
  steps = array['Posicione os pés na largura dos ombros, sob a barra do Smith.', 'Segure a barra com as duas mãos, um pouco por fora dos joelhos.', 'Leve o quadril para trás e desça o tronco, mantendo o peito erguido.', 'Estenda quadril e joelhos para levantar a barra ao longo das guias.', 'Desça a barra com controle até a posição inicial.']::text[],
  breathing = 'Inspire ao descer a barra e expire ao levantá-la.',
  common_mistakes = array['Arredondar a lombar', 'Puxar com os braços em vez de usar as pernas', 'Deixar a barra se afastar do corpo', 'Fazer movimentos com trancos']::text[],
  instructions = 'Posicione os pés na largura dos ombros, sob a barra do Smith.
Segure a barra com as duas mãos, um pouco por fora dos joelhos.
Leve o quadril para trás e desça o tronco, mantendo o peito erguido.
Estenda quadril e joelhos para levantar a barra ao longo das guias.
Desça a barra com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'smith-machine-deadlift-0752';

update public.exercises set
  description = 'Alongamento no chão com foco em alongar a coluna e melhorar a flexibilidade da lombar e dos posteriores da coxa.',
  steps = array['Sente-se no chão com as pernas estendidas e os pés flexionados.', 'Estenda os braços à frente, na altura dos ombros.', 'Inspire e, ao expirar, alcance à frente articulando a coluna.', 'Vá à frente até onde for confortável, mantendo as pernas estendidas.', 'Sustente e volte devagar ao início.']::text[],
  breathing = 'Expire ao alongar à frente e inspire ao voltar ao início.',
  common_mistakes = array['Arredondar demais os ombros', 'Forçar o alongamento', 'Flexionar os joelhos']::text[],
  instructions = 'Sente-se no chão com as pernas estendidas e os pés flexionados.
Estenda os braços à frente, na altura dos ombros.
Inspire e, ao expirar, alcance à frente articulando a coluna.
Vá à frente até onde for confortável, mantendo as pernas estendidas.
Sustente e volte devagar ao início.',
  content_pt_ready = true
where slug = 'spine-stretch-1363';

update public.exercises set
  description = 'Extensão de punho com barra e pegada pronada, voltada aos extensores do antebraço.',
  steps = array['Sente-se no banco e segure a barra com pegada por cima (pronada).', 'Apoie os antebraços nas coxas, deixando os punhos um pouco além dos joelhos.', 'Comece com os punhos flexionados para baixo.', 'Estenda os punhos devagar para cima, levantando a barra.', 'Desça com controle até a posição inicial.']::text[],
  breathing = 'Expire ao subir a barra e inspire ao descer.',
  common_mistakes = array['Usar carga excessiva', 'Levantar com os cotovelos ou os ombros', 'Deixar a barra rolar nas mãos']::text[],
  instructions = 'Sente-se no banco e segure a barra com pegada por cima (pronada).
Apoie os antebraços nas coxas, deixando os punhos um pouco além dos joelhos.
Comece com os punhos flexionados para baixo.
Estenda os punhos devagar para cima, levantando a barra.
Desça com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-reverse-wrist-curl-0082';

update public.exercises set
  description = 'Exercício de antebraço em pé, segurando a barra atrás do corpo e elevando-a apenas com o movimento dos punhos.',
  steps = array['Fique em pé com os pés mais ou menos na largura do quadril e segure a barra atrás do quadril com pegada por cima.', 'Deixe a barra apoiada nos dedos, com as articulações voltadas para o chão e as palmas para trás.', 'Mantenha os cotovelos junto ao corpo e estenda os punhos, descendo a barra em direção às pontas dos dedos.', 'Flexione os punhos para cima, trazendo a barra de volta para as mãos e elevando-a o máximo que conseguir.', 'Faça uma breve pausa no alto e desça a barra com controle até a posição inicial.']::text[],
  breathing = 'Inspire ao descer a barra em direção às pontas dos dedos e expire ao flexionar os punhos para cima.',
  common_mistakes = array['Balançar a barra com os ombros ou o tronco', 'Flexionar os cotovelos para levantar a barra', 'Deixar a barra escorregar demais para fora das mãos', 'Fazer movimentos de punho curtos e com trancos']::text[],
  instructions = 'Fique em pé com os pés mais ou menos na largura do quadril e segure a barra atrás do quadril com pegada por cima.
Deixe a barra apoiada nos dedos, com as articulações voltadas para o chão e as palmas para trás.
Mantenha os cotovelos junto ao corpo e estenda os punhos, descendo a barra em direção às pontas dos dedos.
Flexione os punhos para cima, trazendo a barra de volta para as mãos e elevando-a o máximo que conseguir.
Faça uma breve pausa no alto e desça a barra com controle até a posição inicial.',
  content_pt_ready = true
where slug = 'barbell-standing-back-wrist-curl-0104';

update public.exercises set
  description = 'Exercício de isolamento do antebraço feito com o halter atrás do corpo, enfatizando os flexores do antebraço.',
  steps = array['Fique em pé com o halter atrás do corpo, o braço estendido e a palma voltada para trás.', 'Deixe o halter descer levemente pelos dedos.', 'Flexione o punho para subir o halter.', 'Contraia no ponto mais alto do movimento.', 'Desça o peso devagar.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o braço em vez do punho', 'Amplitude incompleta', 'Fazer o movimento com trancos']::text[],
  instructions = 'Fique em pé com o halter atrás do corpo, o braço estendido e a palma voltada para trás.
Deixe o halter descer levemente pelos dedos.
Flexione o punho para subir o halter.
Contraia no ponto mais alto do movimento.
Desça o peso devagar.',
  content_pt_ready = true
where slug = 'dumbbell-behind-the-back-wrist-curl-0364';

update public.exercises set
  description = 'Exercício de isolamento do antebraço feito sentado, flexionando os punhos com os antebraços apoiados no banco.',
  steps = array['Sente-se junto ao banco e apoie os antebraços sobre ele, com as palmas voltadas para cima.', 'Segure um halter em cada mão e deslize à frente até os punhos passarem um pouco da borda do banco.', 'Deixe as mãos descerem para alongar suavemente os punhos embaixo.', 'Flexione os punhos para cima, levando as articulações dos dedos em direção aos antebraços.', 'Contraia os antebraços brevemente no alto.', 'Desça os halteres com controle até estender os punhos novamente.']::text[],
  breathing = 'Inspire ao descer os punhos e expire ao flexioná-los para cima.',
  common_mistakes = array['Tirar os antebraços do banco durante o movimento.', 'Balançar os halteres em vez de mover apenas os punhos.', 'Usar amplitude parcial e parar antes de descer totalmente os punhos.', 'Flexionar os cotovelos para ajudar a subir o peso.']::text[],
  instructions = 'Sente-se junto ao banco e apoie os antebraços sobre ele, com as palmas voltadas para cima.
Segure um halter em cada mão e deslize à frente até os punhos passarem um pouco da borda do banco.
Deixe as mãos descerem para alongar suavemente os punhos embaixo.
Flexione os punhos para cima, levando as articulações dos dedos em direção aos antebraços.
Contraia os antebraços brevemente no alto.
Desça os halteres com controle até estender os punhos novamente.',
  content_pt_ready = true
where slug = 'dumbbell-over-bench-wrist-curl-0369';

update public.exercises set
  description = 'Alongamento de punho e antebraço feito em pé ou sentado, estendendo o braço e puxando suavemente para o lado.',
  steps = array['Fique em pé ou sente-se ereto.', 'Estenda um braço acima da cabeça ou para o lado.', 'Segure o punho com a mão oposta.', 'Puxe suavemente para um dos lados.', 'Sustente e depois troque de lado.']::text[],
  breathing = 'Expire ao alongar e inspire ao relaxar ou trocar de lado.',
  common_mistakes = array['Puxar com força demais', 'Travar o cotovelo', 'Encolher o ombro']::text[],
  instructions = 'Fique em pé ou sente-se ereto.
Estenda um braço acima da cabeça ou para o lado.
Segure o punho com a mão oposta.
Puxe suavemente para um dos lados.
Sustente e depois troque de lado.',
  content_pt_ready = true
where slug = 'side-wrist-pull-stretch-0721';

update public.exercises set
  description = 'Movimento dinâmico de corpo inteiro para trabalhar resistência cardiovascular e muscular.',
  steps = array['Comece com os pés juntos e os braços relaxados ao lado do corpo.', 'Salte afastando os pés até a largura dos ombros enquanto eleva os braços acima da cabeça.', 'Toque rapidamente as mãos ou mantenha os braços estendidos acima da cabeça.', 'Salte juntando os pés novamente e baixando os braços ao lado do corpo.', 'Repita em ritmo acelerado.']::text[],
  breathing = 'Respire de forma uniforme durante todo o movimento.',
  common_mistakes = array['Bater os pés no chão', 'Não completar a subida dos braços', 'Aterrissar com força nos calcanhares']::text[],
  instructions = 'Comece com os pés juntos e os braços relaxados ao lado do corpo.
Salte afastando os pés até a largura dos ombros enquanto eleva os braços acima da cabeça.
Toque rapidamente as mãos ou mantenha os braços estendidos acima da cabeça.
Salte juntando os pés novamente e baixando os braços ao lado do corpo.
Repita em ritmo acelerado.',
  content_pt_ready = true
where slug = 'jumping-jack-new-low-impact-jumping-jack';

update public.exercises set
  description = 'Extensão de quadril para trás com foco no glúteo, feita em quatro apoios com elástico para aumentar a intensidade.',
  steps = array['Prenda o elástico em um ponto fixo e passe-o pelo tornozelo que vai trabalhar.', 'Comece em quatro apoios, com as mãos abaixo dos ombros e os joelhos flexionados.', 'Contraia o abdômen e estenda uma perna para trás contra a resistência do elástico.', 'Faça uma pausa no alto e contraia o glúteo.', 'Volte à posição inicial, repita pelo número de repetições desejado e troque de perna.']::text[],
  breathing = 'Expire ao estender a perna para trás e inspire ao trazer o joelho de volta.',
  common_mistakes = array['Deixar a lombar afundar', 'Girar o quadril', 'Usar o impulso']::text[],
  instructions = 'Prenda o elástico em um ponto fixo e passe-o pelo tornozelo que vai trabalhar.
Comece em quatro apoios, com as mãos abaixo dos ombros e os joelhos flexionados.
Contraia o abdômen e estenda uma perna para trás contra a resistência do elástico.
Faça uma pausa no alto e contraia o glúteo.
Volte à posição inicial, repita pelo número de repetições desejado e troque de perna.',
  content_pt_ready = true
where slug = 'band-one-leg-kickback-bent-position-drv-band-one-leg-kickback-bent-position';

update public.exercises set
  description = 'Dobradiça de quadril com elástico, que trabalha glúteos e posteriores da coxa ao passar o elástico entre as pernas e ficar ereto.',
  steps = array['Prenda o elástico na altura do chão e passe-o entre as pernas.', 'Fique de costas para o ponto fixo e caminhe à frente até o elástico ficar tensionado.', 'Deixe os pés mais ou menos na largura do quadril e flexione levemente os joelhos.', 'Leve o quadril para trás e incline o tronco à frente, deixando o elástico passar por trás de você.', 'Desça até sentir alongar os posteriores da coxa, mantendo as costas retas.', 'Leve o quadril à frente para ficar ereto e contraia os glúteos no alto.']::text[],
  breathing = 'Inspire ao levar o quadril para trás e expire ao projetá-lo à frente para ficar em pé.',
  common_mistakes = array['Agachar para baixo em vez de levar o quadril para trás', 'Arredondar a lombar ao inclinar o tronco', 'Deixar o elástico puxar o quadril para trás no fim da extensão', 'Flexionar demais os joelhos e transferir o esforço para o quadríceps']::text[],
  instructions = 'Prenda o elástico na altura do chão e passe-o entre as pernas.
Fique de costas para o ponto fixo e caminhe à frente até o elástico ficar tensionado.
Deixe os pés mais ou menos na largura do quadril e flexione levemente os joelhos.
Leve o quadril para trás e incline o tronco à frente, deixando o elástico passar por trás de você.
Desça até sentir alongar os posteriores da coxa, mantendo as costas retas.
Leve o quadril à frente para ficar ereto e contraia os glúteos no alto.',
  content_pt_ready = true
where slug = 'band-pull-through-0991';

update public.exercises set
  description = 'Levantamento do chão até a posição em pé com kettlebell, baseado na dobradiça de quadril, que desenvolve a cadeia posterior e a força de preensão.',
  steps = array['Coloque o kettlebell entre os pés e fique em pé com os pés na largura do quadril.', 'Incline a partir do quadril e flexione os joelhos, mantendo as costas retas e o peito erguido.', 'Segure a alça do kettlebell com as duas mãos.', 'Empurre com os calcanhares para ficar em pé, estendendo totalmente quadril e joelhos.', 'Desça o kettlebell até o chão com controle, inclinando a partir do quadril.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Arredondar a lombar', 'Deixar o kettlebell se afastar do corpo', 'Travar os joelhos antes do fim', 'Encolher os ombros']::text[],
  instructions = 'Coloque o kettlebell entre os pés e fique em pé com os pés na largura do quadril.
Incline a partir do quadril e flexione os joelhos, mantendo as costas retas e o peito erguido.
Segure a alça do kettlebell com as duas mãos.
Empurre com os calcanhares para ficar em pé, estendendo totalmente quadril e joelhos.
Desça o kettlebell até o chão com controle, inclinando a partir do quadril.',
  content_pt_ready = true
where slug = 'kettlebell-deadlift-drv-kettlebell-deadlift';

update public.exercises set
  description = 'Movimento lateral de perna com elástico, para ativar e fortalecer os abdutores do quadril.',
  steps = array['Coloque o elástico em volta das coxas ou dos tornozelos.', 'Fique em pé com os pés na largura do quadril.', 'Passe o peso para uma perna.', 'Eleve a outra perna para o lado contra a resistência do elástico.', 'Volte a perna ao início e repita dos dois lados.']::text[],
  breathing = 'Expire ao elevar a perna e inspire ao voltar.',
  common_mistakes = array['Inclinar o tronco', 'Perder o equilíbrio', 'Deixar o elástico puxar a perna de volta de golpe']::text[],
  instructions = 'Coloque o elástico em volta das coxas ou dos tornozelos.
Fique em pé com os pés na largura do quadril.
Passe o peso para uma perna.
Eleve a outra perna para o lado contra a resistência do elástico.
Volte a perna ao início e repita dos dois lados.',
  content_pt_ready = true
where slug = 'band-hip-abduction-3006';

update public.exercises set
  description = 'Flexão de pernas deitado de bruços contra a resistência do elástico, para isolar os posteriores da coxa.',
  steps = array['Prenda o elástico com firmeza na altura do chão.', 'Deite-se de bruços com as pernas estendidas.', 'Passe o elástico pelo tornozelo.', 'Flexione o joelho, levando o calcanhar em direção aos glúteos.', 'Volte devagar ao início; repita e troque de perna se quiser.']::text[],
  breathing = 'Expire ao flexionar e inspire ao descer.',
  common_mistakes = array['Tirar o quadril do chão', 'Usar o impulso', 'Deixar o elástico puxar a perna de volta de golpe']::text[],
  instructions = 'Prenda o elástico com firmeza na altura do chão.
Deite-se de bruços com as pernas estendidas.
Passe o elástico pelo tornozelo.
Flexione o joelho, levando o calcanhar em direção aos glúteos.
Volte devagar ao início; repita e troque de perna se quiser.',
  content_pt_ready = true
where slug = 'band-prone-leg-curl-0976';

update public.exercises set
  description = 'Flexão de pernas em pé contra a resistência do elástico, voltada aos posteriores da coxa.',
  steps = array['Prenda o elástico atrás de você, na altura do chão.', 'Passe o elástico por um dos tornozelos.', 'Apoie-se na outra perna e mantenha o equilíbrio.', 'Leve o calcanhar em direção aos glúteos flexionando o joelho.', 'Desça a perna devagar; repita e troque de lado.']::text[],
  breathing = 'Expire ao flexionar e inspire ao voltar.',
  common_mistakes = array['Deixar os joelhos avançarem à frente', 'Usar as costas para ajudar', 'Deixar o elástico voltar de golpe']::text[],
  instructions = 'Prenda o elástico atrás de você, na altura do chão.
Passe o elástico por um dos tornozelos.
Apoie-se na outra perna e mantenha o equilíbrio.
Leve o calcanhar em direção aos glúteos flexionando o joelho.
Desça a perna devagar; repita e troque de lado.',
  content_pt_ready = true
where slug = 'band-standing-leg-curl-0988';

update public.exercises set
  description = 'Mesa flexora deitado: exercício de posteriores da coxa em máquina, feito de bruços, flexionando os joelhos para levar a alavanca em direção aos glúteos.',
  steps = array['Ajuste a máquina para que os joelhos fiquem alinhados com o eixo de giro e a almofada encoste na parte de trás das pernas, acima dos calcanhares.', 'Deite-se de bruços no banco com as pernas estendidas e segure as alças ou as bordas do banco para dar apoio.', 'Pressione o quadril contra a almofada e aponte as pontas dos pés para frente para definir a posição inicial.', 'Flexione os joelhos para subir a almofada, levando os calcanhares em direção aos glúteos.', 'Faça uma breve pausa no alto, mantendo o quadril apoiado e as coxas na almofada.', 'Desça a almofada com controle até estender as pernas novamente.']::text[],
  breathing = 'Expire ao subir a almofada e inspire ao descê-la com controle.',
  common_mistakes = array['Tirar o quadril da almofada no alto', 'Usar impulso para balançar a almofada para cima', 'Parar antes do fim e não descer totalmente a almofada', 'Girar bastante os pés para dentro ou para fora durante a flexão']::text[],
  instructions = 'Ajuste a máquina para que os joelhos fiquem alinhados com o eixo de giro e a almofada encoste na parte de trás das pernas, acima dos calcanhares.
Deite-se de bruços no banco com as pernas estendidas e segure as alças ou as bordas do banco para dar apoio.
Pressione o quadril contra a almofada e aponte as pontas dos pés para frente para definir a posição inicial.
Flexione os joelhos para subir a almofada, levando os calcanhares em direção aos glúteos.
Faça uma breve pausa no alto, mantendo o quadril apoiado e as coxas na almofada.
Desça a almofada com controle até estender as pernas novamente.',
  content_pt_ready = true
where slug = 'lever-lying-leg-curl-0586';

update public.exercises set
  description = 'Mesa flexora sentado: exercício de posteriores da coxa em máquina, flexionando os joelhos para puxar a alavanca para baixo.',
  steps = array['Ajuste o assento e a almofada para que os joelhos fiquem alinhados com o eixo de giro da máquina.', 'Sente-se recostado no encosto e posicione a parte de baixo das pernas sob o rolo, logo acima dos tornozelos.', 'Segure as alças e mantenha as coxas pressionadas no assento.', 'Flexione os joelhos para levar a almofada para baixo, aproximando os calcanhares do chão.', 'Faça uma breve pausa embaixo e contraia os posteriores da coxa.', 'Deixe a almofada subir de volta com controle até os joelhos ficarem quase estendidos.']::text[],
  breathing = 'Expire ao levar a almofada para baixo e inspire ao retornar à posição inicial.',
  common_mistakes = array['Tirar o quadril do assento durante a flexão.', 'Usar impulso e balançar a almofada ao longo da repetição.', 'Travar totalmente os joelhos no alto.', 'Deixar a almofada alta nas panturrilhas em vez de acima dos tornozelos.']::text[],
  instructions = 'Ajuste o assento e a almofada para que os joelhos fiquem alinhados com o eixo de giro da máquina.
Sente-se recostado no encosto e posicione a parte de baixo das pernas sob o rolo, logo acima dos tornozelos.
Segure as alças e mantenha as coxas pressionadas no assento.
Flexione os joelhos para levar a almofada para baixo, aproximando os calcanhares do chão.
Faça uma breve pausa embaixo e contraia os posteriores da coxa.
Deixe a almofada subir de volta com controle até os joelhos ficarem quase estendidos.',
  content_pt_ready = true
where slug = 'lever-seated-leg-curl-0599';

update public.exercises set
  description = 'Alongamento no chão voltado aos posteriores da coxa, elevando e sustentando uma perna estendida em direção ao corpo.',
  steps = array['Deite-se de costas com as duas pernas estendidas.', 'Eleve uma perna mantendo-a estendida.', 'Segure suavemente a parte de trás da coxa ou da panturrilha.', 'Puxe a perna levemente em direção ao peito.', 'Sustente e troque de perna.']::text[],
  breathing = 'Expire ao alongar a perna e inspire ao descê-la.',
  common_mistakes = array['Flexionar o joelho da perna elevada', 'Tirar o quadril do colchonete', 'Tensionar o pescoço ou as costas']::text[],
  instructions = 'Deite-se de costas com as duas pernas estendidas.
Eleve uma perna mantendo-a estendida.
Segure suavemente a parte de trás da coxa ou da panturrilha.
Puxe a perna levemente em direção ao peito.
Sustente e troque de perna.',
  content_pt_ready = true
where slug = 'single-straight-leg-stretch-drv-stretching-single-straight-leg-stretch';

update public.exercises set
  description = 'Alongamento estático voltado aos posteriores da coxa, na parte de trás da perna.',
  steps = array['Fique em pé, ereto, com os pés na largura do quadril.', 'Mantenha os joelhos levemente flexionados e incline o tronco à frente a partir do quadril.', 'Desça o tronco em direção às pernas, buscando alcançar os pés.', 'Pare ao sentir um alongamento leve nos posteriores da coxa.', 'Sustente pelo tempo desejado e volte à posição em pé.']::text[],
  breathing = 'Expire ao inclinar à frente e inspire ao voltar à posição ereta.',
  common_mistakes = array['Arredondar as costas', 'Travar os joelhos', 'Forçar o alongamento']::text[],
  instructions = 'Fique em pé, ereto, com os pés na largura do quadril.
Mantenha os joelhos levemente flexionados e incline o tronco à frente a partir do quadril.
Desça o tronco em direção às pernas, buscando alcançar os pés.
Pare ao sentir um alongamento leve nos posteriores da coxa.
Sustente pelo tempo desejado e volte à posição em pé.',
  content_pt_ready = true
where slug = 'standing-hamstring-stretch-1511';

update public.exercises set
  description = 'Exercício de core e flexores do quadril feito deitado, alternando a subida e a descida das pernas em movimento de tesoura.',
  steps = array['Deite-se de costas com as pernas estendidas e os braços ao lado do corpo.', 'Tire as duas pernas alguns centímetros do chão, mantendo-as estendidas.', 'Alterne subindo uma perna enquanto desce a outra, em movimento de tesoura.', 'Continue alternando as pernas de forma controlada.', 'Mantenha a cabeça e os ombros relaxados e o abdômen contraído.']::text[],
  breathing = 'Expire ao subir as pernas e inspire ao descê-las.',
  common_mistakes = array['Arquear a lombar', 'Fazer o movimento rápido demais', 'Deixar as pernas tocarem o chão']::text[],
  instructions = 'Deite-se de costas com as pernas estendidas e os braços ao lado do corpo.
Tire as duas pernas alguns centímetros do chão, mantendo-as estendidas.
Alterne subindo uma perna enquanto desce a outra, em movimento de tesoura.
Continue alternando as pernas de forma controlada.
Mantenha a cabeça e os ombros relaxados e o abdômen contraído.',
  content_pt_ready = true
where slug = 'lying-scissor-kick-drv-lying-scissor-kick-female';

update public.exercises set
  description = 'Exercício deitado de costas que isola os flexores do quadril e a parte inferior do abdômen.',
  steps = array['Deite-se de costas, com os braços ao lado do corpo.', 'Estenda totalmente as pernas, com os pés juntos.', 'Eleve as pernas estendidas até a vertical.', 'Faça uma breve pausa no alto.', 'Desça as pernas devagar, sem tocar o chão.']::text[],
  breathing = 'Expire ao elevar as pernas e inspire ao descê-las.',
  common_mistakes = array['Arquear a lombar', 'Usar o impulso', 'Afastar as pernas uma da outra']::text[],
  instructions = 'Deite-se de costas, com os braços ao lado do corpo.
Estenda totalmente as pernas, com os pés juntos.
Eleve as pernas estendidas até a vertical.
Faça uma breve pausa no alto.
Desça as pernas devagar, sem tocar o chão.',
  content_pt_ready = true
where slug = 'lying-straight-leg-raise-1002';

update public.exercises set
  description = 'Alongamento em pé que abre o quadril e alonga o abdômen, estendendo os braços acima da cabeça e inclinando o tronco para trás.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Eleve os braços acima da cabeça, com as palmas voltadas para frente.', 'Arqueie suavemente as costas, erguendo o peito e olhando para cima.', 'Leve o quadril um pouco à frente para intensificar o alongamento do flexor do quadril.', 'Sustente e respire pelo tempo desejado.']::text[],
  breathing = 'Inspire antes de arquear e expire enquanto sustenta o alongamento.',
  common_mistakes = array['Arquear demais a lombar', 'Travar os joelhos', 'Não contrair o abdômen']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Eleve os braços acima da cabeça, com as palmas voltadas para frente.
Arqueie suavemente as costas, erguendo o peito e olhando para cima.
Leve o quadril um pouco à frente para intensificar o alongamento do flexor do quadril.
Sustente e respire pelo tempo desejado.',
  content_pt_ready = true
where slug = 'standing-hip-flexor-and-abdominal-stretch-drv-stretching-ceiling-look-stretch';

update public.exercises set
  description = 'Alongamento em pé voltado a flexores do quadril e glúteos, puxando um joelho em direção ao peito.',
  steps = array['Fique em pé com os pés juntos.', 'Eleve um joelho em direção ao peito.', 'Segure o joelho com as duas mãos.', 'Puxe o joelho suavemente em direção ao peito, sentindo o alongamento.', 'Sustente, desça e repita com a outra perna.']::text[],
  breathing = 'Expire ao puxar o joelho e inspire ao soltar.',
  common_mistakes = array['Arredondar os ombros', 'Puxar com força demais', 'Perder o equilíbrio']::text[],
  instructions = 'Fique em pé com os pés juntos.
Eleve um joelho em direção ao peito.
Segure o joelho com as duas mãos.
Puxe o joelho suavemente em direção ao peito, sentindo o alongamento.
Sustente, desça e repita com a outra perna.',
  content_pt_ready = true
where slug = 'standing-knee-raise-stretch-0484';

update public.exercises set
  description = 'Barra fixa com auxílio de elástico, para desenvolver força de puxada no dorsal, bíceps e costas altas.',
  steps = array['Passe o elástico pela barra fixa com segurança e apoie um pé ou o joelho na parte de baixo dele.', 'Segure a barra um pouco mais aberta que a largura dos ombros, com as palmas voltadas para frente.', 'Fique suspenso com os braços estendidos, firme o abdômen e leve os ombros para baixo, longe das orelhas.', 'Puxe o corpo levando os cotovelos para baixo e para trás, até o queixo passar da barra.', 'Desça com controle até estender os braços novamente, mantendo o tronco firme.']::text[],
  breathing = 'Inspire embaixo antes de puxar, expire ao subir e inspire novamente ao descer com controle.',
  common_mistakes = array['Chutar ou balançar para subir', 'Encolher os ombros em direção às orelhas', 'Parar antes do fim, com o queixo abaixo da barra', 'Descer rápido até embaixo, sem controle']::text[],
  instructions = 'Passe o elástico pela barra fixa com segurança e apoie um pé ou o joelho na parte de baixo dele.
Segure a barra um pouco mais aberta que a largura dos ombros, com as palmas voltadas para frente.
Fique suspenso com os braços estendidos, firme o abdômen e leve os ombros para baixo, longe das orelhas.
Puxe o corpo levando os cotovelos para baixo e para trás, até o queixo passar da barra.
Desça com controle até estender os braços novamente, mantendo o tronco firme.',
  content_pt_ready = true
where slug = 'band-assisted-pull-up-0970';

update public.exercises set
  description = 'Puxada ajoelhada com elástico feita com um braço por vez, que trabalha o dorsal levando o cotovelo para baixo a partir de cima da cabeça.',
  steps = array['Prenda o elástico em um ponto alto e ajoelhe-se de frente para ele.', 'Segure o elástico com uma das mãos e estenda esse braço para cima e um pouco à frente.', 'Firme o tronco e mantenha o peito erguido, sem inclinar para trás.', 'Leve o cotovelo para baixo, em direção à lateral do corpo, até a mão chegar mais ou menos à altura do ombro ou das costelas.', 'Contraia o dorsal embaixo, mantendo o ombro abaixado.', 'Estenda o braço de volta acima da cabeça, devagar e com controle.', 'Faça todas as repetições de um lado e depois troque de braço.']::text[],
  breathing = 'Inspire enquanto o braço volta para cima e expire ao puxar o elástico para baixo.',
  common_mistakes = array['Inclinar o tronco para trás para terminar a puxada', 'Encolher o ombro em direção à orelha', 'Dobrar e estender o punho durante a puxada', 'Deixar o elástico puxar o braço de volta de golpe']::text[],
  instructions = 'Prenda o elástico em um ponto alto e ajoelhe-se de frente para ele.
Segure o elástico com uma das mãos e estenda esse braço para cima e um pouco à frente.
Firme o tronco e mantenha o peito erguido, sem inclinar para trás.
Leve o cotovelo para baixo, em direção à lateral do corpo, até a mão chegar mais ou menos à altura do ombro ou das costelas.
Contraia o dorsal embaixo, mantendo o ombro abaixado.
Estenda o braço de volta acima da cabeça, devagar e com controle.
Faça todas as repetições de um lado e depois troque de braço.',
  content_pt_ready = true
where slug = 'band-kneeling-one-arm-pulldown-0983';

update public.exercises set
  description = 'Remada sentada com elástico, voltada ao meio das costas e ao dorsal.',
  steps = array['Sente-se no chão com as pernas estendidas e passe o elástico pelos pés.', 'Segure as alças ou as pontas do elástico com as duas mãos, com os braços estendidos.', 'Mantenha as costas retas e o peito erguido.', 'Puxe as alças para trás, levando os cotovelos além do tronco e aproximando as escápulas.', 'Solte devagar até a posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao voltar ao início.',
  common_mistakes = array['Arredondar as costas', 'Usar o impulso', 'Deixar o elástico frouxo entre as repetições']::text[],
  instructions = 'Sente-se no chão com as pernas estendidas e passe o elástico pelos pés.
Segure as alças ou as pontas do elástico com as duas mãos, com os braços estendidos.
Mantenha as costas retas e o peito erguido.
Puxe as alças para trás, levando os cotovelos além do tronco e aproximando as escápulas.
Solte devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'band-seated-row-0990';

update public.exercises set
  description = 'Remada sentada com elástico e tronco ereto, que enfatiza as costas altas e o dorsal.',
  steps = array['Sente-se no chão e estenda as pernas à frente.', 'Passe o elástico pelos pés com segurança.', 'Segure as alças com as duas mãos, com os braços estendidos.', 'Mantendo as costas retas, puxe as alças em direção à cintura, com os cotovelos junto ao corpo.', 'Faça uma pausa, aproxime as escápulas e volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao voltar ao início.',
  common_mistakes = array['Arredondar as costas', 'Deixar os braços abrirem para os lados', 'Usar impulso em vez da musculatura das costas']::text[],
  instructions = 'Sente-se no chão e estenda as pernas à frente.
Passe o elástico pelos pés com segurança.
Segure as alças com as duas mãos, com os braços estendidos.
Mantendo as costas retas, puxe as alças em direção à cintura, com os cotovelos junto ao corpo.
Faça uma pausa, aproxime as escápulas e volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'band-straight-back-seated-row-3144';

update public.exercises set
  description = 'Alongamento estático para trabalhar a musculatura da região torácica, no meio das costas.',
  steps = array['Sente-se ou fique em pé com os pés na largura do quadril.', 'Estenda os braços à frente e una as mãos.', 'Arredonde a parte alta das costas e empurre as mãos à frente.', 'Leve o queixo levemente em direção ao peito.', 'Sustente o alongamento de 20 a 30 segundos e solte.']::text[],
  breathing = 'Respire de forma lenta e uniforme durante todo o alongamento.',
  common_mistakes = array['Arquear a lombar em vez de arredondar a parte alta das costas', 'Prender a respiração', 'Quicar durante o alongamento']::text[],
  instructions = 'Sente-se ou fique em pé com os pés na largura do quadril.
Estenda os braços à frente e una as mãos.
Arredonde a parte alta das costas e empurre as mãos à frente.
Leve o queixo levemente em direção ao peito.
Sustente o alongamento de 20 a 30 segundos e solte.',
  content_pt_ready = true
where slug = 'middle-back-stretch-1405';

update public.exercises set
  description = 'Flexão lateral de tronco em pé com elástico, para trabalhar e fortalecer os oblíquos.',
  steps = array['Prenda o elástico com firmeza na altura do chão.', 'Fique ao lado do ponto fixo, com os pés na largura dos ombros.', 'Segure a alça com a mão de fora, com o braço estendido ao lado do corpo.', 'Mantendo o tronco reto, incline para o lado, afastando-se do ponto fixo.', 'Volte à posição inicial, repita pelo número de repetições desejado e troque de lado.']::text[],
  breathing = 'Expire ao inclinar e inspire ao voltar.',
  common_mistakes = array['Girar o tronco em vez de inclinar para o lado', 'Inclinar à frente ou para trás', 'Deixar o elástico voltar de golpe', 'Usar o impulso']::text[],
  instructions = 'Prenda o elástico com firmeza na altura do chão.
Fique ao lado do ponto fixo, com os pés na largura dos ombros.
Segure a alça com a mão de fora, com o braço estendido ao lado do corpo.
Mantendo o tronco reto, incline para o lado, afastando-se do ponto fixo.
Volte à posição inicial, repita pelo número de repetições desejado e troque de lado.',
  content_pt_ready = true
where slug = 'band-side-bend-0002';

update public.exercises set
  description = 'Movimento diagonal com elástico para trabalhar os oblíquos e os estabilizadores do core.',
  steps = array['Prenda o elástico em um ponto baixo, próximo ao chão.', 'Fique de lado para o ponto fixo, com os pés na largura dos ombros.', 'Segure a alça com as duas mãos na altura do quadril.', 'Eleve e gire o tronco na diagonal, para o lado oposto e acima do ombro.', 'Volte ao início, repita e depois troque de lado.']::text[],
  breathing = 'Expire ao elevar e girar, inspire ao voltar.',
  common_mistakes = array['Usar os braços em vez do core', 'Não girar o tronco', 'Flexionar demais os cotovelos']::text[],
  instructions = 'Prenda o elástico em um ponto baixo, próximo ao chão.
Fique de lado para o ponto fixo, com os pés na largura dos ombros.
Segure a alça com as duas mãos na altura do quadril.
Eleve e gire o tronco na diagonal, para o lado oposto e acima do ombro.
Volte ao início, repita e depois troque de lado.',
  content_pt_ready = true
where slug = 'band-standing-lift-1408';

update public.exercises set
  description = 'Alongamento com rotação de tronco sentado, voltado aos oblíquos e à lombar.',
  steps = array['Sente-se ereto com as pernas estendidas à frente.', 'Se quiser intensificar, cruze a perna esquerda sobre a direita.', 'Estenda o braço direito para trás como apoio.', 'Gire o tronco para a direita, usando o outro braço como alavanca.', 'Sustente e repita para o outro lado.']::text[],
  breathing = 'Respire de forma constante enquanto sustenta o alongamento.',
  common_mistakes = array['Curvar as costas', 'Girar além do confortável', 'Prender a respiração']::text[],
  instructions = 'Sente-se ereto com as pernas estendidas à frente.
Se quiser intensificar, cruze a perna esquerda sobre a direita.
Estenda o braço direito para trás como apoio.
Gire o tronco para a direita, usando o outro braço como alavanca.
Sustente e repita para o outro lado.',
  content_pt_ready = true
where slug = 'seated-twist-stretch-straight-arm-drv-stretching-seated-twist-straight-arm';

update public.exercises set
  description = 'Alongamento lateral em pé com foco em alongar os oblíquos e a musculatura da lateral do tronco.',
  steps = array['Fique em pé ou sente-se ereto, com a coluna neutra.', 'Eleve o braço direito acima da cabeça.', 'Incline devagar o tronco para a esquerda, mantendo o quadril parado.', 'Sustente o alongamento pelo tempo indicado, sentindo a lateral do corpo.', 'Volte ao início e repita do outro lado.']::text[],
  breathing = 'Expire ao inclinar e inspire ao voltar à posição ereta.',
  common_mistakes = array['Girar o tronco', 'Inclinar à frente ou para trás', 'Deixar o ombro cair']::text[],
  instructions = 'Fique em pé ou sente-se ereto, com a coluna neutra.
Eleve o braço direito acima da cabeça.
Incline devagar o tronco para a esquerda, mantendo o quadril parado.
Sustente o alongamento pelo tempo indicado, sentindo a lateral do corpo.
Volte ao início e repita do outro lado.',
  content_pt_ready = true
where slug = 'side-bend-stretch-drv-stretching-slopes-towards-stretch';

update public.exercises set
  description = 'Alongamento com rotação em pé, voltado aos oblíquos e aos músculos rotadores das costas.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Estenda os braços na altura dos ombros ou coloque as mãos no quadril.', 'Gire suavemente o tronco para um lado, sem mover o quadril.', 'Sustente o alongamento pelo tempo desejado.', 'Volte ao centro e repita do outro lado.']::text[],
  breathing = 'Expire ao girar e inspire ao voltar ao centro.',
  common_mistakes = array['Girar além do confortável', 'Deixar o quadril girar junto', 'Prender a respiração']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Estenda os braços na altura dos ombros ou coloque as mãos no quadril.
Gire suavemente o tronco para um lado, sem mover o quadril.
Sustente o alongamento pelo tempo desejado.
Volte ao centro e repita do outro lado.',
  content_pt_ready = true
where slug = 'standing-back-rotation-stretch-drv-stretching-standing-back-rotation-stretch';

update public.exercises set
  description = 'Alongamento lateral em pé para trabalhar os oblíquos e alongar a musculatura da lateral do tronco.',
  steps = array['Fique em pé com os pés na largura do quadril.', 'Eleve um braço acima da cabeça, mantendo-o estendido.', 'Coloque a outra mão no quadril ou deixe-a ao lado do corpo.', 'Incline suavemente para o lado oposto, mantendo o quadril alinhado.', 'Sustente, volte ao centro e repita do outro lado.']::text[],
  breathing = 'Inspire para se alongar e expire ao entrar no alongamento lateral.',
  common_mistakes = array['Girar o tronco', 'Inclinar à frente ou para trás', 'Não manter o braço estendido']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril.
Eleve um braço acima da cabeça, mantendo-o estendido.
Coloque a outra mão no quadril ou deixe-a ao lado do corpo.
Incline suavemente para o lado oposto, mantendo o quadril alinhado.
Sustente, volte ao centro e repita do outro lado.',
  content_pt_ready = true
where slug = 'standing-lateral-stretch-0794';

update public.exercises set
  description = 'Alongamento lateral em pé para trabalhar os oblíquos e o dorsal.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Eleve um braço acima da cabeça, flexionando o cotovelo de forma confortável.', 'Incline para o lado oposto ao braço elevado, alongando a lateral do tronco.', 'Sustente o alongamento de 15 a 30 segundos.', 'Troque de lado e repita.']::text[],
  breathing = 'Respire fundo durante todo o alongamento.',
  common_mistakes = array['Girar o tronco', 'Alongar além do confortável', 'Prender a respiração']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Eleve um braço acima da cabeça, flexionando o cotovelo de forma confortável.
Incline para o lado oposto ao braço elevado, alongando a lateral do tronco.
Sustente o alongamento de 15 a 30 segundos.
Troque de lado e repita.',
  content_pt_ready = true
where slug = 'standing-side-bend-stretch-bent-arm-drv-stretching-standing-side-bend-bent-arm';

update public.exercises set
  description = 'Mergulho nas barras paralelas com o peso do corpo, exercício composto voltado a peito, ombros e tríceps.',
  steps = array['Segure as barras paralelas e sustente o corpo para começar.', 'Incline o tronco à frente e flexione os cotovelos.', 'Desça até a parte de cima dos braços ficar paralela ao chão.', 'Faça uma pausa embaixo, sentindo o alongamento.', 'Empurre com as palmas para voltar ao início.']::text[],
  breathing = 'Inspire ao descer e expire ao subir.',
  common_mistakes = array['Ficar ereto demais, transferindo o foco para o tríceps', 'Descer além do necessário', 'Abrir demais os cotovelos']::text[],
  instructions = 'Segure as barras paralelas e sustente o corpo para começar.
Incline o tronco à frente e flexione os cotovelos.
Desça até a parte de cima dos braços ficar paralela ao chão.
Faça uma pausa embaixo, sentindo o alongamento.
Empurre com as palmas para voltar ao início.',
  content_pt_ready = true
where slug = 'chest-dips-drv-chest-dips';

update public.exercises set
  description = 'Crucifixo com elástico em que os braços descem em arco, partindo de cima da altura dos ombros, para isolar o peito.',
  steps = array['Prenda o elástico em um ponto acima da altura dos ombros.', 'Segure as alças e dê um passo à frente para criar tensão.', 'Comece com os braços abertos e elevados, alinhados com os ombros.', 'Leve os braços para baixo e um em direção ao outro, em um arco amplo.', 'Contraia o peito e volte devagar ao início.']::text[],
  breathing = 'Expire ao aproximar os braços e inspire ao voltar.',
  common_mistakes = array['Estender demais os cotovelos', 'Deixar os ombros encolherem', 'Perder a tensão no alto']::text[],
  instructions = 'Prenda o elástico em um ponto acima da altura dos ombros.
Segure as alças e dê um passo à frente para criar tensão.
Comece com os braços abertos e elevados, alinhados com os ombros.
Leve os braços para baixo e um em direção ao outro, em um arco amplo.
Contraia o peito e volte devagar ao início.',
  content_pt_ready = true
where slug = 'resistance-band-high-fly-drv-band-high-fly';

update public.exercises set
  description = 'Alongamento dinâmico com braços acima da cabeça e rotação, para abrir o peito e a parte alta das costas.',
  steps = array['Fique em pé com os pés na largura dos ombros.', 'Eleve os dois braços acima da cabeça.', 'Arqueie suavemente a parte alta das costas e o peito.', 'Gire o tronco para um lado mantendo o alongamento.', 'Volte ao centro e gire para o outro lado.']::text[],
  breathing = 'Inspire antes de estender os braços para cima e expire ao girar e alongar.',
  common_mistakes = array['Arquear demais a lombar', 'Não estender totalmente os braços', 'Girar de forma brusca']::text[],
  instructions = 'Fique em pé com os pés na largura dos ombros.
Eleve os dois braços acima da cabeça.
Arqueie suavemente a parte alta das costas e o peito.
Gire o tronco para um lado mantendo o alongamento.
Volte ao centro e gire para o outro lado.',
  content_pt_ready = true
where slug = 'standing-reach-up-back-rotation-stretch-drv-stretching-standing-reach-up-back-rotation-stretch';

update public.exercises set
  description = 'Exercício para a parte de trás do ombro e as costas altas, com elástico e tronco inclinado à frente.',
  steps = array['Pise no elástico com os pés na largura dos ombros.', 'Incline o tronco à frente a partir do quadril, mantendo as costas retas.', 'Segure o elástico com as duas mãos, deixando os braços pendidos.', 'Abra os braços para os lados até ficarem paralelos à linha dos ombros.', 'Desça os braços com controle.']::text[],
  breathing = 'Expire ao elevar os braços e inspire ao descê-los.',
  common_mistakes = array['Arredondar as costas', 'Encolher os ombros', 'Usar o impulso']::text[],
  instructions = 'Pise no elástico com os pés na largura dos ombros.
Incline o tronco à frente a partir do quadril, mantendo as costas retas.
Segure o elástico com as duas mãos, deixando os braços pendidos.
Abra os braços para os lados até ficarem paralelos à linha dos ombros.
Desça os braços com controle.',
  content_pt_ready = true
where slug = 'band-bent-over-rear-lateral-raise-drv-band-bent-over-rear-lateral-raise';

update public.exercises set
  description = 'Alongamento voltado à parte de trás do ombro, para ganhar flexibilidade e reduzir a tensão.',
  steps = array['Estenda um braço à frente do peito, na altura do ombro.', 'Use a mão oposta para trazer o braço em direção ao corpo.', 'Sustente o alongamento de 20 a 30 segundos.', 'Solte e volte ao início.', 'Repita do outro lado.']::text[],
  breathing = 'Respire normalmente durante todo o alongamento.',
  common_mistakes = array['Elevar o ombro', 'Girar o tronco', 'Forçar o alongamento']::text[],
  instructions = 'Estenda um braço à frente do peito, na altura do ombro.
Use a mão oposta para trazer o braço em direção ao corpo.
Sustente o alongamento de 20 a 30 segundos.
Solte e volte ao início.
Repita do outro lado.',
  content_pt_ready = true
where slug = 'rear-deltoid-stretch-0669';

update public.exercises set
  description = 'Extensão de joelho sentado com elástico, para isolar e fortalecer o quadríceps.',
  steps = array['Sente-se ereto em uma cadeira firme, com os pés inteiros no chão.', 'Prenda uma extremidade do elástico atrás do pé da cadeira.', 'Passe a outra extremidade pelo tornozelo.', 'Eleve a parte de baixo da perna até estender totalmente o joelho.', 'Desça a perna com controle; repita e troque de perna.']::text[],
  breathing = 'Expire ao estender e inspire ao voltar.',
  common_mistakes = array['Balançar a perna', 'Deixar o joelho desviar ou girar', 'Arquear as costas']::text[],
  instructions = 'Sente-se ereto em uma cadeira firme, com os pés inteiros no chão.
Prenda uma extremidade do elástico atrás do pé da cadeira.
Passe a outra extremidade pelo tornozelo.
Eleve a parte de baixo da perna até estender totalmente o joelho.
Desça a perna com controle; repita e troque de perna.',
  content_pt_ready = true
where slug = 'band-seated-leg-extension-0980';

update public.exercises set
  description = 'Alongamento de quadríceps em pé, para melhorar a flexibilidade da parte da frente da coxa.',
  steps = array['Fique em pé, equilibrando-se em um dos pés.', 'Flexione o outro joelho e alcance o pé para trás.', 'Puxe o calcanhar suavemente em direção ao glúteo, mantendo os joelhos juntos.', 'Mantenha o tronco ereto e o quadril nivelado.', 'Sustente o alongamento e depois troque de perna.']::text[],
  breathing = 'Expire ao puxar o calcanhar e inspire ao soltar.',
  common_mistakes = array['Afastar os joelhos', 'Inclinar o tronco à frente', 'Puxar o pé com força excessiva']::text[],
  instructions = 'Fique em pé, equilibrando-se em um dos pés.
Flexione o outro joelho e alcance o pé para trás.
Puxe o calcanhar suavemente em direção ao glúteo, mantendo os joelhos juntos.
Mantenha o tronco ereto e o quadril nivelado.
Sustente o alongamento e depois troque de perna.',
  content_pt_ready = true
where slug = 'standing-quadriceps-stretch-drv-stretching-quadriceps-stretch';

update public.exercises set
  description = 'Abdominal no banco declinado com resistência de elástico, para aumentar a tensão sobre o abdômen.',
  steps = array['Prenda o elástico com segurança atrás do banco declinado.', 'Deite-se no banco com os pés presos, segurando o elástico junto ao peito ou atrás do pescoço.', 'Contraia o abdômen e faça o abdominal, levando o tronco em direção aos joelhos.', 'Controle a descida até a posição inicial.', 'Repita pelo número de repetições desejado.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar o impulso', 'Deixar o elástico ficar frouxo', 'Prender os pés de forma inadequada']::text[],
  instructions = 'Prenda o elástico com segurança atrás do banco declinado.
Deite-se no banco com os pés presos, segurando o elástico junto ao peito ou atrás do pescoço.
Contraia o abdômen e faça o abdominal, levando o tronco em direção aos joelhos.
Controle a descida até a posição inicial.
Repita pelo número de repetições desejado.',
  content_pt_ready = true
where slug = 'band-resisted-decline-sit-up-drv-band-decline-sit-ups';

update public.exercises set
  description = 'Abdominal supra feito deitado em banco reto ou declinado, para isolar o abdômen.',
  steps = array['Deite-se no banco com os joelhos flexionados e os pés presos ou apoiados.', 'Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.', 'Contraia o abdômen e eleve os ombros em direção aos joelhos.', 'Contraia no alto e sustente brevemente.', 'Desça o tronco de volta ao banco de forma controlada.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Puxar o pescoço', 'Fazer as repetições com pressa', 'Subir alto demais']::text[],
  instructions = 'Deite-se no banco com os joelhos flexionados e os pés presos ou apoiados.
Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.
Contraia o abdômen e eleve os ombros em direção aos joelhos.
Contraia no alto e sustente brevemente.
Desça o tronco de volta ao banco de forma controlada.',
  content_pt_ready = true
where slug = 'bench-crunch-drv-crunch-on-bench';

update public.exercises set
  description = 'Abdominal que combina a elevação do tronco com rotação, para trabalhar também os oblíquos.',
  steps = array['Deite-se de costas, com os joelhos flexionados e os pés inteiros no chão.', 'Coloque as mãos atrás da cabeça, com os cotovelos abertos.', 'Contraia o abdômen e tire a cabeça, o pescoço e os ombros do colchonete.', 'Gire o tronco para um lado enquanto eleva.', 'Volte ao centro e desça; repita alternando o lado.']::text[],
  breathing = 'Expire ao subir e girar, inspire ao descer.',
  common_mistakes = array['Puxar o pescoço', 'Usar os braços para ajudar', 'Subir alto demais', 'Não contrair o abdômen']::text[],
  instructions = 'Deite-se de costas, com os joelhos flexionados e os pés inteiros no chão.
Coloque as mãos atrás da cabeça, com os cotovelos abertos.
Contraia o abdômen e tire a cabeça, o pescoço e os ombros do colchonete.
Gire o tronco para um lado enquanto eleva.
Volte ao centro e desça; repita alternando o lado.',
  content_pt_ready = true
where slug = 'chest-lift-with-rotation-drv-chest-lift-with-rotation';

update public.exercises set
  description = 'Abdominal supra básico feito no chão, para fortalecer o reto abdominal.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.', 'Coloque as mãos levemente atrás da cabeça ou cruzadas sobre o peito.', 'Contraia o abdômen e tire os ombros do chão.', 'Faça uma breve pausa no ponto mais alto do movimento.', 'Volte devagar à posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Puxar o pescoço', 'Não contrair o abdômen', 'Usar o impulso', 'Não respirar corretamente']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés na largura do quadril.
Coloque as mãos levemente atrás da cabeça ou cruzadas sobre o peito.
Contraia o abdômen e tire os ombros do chão.
Faça uma breve pausa no ponto mais alto do movimento.
Volte devagar à posição inicial.',
  content_pt_ready = true
where slug = 'floor-crunch-0274';

update public.exercises set
  description = 'Exercício de core do Pilates que eleva quadril e pernas para cima e além da cabeça, fortalecendo o abdômen.',
  steps = array['Deite-se de costas com os braços ao lado do corpo e as pernas estendidas.', 'Contraia o abdômen e eleve as pernas em direção ao teto.', 'Continue subindo até tirar o quadril do colchonete, alongando os pés para cima.', 'Faça uma pausa no alto, com o quadril elevado.', 'Desça devagar, enrolando a coluna vértebra por vértebra.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Deixar as pernas caírem rápido demais', 'Arquear demais as costas', 'Empurrar com os braços']::text[],
  instructions = 'Deite-se de costas com os braços ao lado do corpo e as pernas estendidas.
Contraia o abdômen e eleve as pernas em direção ao teto.
Continue subindo até tirar o quadril do colchonete, alongando os pés para cima.
Faça uma pausa no alto, com o quadril elevado.
Desça devagar, enrolando a coluna vértebra por vértebra.',
  content_pt_ready = true
where slug = 'jackknife-drv-jackknife-pilates';

update public.exercises set
  description = 'Abdominal dinâmico em que pernas e tronco sobem ao mesmo tempo, formando um V.',
  steps = array['Deite-se com os braços estendidos acima da cabeça e as pernas estendidas.', 'Contraia o abdômen e leve braços e pernas um em direção ao outro.', 'Alcance os pés com as mãos, formando um V no alto.', 'Faça uma breve pausa no alto, contraindo o abdômen.', 'Desça devagar até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Flexionar demais joelhos ou cotovelos', 'Subir no impulso', 'Deixar a lombar arquear']::text[],
  instructions = 'Deite-se com os braços estendidos acima da cabeça e as pernas estendidas.
Contraia o abdômen e leve braços e pernas um em direção ao outro.
Alcance os pés com as mãos, formando um V no alto.
Faça uma breve pausa no alto, contraindo o abdômen.
Desça devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'jackknife-floor-0981';

update public.exercises set
  description = 'Variação de abdominal canivete que combina a subida em V com a abertura das pernas, trabalhando abdômen e flexores do quadril.',
  steps = array['Deite-se de costas com os braços estendidos acima da cabeça e as pernas estendidas.', 'Contraia o abdômen e tire tronco e pernas do chão ao mesmo tempo.', 'Ao subir, afaste as pernas em tesoura enquanto alcança os pés com as mãos.', 'Faça uma pausa no alto, contraindo o abdômen.', 'Desça pernas e tronco com controle, juntando os pés.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Balançar as pernas', 'Usar o impulso', 'Arquear a lombar']::text[],
  instructions = 'Deite-se de costas com os braços estendidos acima da cabeça e as pernas estendidas.
Contraia o abdômen e tire tronco e pernas do chão ao mesmo tempo.
Ao subir, afaste as pernas em tesoura enquanto alcança os pés com as mãos.
Faça uma pausa no alto, contraindo o abdômen.
Desça pernas e tronco com controle, juntando os pés.',
  content_pt_ready = true
where slug = 'jackknife-split-crunch-drv-jack-split-crunches';

update public.exercises set
  description = 'Abdominal que combina a elevação do tronco com a das pernas, enfatizando as porções superior e inferior do abdômen.',
  steps = array['Deite-se de costas e estenda as pernas.', 'Coloque as mãos ao lado do corpo ou atrás da cabeça.', 'Eleve pernas e tronco ao mesmo tempo, aproximando um do outro.', 'Contraia no ponto mais alto do movimento.', 'Desça pernas e tronco com controle.']::text[],
  breathing = 'Expire durante a subida e inspire ao voltar.',
  common_mistakes = array['Arquear a lombar', 'Usar o impulso', 'Tensionar o pescoço ao puxar com as mãos']::text[],
  instructions = 'Deite-se de costas e estenda as pernas.
Coloque as mãos ao lado do corpo ou atrás da cabeça.
Eleve pernas e tronco ao mesmo tempo, aproximando um do outro.
Contraia no ponto mais alto do movimento.
Desça pernas e tronco com controle.',
  content_pt_ready = true
where slug = 'leg-raise-crunch-0600';

update public.exercises set
  description = 'Exercício de core que combina elevação de pernas com elevação do quadril, voltado à parte inferior do abdômen.',
  steps = array['Deite-se com os braços ao lado do corpo e as pernas estendidas.', 'Eleve as duas pernas juntas em direção ao teto.', 'No ponto mais alto, empurre as pernas para cima tirando o quadril do chão.', 'Faça uma pausa, contraindo o abdômen.', 'Desça quadril e pernas devagar até a posição inicial.']::text[],
  breathing = 'Expire ao elevar o quadril e inspire durante a descida.',
  common_mistakes = array['Usar o impulso', 'Arquear a lombar', 'Não controlar a descida']::text[],
  instructions = 'Deite-se com os braços ao lado do corpo e as pernas estendidas.
Eleve as duas pernas juntas em direção ao teto.
No ponto mais alto, empurre as pernas para cima tirando o quadril do chão.
Faça uma pausa, contraindo o abdômen.
Desça quadril e pernas devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'leg-raise-with-hip-lift-drv-leg-raise-hip-lift';

update public.exercises set
  description = 'Abdominal sentado em máquina, que isola e fortalece o abdômen por meio da flexão da coluna.',
  steps = array['Ajuste o assento e selecione uma resistência adequada.', 'Sente-se recostado e prenda os pés e as alças conforme o desenho da máquina.', 'Contraia o abdômen e flexione a coluna à frente, em movimento de abdominal.', 'Leve o peito em direção aos joelhos enquanto expira.', 'Controle a volta ao início e repita.']::text[],
  breathing = 'Expire ao descer no abdominal e inspire ao voltar.',
  common_mistakes = array['Deixar os flexores do quadril dominarem o movimento', 'Usar carga excessiva', 'Fazer as repetições com pressa', 'Amplitude parcial']::text[],
  instructions = 'Ajuste o assento e selecione uma resistência adequada.
Sente-se recostado e prenda os pés e as alças conforme o desenho da máquina.
Contraia o abdômen e flexione a coluna à frente, em movimento de abdominal.
Leve o peito em direção aos joelhos enquanto expira.
Controle a volta ao início e repita.',
  content_pt_ready = true
where slug = 'lever-seated-crunch-1452';

update public.exercises set
  description = 'Exercício com o peso do corpo que trabalha a parte inferior do abdômen elevando as pernas deitado.',
  steps = array['Deite-se de costas com as pernas estendidas.', 'Mantenha os braços ao lado do corpo ou sob o quadril.', 'Eleve as pernas mantendo os joelhos estendidos.', 'Suba as pernas até o quadril sair levemente do chão.', 'Desça as pernas devagar, sem tocar o chão.']::text[],
  breathing = 'Expire ao elevar as pernas e inspire ao descê-las.',
  common_mistakes = array['Arquear a lombar', 'Usar o impulso', 'Tocar os pés no chão entre as repetições']::text[],
  instructions = 'Deite-se de costas com as pernas estendidas.
Mantenha os braços ao lado do corpo ou sob o quadril.
Eleve as pernas mantendo os joelhos estendidos.
Suba as pernas até o quadril sair levemente do chão.
Desça as pernas devagar, sem tocar o chão.',
  content_pt_ready = true
where slug = 'lying-leg-raise-0865';

update public.exercises set
  description = 'Exercício dinâmico de core que combina abdominal com arremesso e recepção de bola medicinal na parede.',
  steps = array['Sente-se no chão de frente para a parede, com os joelhos flexionados.', 'Segure a bola medicinal junto ao peito.', 'Deite-se para trás e depois faça o abdominal.', 'No alto, arremesse a bola contra a parede.', 'Recepcione o retorno da bola e desça novamente.']::text[],
  breathing = 'Expire ao subir e arremessar, inspire ao descer.',
  common_mistakes = array['Descer o tronco além do necessário', 'Usar os braços em vez do core', 'Errar a recepção da bola']::text[],
  instructions = 'Sente-se no chão de frente para a parede, com os joelhos flexionados.
Segure a bola medicinal junto ao peito.
Deite-se para trás e depois faça o abdominal.
No alto, arremesse a bola contra a parede.
Recepcione o retorno da bola e desça novamente.',
  content_pt_ready = true
where slug = 'medicine-ball-wall-sit-up-0640';

update public.exercises set
  description = 'Variação de abdominal segurando um peso com os braços estendidos acima do corpo, para aumentar a exigência sobre o abdômen.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés presos.', 'Segure o peso com as duas mãos, com os braços totalmente estendidos acima do peito.', 'Contraia o abdômen e sente-se, mantendo os braços estendidos e o peso acima da cabeça.', 'Chegue à posição sentada, com o tronco ereto.', 'Desça com controle, mantendo os braços estendidos.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Flexionar os braços', 'Deixar o peso cair à frente', 'Usar o impulso para subir']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés presos.
Segure o peso com as duas mãos, com os braços totalmente estendidos acima do peito.
Contraia o abdômen e sente-se, mantendo os braços estendidos e o peso acima da cabeça.
Chegue à posição sentada, com o tronco ereto.
Desça com controle, mantendo os braços estendidos.',
  content_pt_ready = true
where slug = 'otis-up-drv-otis-ups';

update public.exercises set
  description = 'Abdominal clássico que leva o tronco do chão até a posição sentada, para desenvolver força no core.',
  steps = array['Deite-se de costas com os joelhos flexionados e os pés presos.', 'Coloque as mãos atrás da cabeça ou sobre o peito.', 'Contraia o abdômen para levar o tronco até a posição sentada.', 'Faça uma pausa no alto e desça devagar até o chão.', 'Repita pelo número de repetições desejado.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Dar trancos com o pescoço', 'Usar o impulso', 'Tirar os pés do chão']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados e os pés presos.
Coloque as mãos atrás da cabeça ou sobre o peito.
Contraia o abdômen para levar o tronco até a posição sentada.
Faça uma pausa no alto e desça devagar até o chão.
Repita pelo número de repetições desejado.',
  content_pt_ready = true
where slug = 'sit-up-drv-sit-ups';

update public.exercises set
  description = 'Abdominal clássico que eleva o tronco a partir da posição deitado.',
  steps = array['Deite-se com os joelhos flexionados e os pés inteiros no chão.', 'Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.', 'Contraia o abdômen e eleve o tronco em direção aos joelhos.', 'Faça uma breve pausa no alto.', 'Desça devagar até a posição inicial.']::text[],
  breathing = 'Expire na subida e inspire na descida.',
  common_mistakes = array['Puxar o pescoço', 'Arquear a lombar', 'Usar o impulso']::text[],
  instructions = 'Deite-se com os joelhos flexionados e os pés inteiros no chão.
Cruze os braços sobre o peito ou coloque as mãos atrás da cabeça.
Contraia o abdômen e eleve o tronco em direção aos joelhos.
Faça uma breve pausa no alto.
Desça devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'sit-up-rectus-abdominis';

update public.exercises set
  description = 'Variação de abdominal com as pernas apoiadas na bola suíça, que aumenta a exigência sobre o core e a instabilidade.',
  steps = array['Coloque a bola suíça à sua frente e sente-se.', 'Deite-se para trás e apoie panturrilhas e pés sobre a bola, com os joelhos flexionados.', 'Coloque as mãos levemente atrás da cabeça ou cruzadas sobre o peito.', 'Contraia o abdômen e enrole a parte de cima do corpo em direção aos joelhos.', 'Faça uma breve pausa no alto e desça sem perder o controle.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Usar impulso em vez da musculatura', 'Tensionar o pescoço', 'Deixar a bola rolar para longe', 'Arquear a lombar']::text[],
  instructions = 'Coloque a bola suíça à sua frente e sente-se.
Deite-se para trás e apoie panturrilhas e pés sobre a bola, com os joelhos flexionados.
Coloque as mãos levemente atrás da cabeça ou cruzadas sobre o peito.
Contraia o abdômen e enrole a parte de cima do corpo em direção aos joelhos.
Faça uma breve pausa no alto e desça sem perder o controle.',
  content_pt_ready = true
where slug = 'stability-ball-leg-elevated-crunch-0271';

update public.exercises set
  description = 'Variação de abdominal com as pernas estendidas na vertical, que desafia a parte superior do abdômen.',
  steps = array['Deite-se de costas com as pernas estendidas para cima e os pés flexionados.', 'Deixe os braços ao lado do corpo ou as mãos atrás da cabeça.', 'Contraia o abdômen e leve cabeça e ombros em direção às pernas.', 'Faça uma pausa no alto, expirando.', 'Desça com controle.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Subir com trancos', 'Usar o impulso', 'Abrir demais os cotovelos']::text[],
  instructions = 'Deite-se de costas com as pernas estendidas para cima e os pés flexionados.
Deixe os braços ao lado do corpo ou as mãos atrás da cabeça.
Contraia o abdômen e leve cabeça e ombros em direção às pernas.
Faça uma pausa no alto, expirando.
Desça com controle.',
  content_pt_ready = true
where slug = 'straight-leg-up-crunch-drv-crunch-straight-leg-up';

update public.exercises set
  description = 'Exercício dinâmico de core em que pernas e tronco sobem ao mesmo tempo até se encontrarem em V, ativando o abdômen.',
  steps = array['Deite-se de costas com os braços estendidos acima da cabeça e as pernas estendidas.', 'Contraia o abdômen para elevar pernas e tronco ao mesmo tempo.', 'Alcance os pés com as mãos no alto, formando um V.', 'Faça uma breve pausa, contraindo o abdômen.', 'Desça devagar até a posição inicial.']::text[],
  breathing = 'Expire ao subir e inspire ao descer.',
  common_mistakes = array['Balançar as pernas', 'Arquear a lombar', 'Não contrair totalmente o abdômen']::text[],
  instructions = 'Deite-se de costas com os braços estendidos acima da cabeça e as pernas estendidas.
Contraia o abdômen para elevar pernas e tronco ao mesmo tempo.
Alcance os pés com as mãos no alto, formando um V.
Faça uma breve pausa, contraindo o abdômen.
Desça devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'v-up-drv-v-up';

update public.exercises set
  description = 'Exercício de core que combina abdominal com extensão de pernas contra resistência, para trabalhar o abdômen.',
  steps = array['Deite-se de costas com os joelhos flexionados, segurando um peso sobre o peito.', 'Eleve as pernas até a posição de mesa (joelhos acima do quadril, flexionados a 90 graus).', 'Estenda as pernas à frente e suba o tronco ao mesmo tempo.', 'Faça uma breve pausa no ponto de maior contração.', 'Volte braços e pernas à posição inicial.']::text[],
  breathing = 'Expire ao subir e estender, inspire ao voltar.',
  common_mistakes = array['Usar o impulso', 'Deixar a lombar arquear', 'Prender a respiração']::text[],
  instructions = 'Deite-se de costas com os joelhos flexionados, segurando um peso sobre o peito.
Eleve as pernas até a posição de mesa (joelhos acima do quadril, flexionados a 90 graus).
Estenda as pernas à frente e suba o tronco ao mesmo tempo.
Faça uma breve pausa no ponto de maior contração.
Volte braços e pernas à posição inicial.',
  content_pt_ready = true
where slug = 'weighted-leg-extension-crunch-0832';

update public.exercises set
  description = 'Mergulho escapular com o peso do corpo e os braços estendidos, que treina o controle das escápulas e a depressão dos ombros em posição sustentada.',
  steps = array['Comece sustentando o corpo nas barras paralelas com os cotovelos travados e os ombros alinhados sobre as mãos.', 'Erga o peito e firme o tronco, mantendo as pernas paradas abaixo do corpo.', 'Desça alguns centímetros deixando os ombros subirem em direção às orelhas, sem flexionar os cotovelos.', 'Empurre as mãos para baixo para afastar os ombros das orelhas e subir o corpo novamente.', 'Repita com movimento lento e controlado dos ombros, mantendo os braços estendidos todo o tempo.']::text[],
  breathing = 'Inspire ao descer no encolhimento e expire ao empurrar para subir o corpo.',
  common_mistakes = array['Flexionar os cotovelos como em um mergulho comum', 'Balançar pernas ou tronco para criar impulso', 'Encolher os ombros e não empurrar de volta para baixo', 'Descer demais e perder o controle dos ombros']::text[],
  instructions = 'Comece sustentando o corpo nas barras paralelas com os cotovelos travados e os ombros alinhados sobre as mãos.
Erga o peito e firme o tronco, mantendo as pernas paradas abaixo do corpo.
Desça alguns centímetros deixando os ombros subirem em direção às orelhas, sem flexionar os cotovelos.
Empurre as mãos para baixo para afastar os ombros das orelhas e subir o corpo novamente.
Repita com movimento lento e controlado dos ombros, mantendo os braços estendidos todo o tempo.',
  content_pt_ready = true
where slug = 'scapula-dips-3012';

update public.exercises set
  description = 'Tríceps francês em pé com elástico, estendendo os cotovelos acima da cabeça e mantendo a parte de cima dos braços praticamente fixa.',
  steps = array['Pise no meio do elástico com os pés na largura do quadril e segure uma extremidade em cada mão.', 'Leve as mãos acima da cabeça e flexione os cotovelos, levando as mãos atrás da cabeça.', 'Mantenha a parte de cima dos braços próxima às orelhas e firme o abdômen.', 'Estenda os cotovelos para empurrar o elástico acima da cabeça até esticar totalmente os braços.', 'Faça uma breve pausa no alto e flexione os cotovelos devagar para voltar atrás da cabeça.', 'Repita sem deixar os cotovelos abrirem para os lados.']::text[],
  breathing = 'Inspire ao levar as mãos atrás da cabeça e expire ao estender os cotovelos acima da cabeça.',
  common_mistakes = array['Cotovelos abrindo para os lados', 'Lombar arqueando quando o elástico vai acima da cabeça', 'Parte de cima dos braços deslocando à frente e atrás', 'Fazer só parte do movimento em vez de estender totalmente']::text[],
  instructions = 'Pise no meio do elástico com os pés na largura do quadril e segure uma extremidade em cada mão.
Leve as mãos acima da cabeça e flexione os cotovelos, levando as mãos atrás da cabeça.
Mantenha a parte de cima dos braços próxima às orelhas e firme o abdômen.
Estenda os cotovelos para empurrar o elástico acima da cabeça até esticar totalmente os braços.
Faça uma breve pausa no alto e flexione os cotovelos devagar para voltar atrás da cabeça.
Repita sem deixar os cotovelos abrirem para os lados.',
  content_pt_ready = true
where slug = 'band-overhead-triceps-extension-new-band-overhead-triceps-extension';

update public.exercises set
  description = 'Tríceps pushdown com elástico preso acima, para estender os cotovelos contra a resistência.',
  steps = array['Prenda o elástico em um ponto alto e fique de frente para ele, com uma alça ou extremidade em cada mão.', 'Flexione os cotovelos a cerca de 90 graus e mantenha a parte de cima dos braços junto ao corpo.', 'Firme o tronco e empurre as mãos para baixo até estender totalmente os cotovelos.', 'Faça uma breve pausa embaixo e contraia o tríceps.', 'Deixe o elástico subir devagar até os antebraços voltarem à posição inicial.', 'Repita sem deixar os cotovelos avançarem ou abrirem.']::text[],
  breathing = 'Expire ao empurrar o elástico para baixo e inspire ao voltar ao início.',
  common_mistakes = array['Parte de cima dos braços balançando à frente e atrás', 'Cotovelos se afastando do tronco', 'Jogar o peso do corpo sobre o elástico', 'Parar antes de estender totalmente os cotovelos']::text[],
  instructions = 'Prenda o elástico em um ponto alto e fique de frente para ele, com uma alça ou extremidade em cada mão.
Flexione os cotovelos a cerca de 90 graus e mantenha a parte de cima dos braços junto ao corpo.
Firme o tronco e empurre as mãos para baixo até estender totalmente os cotovelos.
Faça uma breve pausa embaixo e contraia o tríceps.
Deixe o elástico subir devagar até os antebraços voltarem à posição inicial.
Repita sem deixar os cotovelos avançarem ou abrirem.',
  content_pt_ready = true
where slug = 'band-triceps-pushdown-new-band-triceps-pushdown';

update public.exercises set
  description = 'Supino com pegada fechada, voltado ao tríceps e que também trabalha peito e ombros.',
  steps = array['Deite-se no banco e segure a barra com pegada fechada.', 'Retire a barra do suporte e posicione-a acima da parte baixa do peito.', 'Desça a barra devagar, com os cotovelos junto ao corpo.', 'Toque brevemente o peito e empurre a barra até a posição inicial.', 'Repita pelo número de repetições previsto.']::text[],
  breathing = 'Expire ao empurrar para cima e inspire ao descer a barra.',
  common_mistakes = array['Pegada estreita ou larga demais', 'Cotovelos abrindo para os lados', 'Quicar a barra no peito']::text[],
  instructions = 'Deite-se no banco e segure a barra com pegada fechada.
Retire a barra do suporte e posicione-a acima da parte baixa do peito.
Desça a barra devagar, com os cotovelos junto ao corpo.
Toque brevemente o peito e empurre a barra até a posição inicial.
Repita pelo número de repetições previsto.',
  content_pt_ready = true
where slug = 'barbell-close-grip-bench-press-0030';

update public.exercises set
  description = 'Supino com halteres unidos, movimento de empurrar que enfatiza a ativação do tríceps.',
  steps = array['Deite-se no banco com um halter em cada mão.', 'Mantenha os halteres unidos acima do peito, com as palmas voltadas uma para a outra.', 'Desça os halteres em direção ao esterno, com os cotovelos junto ao tronco.', 'Faça uma pausa quando os cotovelos chegarem a 90 graus.', 'Empurre os halteres para cima estendendo os braços.']::text[],
  breathing = 'Inspire ao descer os halteres e expire ao empurrar para cima.',
  common_mistakes = array['Abrir os cotovelos para os lados', 'Deixar os halteres se afastarem um do outro', 'Arquear demais as costas', 'Descer os pesos além do necessário']::text[],
  instructions = 'Deite-se no banco com um halter em cada mão.
Mantenha os halteres unidos acima do peito, com as palmas voltadas uma para a outra.
Desça os halteres em direção ao esterno, com os cotovelos junto ao tronco.
Faça uma pausa quando os cotovelos chegarem a 90 graus.
Empurre os halteres para cima estendendo os braços.',
  content_pt_ready = true
where slug = 'dumbbell-close-grip-press-0296';

update public.exercises set
  description = 'Remada com barra e peito apoiado, feita de bruços no banco para trabalhar as costas altas praticamente sem usar impulso do corpo.',
  steps = array['Coloque a barra no chão sob a ponta de um banco reto e deite-se de bruços, com o peito apoiado e os braços pendidos.', 'Firme os pés no chão, contraia o abdômen e segure a barra com pegada por cima, um pouco mais aberta que a largura dos ombros.', 'Tire a barra do chão e deixe-a pendida exatamente abaixo dos ombros, com o pescoço neutro.', 'Puxe a barra em direção à parte de baixo do banco ou à parte baixa do peito, levando os cotovelos para trás.', 'Faça uma breve pausa no alto e aproxime as escápulas.', 'Desça a barra com controle até estender os braços e ela voltar a ficar logo acima do chão.']::text[],
  breathing = 'Inspire ao descer a barra e expire ao puxá-la em direção ao peito.',
  common_mistakes = array['Tirar o peito do banco para mover a barra', 'Encolher os ombros em direção às orelhas', 'Arrancar a barra do chão no impulso', 'Abrir os cotovelos totalmente para os lados']::text[],
  instructions = 'Coloque a barra no chão sob a ponta de um banco reto e deite-se de bruços, com o peito apoiado e os braços pendidos.
Firme os pés no chão, contraia o abdômen e segure a barra com pegada por cima, um pouco mais aberta que a largura dos ombros.
Tire a barra do chão e deixe-a pendida exatamente abaixo dos ombros, com o pescoço neutro.
Puxe a barra em direção à parte de baixo do banco ou à parte baixa do peito, levando os cotovelos para trás.
Faça uma breve pausa no alto e aproxime as escápulas.
Desça a barra com controle até estender os braços e ela voltar a ficar logo acima do chão.',
  content_pt_ready = true
where slug = 'cambered-bar-lying-row-0248';

update public.exercises set
  description = 'Remada curvada com halteres e rotação das palmas durante a puxada, para trabalhar costas altas, bíceps e antebraços.',
  steps = array['Fique em pé com os pés na largura do quadril, segurando um halter em cada mão, com os braços estendidos e as palmas voltadas uma para a outra.', 'Incline o tronco à frente a partir do quadril, flexione levemente os joelhos e mantenha as costas retas.', 'Deixe os halteres pendidos abaixo dos ombros e firme o abdômen.', 'Puxe os dois halteres em direção às costelas baixas, levando os cotovelos para trás.', 'Gire as palmas durante a subida até que fiquem mais voltadas para trás ou para fora no alto.', 'Faça uma pausa contraindo as costas altas e desça os halteres com controle, retornando as palmas à posição neutra.']::text[],
  breathing = 'Inspire embaixo, expire ao puxar e girar os halteres para cima e inspire ao descê-los.',
  common_mistakes = array['Arredondar a lombar ao inclinar o tronco', 'Ficar mais ereto para balançar os halteres', 'Encolher os ombros em direção às orelhas', 'Dobrar os punhos em vez de girar os antebraços']::text[],
  instructions = 'Fique em pé com os pés na largura do quadril, segurando um halter em cada mão, com os braços estendidos e as palmas voltadas uma para a outra.
Incline o tronco à frente a partir do quadril, flexione levemente os joelhos e mantenha as costas retas.
Deixe os halteres pendidos abaixo dos ombros e firme o abdômen.
Puxe os dois halteres em direção às costelas baixas, levando os cotovelos para trás.
Gire as palmas durante a subida até que fiquem mais voltadas para trás ou para fora no alto.
Faça uma pausa contraindo as costas altas e desça os halteres com controle, retornando as palmas à posição neutra.',
  content_pt_ready = true
where slug = 'dumbbell-palm-rotational-bent-over-row-1329';

update public.exercises set
  description = 'Remada em máquina com peito apoiado, que trabalha as costas altas puxando as alças de à frente em direção ao tronco.',
  steps = array['Ajuste o assento para que as alças fiquem mais ou menos na altura da parte alta do peito ao sentar.', 'Sente-se com o peito firme no apoio e os pés inteiros na plataforma.', 'Segure as alças com pegada por cima e estenda os braços sem tirar o peito do apoio.', 'Puxe as alças em direção às costelas altas, levando os cotovelos para baixo e para trás.', 'Aproxime as escápulas no fim da puxada.', 'Leve as alças à frente com controle até estender os braços novamente.']::text[],
  breathing = 'Expire ao puxar as alças em sua direção e inspire ao voltar à posição inicial.',
  common_mistakes = array['Encolher os ombros em direção às orelhas durante a puxada', 'Afastar o peito do apoio para mover a carga', 'Deixar as alças baterem à frente entre as repetições', 'Dobrar os punhos para trás em vez de mantê-los neutros']::text[],
  instructions = 'Ajuste o assento para que as alças fiquem mais ou menos na altura da parte alta do peito ao sentar.
Sente-se com o peito firme no apoio e os pés inteiros na plataforma.
Segure as alças com pegada por cima e estenda os braços sem tirar o peito do apoio.
Puxe as alças em direção às costelas altas, levando os cotovelos para baixo e para trás.
Aproxime as escápulas no fim da puxada.
Leve as alças à frente com controle até estender os braços novamente.',
  content_pt_ready = true
where slug = 'lever-high-row-0581';

update public.exercises set
  description = 'Remada em máquina articulada com peito apoiado e pegada por cima, para trabalhar costas altas, bíceps e antebraços.',
  steps = array['Ajuste o assento ou o apoio de peito para que as alças fiquem mais ou menos na altura do meio do peito ao estender os braços.', 'Apoie o peito com firmeza e deixe os pés inteiros na plataforma.', 'Segure as alças com pegada por cima e estenda os braços sem arredondar os ombros.', 'Puxe as alças em direção ao peito, levando os cotovelos para trás e levemente para fora.', 'Aproxime as escápulas no fim da puxada.', 'Desça as alças com controle até estender os braços novamente.']::text[],
  breathing = 'Expire ao puxar as alças em direção ao peito e inspire ao descê-las com controle.',
  common_mistakes = array['Encolher os ombros em direção às orelhas', 'Quicar o peito no apoio para mover as alças', 'Deixar a parte alta das costas arredondar no início', 'Arrancar a carga e deixá-la voltar rápido']::text[],
  instructions = 'Ajuste o assento ou o apoio de peito para que as alças fiquem mais ou menos na altura do meio do peito ao estender os braços.
Apoie o peito com firmeza e deixe os pés inteiros na plataforma.
Segure as alças com pegada por cima e estenda os braços sem arredondar os ombros.
Puxe as alças em direção ao peito, levando os cotovelos para trás e levemente para fora.
Aproxime as escápulas no fim da puxada.
Desça as alças com controle até estender os braços novamente.',
  content_pt_ready = true
where slug = 'lever-reverse-t-bar-row-1349';

update public.exercises set
  description = 'Remada na polia com pegada aberta, voltada às costas altas e à porção posterior do deltoide.',
  steps = array['Sente-se e apoie os pés na plataforma.', 'Segure a barra de pegada aberta com as duas mãos.', 'Mantenha o tronco ereto e os braços totalmente estendidos.', 'Puxe a barra em direção à parte alta do abdômen, contraindo as costas altas.', 'Solte devagar até a posição inicial.']::text[],
  breathing = 'Expire ao puxar e inspire ao estender os braços.',
  common_mistakes = array['Inclinar o tronco demais para trás', 'Deixar os cotovelos caírem', 'Arredondar as costas']::text[],
  instructions = 'Sente-se e apoie os pés na plataforma.
Segure a barra de pegada aberta com as duas mãos.
Mantenha o tronco ereto e os braços totalmente estendidos.
Puxe a barra em direção à parte alta do abdômen, contraindo as costas altas.
Solte devagar até a posição inicial.',
  content_pt_ready = true
where slug = 'seated-cable-row-wide-grip-0218';

commit;
