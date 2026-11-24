import { ASSETS } from './mockData';
import type {
  ChoiceQuestion,
  EmotionQuestion,
  Hint,
  Island,
  Level,
  PlayableEmotionId,
  Question,
} from '../types';

/* ------------------------------------------------------------------ */
/* Ayudas para escribir el contenido                                   */
/* ------------------------------------------------------------------ */

const FACE_ALT: Record<PlayableEmotionId, string> = {
  alegria: 'Una niña sonríe con los ojos cerrados y la boca muy abierta.',
  tristeza: 'Un niño con lágrimas en los ojos y la boca hacia abajo.',
  enojo: 'Un niño con las cejas juntas, la boca apretada y las mejillas rojas.',
  miedo: 'Una niña con los ojos muy abiertos y la boca abierta de susto.',
};

const face = (emotion: PlayableEmotionId) => ({
  image: `/assets/emotions/${emotion}.png`,
  alt: FACE_ALT[emotion],
});

const TICO_PENSANDO = { image: ASSETS.tico.lupa, alt: 'Tico observa con su lupa, pensando.' };
const TICO_CALMA = { image: ASSETS.tico.respirando, alt: 'Tico respira tranquilo con los ojos cerrados.' };
const TICO_FELIZ = { image: ASSETS.tico.saludando, alt: 'Tico saluda con una sonrisa.' };

type Media = { image: string; alt: string; kind?: 'scene' | 'portrait' };

const FACE_HINTS: Hint[] = [
  { kind: 'ojos', text: 'Sus ojos: ¿cómo están?' },
  { kind: 'boca', text: 'Su boca: ¿sube o baja?' },
];

const FEEL_HINTS: Hint[] = [
  { kind: 'corazon', text: '¿Cómo te sentirías tú si te pasara?' },
  { kind: 'idea', text: 'Piensa en lo que acaba de pasar.' },
];

function emotion(
  id: string,
  character: string,
  situation: string,
  correct: PlayableEmotionId,
  explanation: string,
  media: Media,
  hints: Hint[],
  prompt?: string,
): EmotionQuestion {
  return {
    kind: 'emotion',
    id,
    character,
    situation,
    correct,
    explanation,
    sceneImage: media.image,
    sceneAlt: media.alt,
    sceneKind: media.kind ?? 'portrait',
    hints,
    prompt,
  };
}

/**
 * Pregunta de texto. La respuesta correcta se escribe primero y luego se
 * reordena de forma fija (según el id) para que no esté siempre arriba.
 */
function choice(
  id: string,
  situation: string,
  prompt: string,
  answers: [right: string, wrong1: string, wrong2: string],
  explanation: string,
  media: Media,
  hints: Hint[],
): ChoiceQuestion {
  const shift = Array.from(id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % answers.length;
  const options = [...answers.slice(shift), ...answers.slice(0, shift)];
  return {
    kind: 'choice',
    id,
    situation,
    prompt,
    options,
    correct: (answers.length - shift) % answers.length,
    explanation,
    sceneImage: media.image,
    sceneAlt: media.alt,
    sceneKind: media.kind ?? 'portrait',
    hints,
  };
}

function level(island: number, number: number, title: string, questions: Question[]): Level {
  return { id: `${island}-${number}`, island, number, title, kind: 'questions', questions };
}

function breathingLevel(island: number, number: number, title: string): Level {
  return { id: `${island}-${number}`, island, number, title, kind: 'breathing', questions: [] };
}

/** «Gran repaso»: toma preguntas de los niveles anteriores de la isla, alternando. */
function reviewLevel(island: number, previous: Level[]): Level {
  const pools = previous.filter((l) => l.kind === 'questions').map((l) => l.questions);
  const picked: Question[] = [];
  for (let round = 0; picked.length < 4 && round < 4; round++) {
    for (const pool of pools) {
      if (pool[round] && picked.length < 4) picked.push({ ...pool[round], id: `repaso-${pool[round].id}` });
    }
  }
  return level(island, 5, 'Gran repaso', picked);
}

/* ------------------------------------------------------------------ */
/* Mundo 1 · Isla de los Rostros — reconozco emociones                 */
/* ------------------------------------------------------------------ */

const w1: Level[] = [
  level(1, 1, 'Alegría y tristeza', [
    emotion('1-1-martina', 'Martina', 'Martina ganó la carrera de ensacados en el recreo.', 'alegria',
      'Martina sonríe con toda la boca: está alegre porque ganó la carrera.', face('alegria'), FACE_HINTS),
    emotion('1-1-diego', 'Diego', 'El perrito de Diego se perdió en el parque.', 'tristeza',
      'Diego tiene lágrimas y la boca hacia abajo: está triste porque extraña a su perrito.', face('tristeza'), FACE_HINTS),
    emotion('1-1-ana', 'Ana', 'Ana va a la playa con toda su familia.', 'alegria',
      'Ana está alegre: compartir un paseo con su familia la hace feliz.', face('alegria'), FACE_HINTS),
  ]),
  level(1, 2, '¿Qué dice su carita?', [
    emotion('1-2-pablo', 'Pablo', 'Pablo tiene las cejas juntas y la boca apretada.', 'enojo',
      'Cejas juntas y boca apretada son señales de enojo.', face('enojo'), FACE_HINTS),
    emotion('1-2-lia', 'Lía', 'Lía abre mucho los ojos y la boca.', 'miedo',
      'Ojos muy abiertos y boca abierta son señales de miedo.', face('miedo'), FACE_HINTS),
    emotion('1-2-sami', 'Sami', 'Sami cierra los ojitos y su boca sube como una sonrisa.', 'alegria',
      'Ojos cerraditos y boca hacia arriba son señales de alegría.', face('alegria'), FACE_HINTS),
  ]),
  level(1, 3, '¿Cómo se siente Lucas?', [
    emotion('n3-valentina', 'Valentina', 'Valentina abrió su regalo y encontró el peluche que tanto quería.', 'alegria',
      'Valentina tiene los ojos cerraditos de risa y la boca hacia arriba: está alegre porque recibió el regalo que quería.',
      { image: '/assets/emotions/alegria.png', alt: 'Valentina sonríe con los ojos cerrados y la boca muy abierta.' },
      [{ kind: 'ojos', text: 'Sus ojos: ¿están cerraditos de risa?' }, { kind: 'boca', text: 'Su boca: ¿sube o baja?' }]),
    emotion('n3-lucas', 'Lucas', 'Lucas estaba en el parque y su helado se cayó al piso.', 'tristeza',
      'Lucas tiene lágrimas y la boca hacia abajo: está triste porque se le cayó su helado.',
      {
        image: ASSETS.characters.lucas,
        alt: 'Lucas, un niño con camiseta amarilla, mira con tristeza su helado de fresa caído en el piso del parque.',
        kind: 'scene',
      },
      [{ kind: 'ojos', text: 'Sus ojos: ¿ves lágrimas?' }, { kind: 'boca', text: 'Su boca: ¿sube o baja?' }]),
    emotion('n3-mateo', 'Mateo', 'Mateo construyó una torre muy alta y alguien la tumbó sin pedir permiso.', 'enojo',
      'Mateo junta las cejas y aprieta la boca: está enojado porque tumbaron su torre.',
      { image: '/assets/emotions/enojo.png', alt: 'Mateo frunce las cejas y aprieta la boca, con las mejillas rojas.' },
      [{ kind: 'cejas', text: 'Sus cejas: ¿están juntas y hacia abajo?' }, { kind: 'boca', text: 'Su boca: ¿está apretada?' }]),
    emotion('n3-camila', 'Camila', 'Camila escuchó un trueno muy fuerte en medio de la noche.', 'miedo',
      'Camila abre mucho los ojos y la boca: siente miedo por el ruido del trueno.',
      { image: '/assets/emotions/miedo.png', alt: 'Camila abre mucho los ojos y la boca, asustada.' },
      [{ kind: 'ojos', text: 'Sus ojos: ¿están muy abiertos?' }, { kind: 'boca', text: 'Su boca: ¿se abre de susto?' }]),
  ]),
  level(1, 4, 'Enojo y miedo', [
    emotion('1-4-tomas', 'Tomás', 'La hermanita de Tomás rayó el dibujo que él hizo para su mamá.', 'enojo',
      'Tomás está enojado porque arruinaron algo que hizo con cariño.', face('enojo'), FACE_HINTS),
    emotion('1-4-lucia', 'Lucía', 'Se fue la luz en la casa de Lucía y todo quedó oscuro.', 'miedo',
      'Lucía siente miedo porque de repente no puede ver nada.', face('miedo'), FACE_HINTS),
    emotion('1-4-nico', 'Nico', 'A Nico no lo dejaron jugar fútbol aunque esperó su turno.', 'enojo',
      'Nico está enojado porque no fue justo: él esperó su turno.', face('enojo'), FACE_HINTS),
  ]),
];
w1.push(reviewLevel(1, w1));

/* ------------------------------------------------------------------ */
/* Mundo 2 · Bosque de las Pistas — descubro por qué me siento así     */
/* ------------------------------------------------------------------ */

const CAUSE_HINTS: Hint[] = [
  { kind: 'idea', text: 'Busca algo que de verdad cause esa emoción.' },
  { kind: 'corazon', text: '¿Qué te haría sentir así a ti?' },
];
const BODY_HINTS: Hint[] = [
  { kind: 'corazon', text: 'Nuestro cuerpo también habla.' },
  { kind: 'idea', text: '¿Qué emoción hace que pase eso?' },
];

const w2: Level[] = [
  level(2, 1, '¿Qué pasó?', [
    choice('2-1-camila', 'Camila sale de la escuela con una sonrisa enorme.', '¿Qué crees que pasó?',
      ['Su abuelita vino a recogerla', 'Se le rompió la mochila', 'Perdió su lápiz favorito'],
      'Ver a alguien que queremos nos pone alegres.', face('alegria'), CAUSE_HINTS),
    choice('2-1-andres', 'Andrés tiene los ojos llorosos en el recreo.', '¿Qué crees que pasó?',
      ['Su mejor amigo se cambió de escuela', 'Ganó un premio de dibujo', 'Comió su postre favorito'],
      'Despedirnos de un amigo puede ponernos tristes.', face('tristeza'), CAUSE_HINTS),
    choice('2-1-mateo', 'Mateo cruza los brazos y frunce las cejas.', '¿Qué crees que pasó?',
      ['Alguien tomó su juguete sin pedirlo', 'Le dieron un abrazo', 'Vio un arcoíris'],
      'Cuando toman nuestras cosas sin permiso, podemos sentir enojo.', face('enojo'), CAUSE_HINTS),
  ]),
  level(2, 2, 'Pistas del cuerpo', [
    choice('2-2-lucia', 'A Lucía le tiemblan las manos y el corazón le late muy rápido antes de salir al escenario.',
      '¿Qué está sintiendo Lucía?', ['Nervios o miedo', 'Mucho sueño', 'Aburrimiento'],
      'Manos temblorosas y corazón rápido son pistas de nervios o miedo.', face('miedo'), BODY_HINTS),
    choice('2-2-pedro', 'Pedro aprieta los puños y siente calor en la cara.',
      '¿Qué está sintiendo Pedro?', ['Enojo', 'Alegría', 'Calma'],
      'Puños apretados y calor en la cara son pistas de enojo.', face('enojo'), BODY_HINTS),
    choice('2-2-ana', 'Ana salta y no puede dejar de sonreír.',
      '¿Qué está sintiendo Ana?', ['Alegría', 'Tristeza', 'Miedo'],
      'Saltar y sonreír mucho son pistas de alegría.', face('alegria'), BODY_HINTS),
  ]),
  level(2, 3, 'Lo que pasa antes', [
    emotion('2-3-ines', 'Inés', 'El gatito de Inés se durmió en sus piernas toda la tarde.', 'alegria',
      'Un momento tierno con su mascota pone alegre a Inés.', TICO_PENSANDO, FEEL_HINTS),
    emotion('2-3-joaquin', 'Joaquín', 'A Joaquín le dijeron que se canceló el paseo que esperaba.', 'tristeza',
      'Cuando algo que esperamos no pasa, podemos sentir tristeza.', TICO_PENSANDO, FEEL_HINTS),
    emotion('2-3-lia', 'Lía', 'Lía escuchó un ruido extraño debajo de su cama.', 'miedo',
      'Un ruido que no conocemos puede darnos miedo.', TICO_PENSANDO, FEEL_HINTS),
  ]),
  level(2, 4, 'Una emoción, muchas causas', [
    choice('2-4-miedo', 'Tico está pensando en el miedo.', '¿Cuál de estas cosas podría darte miedo?',
      ['Una tormenta con muchos truenos', 'Una fiesta de cumpleaños', 'Un helado de chocolate'],
      'Los truenos fuertes pueden asustarnos. ¡Es normal sentir miedo!', face('miedo'), CAUSE_HINTS),
    choice('2-4-alegria', 'Tico está pensando en la alegría.', '¿Cuál de estas cosas podría ponerte alegre?',
      ['Jugar con tus amigos', 'Perder tu juguete', 'Caerte de la bici'],
      'Jugar con amigos nos llena de alegría.', face('alegria'), CAUSE_HINTS),
    choice('2-4-tristeza', 'Tico está pensando en la tristeza.', '¿Cuál de estas cosas podría ponerte triste?',
      ['Despedirte de alguien que quieres', 'Ver tu caricatura favorita', 'Ganar un juego'],
      'Despedirnos de quien queremos puede ponernos tristes.', face('tristeza'), CAUSE_HINTS),
  ]),
];
w2.push(reviewLevel(2, w2));

/* ------------------------------------------------------------------ */
/* Mundo 3 · Valle de las Voces — expreso lo que siento                */
/* ------------------------------------------------------------------ */

const SAY_HINTS: Hint[] = [
  { kind: 'idea', text: 'Busca la forma de decirlo con palabras.' },
  { kind: 'corazon', text: '¿Qué respuesta cuida a todos?' },
];

const w3: Level[] = [
  level(3, 1, 'Pongo nombre a lo que siento', [
    choice('3-1-mateo', 'Mateo está enojado porque su hermano tomó su carrito.', '¿Cómo puede decir lo que siente?',
      ['«Me enoja que tomes mi carrito sin pedirlo»', 'Gritar y lanzar el carrito', 'Empujar a su hermano'],
      'Decir lo que sentimos con palabras ayuda a que nos entiendan.', face('enojo'), SAY_HINTS),
    choice('3-1-andres', 'Andrés está triste porque no lo invitaron a jugar.', '¿Cómo puede decir lo que siente?',
      ['«Me siento triste, ¿puedo jugar con ustedes?»', 'Esconderse y no hablar con nadie', 'Decir «¡no me importan!»'],
      'Contar que estamos tristes y pedir lo que necesitamos es muy valiente.', face('tristeza'), SAY_HINTS),
    choice('3-1-lucia', 'Lucía tiene miedo de la oscuridad.', '¿Cómo puede decir lo que siente?',
      ['«Tengo miedo, ¿puedes dejar una lucecita?»', 'Quedarse callada toda la noche', 'Llorar sin decir por qué'],
      'Cuando decimos qué nos da miedo, otros pueden ayudarnos.', face('miedo'), SAY_HINTS),
  ]),
  level(3, 2, 'Con calma y respeto', [
    choice('3-2-lapiz', 'Tu amiga no te devuelve tu lápiz.', '¿Qué puedes decir?',
      ['«¿Me devuelves mi lápiz, por favor?»', 'Quitárselo de la mano', 'Gritarle muy fuerte'],
      'Pedir las cosas con calma y «por favor» funciona mejor.', TICO_FELIZ, SAY_HINTS),
    choice('3-2-fila', 'Alguien se coló en la fila del bar.', '¿Qué puedes decir?',
      ['«Disculpa, yo estaba primero»', 'Empujarlo', 'Hacerle una mueca'],
      'Podemos defender nuestro turno con respeto.', TICO_FELIZ, SAY_HINTS),
    choice('3-2-ruido', 'Tu hermano hace mucho ruido mientras haces la tarea.', '¿Qué puedes decir?',
      ['«¿Puedes bajar el volumen? Necesito concentrarme»', 'Lanzarle un cojín', 'Encerrarte llorando'],
      'Explicar lo que necesitas ayuda a los demás a entenderte.', TICO_FELIZ, SAY_HINTS),
  ]),
  level(3, 3, '¿A quién se lo cuento?', [
    choice('3-3-recreo', 'Un niño grande te molesta en el recreo.', '¿Qué es lo mejor que puedes hacer?',
      ['Contárselo a tu profe o a un adulto de confianza', 'Guardarlo en secreto', 'Molestar a alguien más'],
      'Los adultos de confianza están para ayudarte. Contarlo es valiente.', face('miedo'), SAY_HINTS),
    choice('3-3-dias', 'Te sientes triste varios días seguidos.', '¿Qué es lo mejor que puedes hacer?',
      ['Hablar con mamá, papá o quien te cuida', 'No contarle a nadie', 'Pensar que no importa'],
      'Lo que sientes importa. Hablarlo con alguien que te quiere ayuda mucho.', face('tristeza'), SAY_HINTS),
    choice('3-3-pesadilla', 'Tuviste una pesadilla en la noche.', '¿Qué es lo mejor que puedes hacer?',
      ['Contársela a un adulto que te dé un abrazo', 'Quedarte despierto toda la noche', 'Esconderte debajo de la cama'],
      'Un abrazo y una conversación ayudan a que el miedo pase.', face('miedo'), SAY_HINTS),
  ]),
  level(3, 4, 'Mis palabras de emociones', [
    choice('3-4-emi', 'Emi va a cantar frente a toda la escuela y le sudan las manos.', '¿Qué palabra describe lo que siente Emi?',
      ['Nerviosa', 'Aburrida', 'Dormida'],
      '«Nerviosa» es una palabra para cuando algo nos da un poquito de miedo.', TICO_PENSANDO, SAY_HINTS),
    choice('3-4-leo', 'Leo terminó él solito un rompecabezas de cien piezas.', '¿Qué palabra describe lo que siente Leo?',
      ['Orgulloso', 'Asustado', 'Enfermo'],
      '«Orgulloso» es lo que sentimos cuando logramos algo difícil.', TICO_PENSANDO, SAY_HINTS),
    choice('3-4-juan', 'Juan no sabe si su amigo sigue enojado con él.', '¿Qué palabra describe lo que siente Juan?',
      ['Preocupado', 'Feliz', 'Con hambre'],
      '«Preocupado» es lo que sentimos cuando no sabemos qué va a pasar.', TICO_PENSANDO, SAY_HINTS),
  ]),
];
w3.push(reviewLevel(3, w3));

/* ------------------------------------------------------------------ */
/* Mundo 4 · Laguna de la Calma — aprendo a calmarme                   */
/* ------------------------------------------------------------------ */

const CALM_HINTS: Hint[] = [
  { kind: 'idea', text: '¿Qué opción ayuda a que el cuerpo se calme?' },
  { kind: 'corazon', text: 'Busca algo que no lastime a nadie.' },
];

const w4: Level[] = [
  level(4, 1, 'Señales de alerta', [
    choice('4-1-pedro', 'Cuando Pedro se enoja, siente calor en la cara.', '¿Qué puede hacer primero?',
      ['Parar y respirar profundo', 'Gritar más fuerte', 'Romper algo'],
      'Parar y respirar le da tiempo al cuerpo para calmarse.', face('enojo'), CALM_HINTS),
    choice('4-1-lucia', 'A Lucía le late rápido el corazón antes de una prueba.', '¿Qué puede hacer primero?',
      ['Respirar despacito y contar hasta cinco', 'Salir corriendo', 'Decir que está enferma'],
      'Respirar despacio y contar ayuda a que el corazón se tranquilice.', face('miedo'), CALM_HINTS),
    choice('4-1-mateo', 'Mateo siente que va a llorar de rabia.', '¿Qué puede hacer primero?',
      ['Pedir un momento para calmarse', 'Patear la puerta', 'Dejar de hablarle a todos'],
      'Pedir un momento es una forma valiente de cuidarse.', face('enojo'), CALM_HINTS),
  ]),
  breathingLevel(4, 2, 'Respira con Tico'),
  level(4, 3, 'Mi caja de calma', [
    choice('4-3-juego', 'Te sientes muy enojado después de perder un juego.', '¿Qué te puede ayudar a calmarte?',
      ['Abrazar tu peluche y respirar', 'Lanzar las fichas del juego', 'Decir que hicieron trampa'],
      'Abrazar algo suave y respirar ayuda a que el enojo baje.', TICO_CALMA, CALM_HINTS),
    choice('4-3-dormir', 'Estás nervioso antes de dormir.', '¿Qué te puede ayudar a calmarte?',
      ['Escuchar música suave', 'Ver videos de miedo', 'Comer muchos dulces'],
      'La música suave relaja el cuerpo y la mente.', TICO_CALMA, CALM_HINTS),
    choice('4-3-lluvia', 'Estás triste porque llueve y no puedes salir a jugar.', '¿Qué te puede ayudar a sentirte mejor?',
      ['Dibujar algo que te guste', 'Quejarte todo el día', 'Pelear con tu hermano'],
      'Hacer algo que nos gusta nos ayuda a sentirnos mejor.', TICO_CALMA, CALM_HINTS),
  ]),
  breathingLevel(4, 4, 'Calma profunda'),
];
w4.push(reviewLevel(4, w4));

/* ------------------------------------------------------------------ */
/* Mundo 5 · Islas de los Amigos — entiendo a los demás                */
/* ------------------------------------------------------------------ */

const FRIEND_HINTS: Hint[] = [
  { kind: 'corazon', text: 'Imagina cómo se siente tu amigo.' },
  { kind: 'idea', text: '¿Qué te gustaría que hicieran por ti?' },
];

const w5: Level[] = [
  level(5, 1, '¿Cómo se siente mi amigo?', [
    emotion('5-1-valentina', 'Valentina', 'Tu amiga Valentina se ríe mucho con el chiste que contaste.', 'alegria',
      'Valentina está alegre: ¡tu chiste le encantó!', face('alegria'), FACE_HINTS),
    emotion('5-1-diego', 'Diego', 'Tu amigo Diego no quiere hablar y tiene lágrimas.', 'tristeza',
      'Diego está triste. Tal vez necesita que alguien lo acompañe.', face('tristeza'), FACE_HINTS),
    emotion('5-1-camila', 'Camila', 'Camila se tapa los oídos cuando suenan los fuegos artificiales.', 'miedo',
      'Camila siente miedo por el ruido fuerte.', face('miedo'), FACE_HINTS),
  ]),
  level(5, 2, 'Una mano amiga', [
    choice('5-2-joaquin', 'Joaquín se cayó y se raspó la rodilla.', '¿Cómo puedes ayudarlo?',
      ['Preguntarle si está bien y llamar a un adulto', 'Reírte', 'Seguir jugando sin mirarlo'],
      'Preguntar y buscar ayuda es lo que hace un buen amigo.', face('tristeza'), FRIEND_HINTS),
    choice('5-2-nuevo', 'Un compañero nuevo está solito en el recreo.', '¿Cómo puedes ayudarlo?',
      ['Invitarlo a jugar con ustedes', 'Ignorarlo', 'Decirle que se vaya'],
      'Invitar a alguien a jugar puede alegrarle el día.', TICO_FELIZ, FRIEND_HINTS),
    choice('5-2-juguete', 'A tu amiga se le rompió su juguete favorito.', '¿Cómo puedes ayudarla?',
      ['Darle un abrazo y ayudarla a arreglarlo', 'Decirle que no llore por eso', 'Burlarte de ella'],
      'Acompañar y ayudar hace sentir mejor a nuestros amigos.', face('tristeza'), FRIEND_HINTS),
  ]),
  level(5, 3, 'Ponerme en sus zapatos', [
    emotion('5-3-mateo', 'Mateo', 'Nadie le dijo «feliz cumpleaños» a Mateo en la escuela.', 'tristeza',
      'Mateo se siente triste porque pensó que nadie se acordó de él.', TICO_PENSANDO, FEEL_HINTS),
    emotion('5-3-ana', 'Ana', 'Ana ganó el concurso de dibujo de su grado.', 'alegria',
      'Ana está alegre y orgullosa por su dibujo.', TICO_PENSANDO, FEEL_HINTS),
    emotion('5-3-pablo', 'Pablo', 'Alguien pateó a propósito el castillo de arena de Pablo.', 'enojo',
      'Pablo está enojado porque dañaron su castillo a propósito.', TICO_PENSANDO, FEEL_HINTS),
  ]),
  level(5, 4, 'Resolvemos juntos', [
    choice('5-4-columpio', 'Dos amigos quieren usar el mismo columpio.', '¿Cuál es la mejor solución?',
      ['Turnarse: primero uno y luego el otro', 'Empujarse para ganar', 'Llorar hasta que el otro se vaya'],
      'Turnarse es justo y todos pueden jugar.', TICO_FELIZ, FRIEND_HINTS),
    choice('5-4-juegos', 'Tu amigo y tú quieren jugar a cosas distintas.', '¿Cuál es la mejor solución?',
      ['Jugar un rato a cada cosa', 'Irte enojado', 'Obligarlo a jugar lo tuyo'],
      'Ponerse de acuerdo hace que los dos se diviertan.', TICO_FELIZ, FRIEND_HINTS),
    choice('5-4-mochila', 'Sin querer, pisaste la mochila de una compañera.', '¿Cuál es la mejor solución?',
      ['Pedir perdón y ayudarla a limpiarla', 'Hacer como que no pasó', 'Echarle la culpa a otro'],
      'Pedir perdón y ayudar repara lo que pasó.', TICO_FELIZ, FRIEND_HINTS),
  ]),
];
w5.push(reviewLevel(5, w5));

/* ------------------------------------------------------------------ */
/* Islas                                                               */
/* ------------------------------------------------------------------ */

export const ISLANDS: Island[] = [
  { id: 1, name: 'Isla de los Rostros', article: 'la', tagline: 'Conozco mis emociones', marker: { x: 19, y: 58 }, thumbPosition: '18% 85%', levels: w1 },
  { id: 2, name: 'Bosque de las Pistas', article: 'el', tagline: 'Descubro por qué me siento así', marker: { x: 20, y: 12 }, thumbPosition: '12% 12%', levels: w2 },
  { id: 3, name: 'Valle de las Voces', article: 'el', tagline: 'Expreso lo que siento', marker: { x: 50, y: 33 }, thumbPosition: '50% 40%', levels: w3 },
  {
    id: 4,
    name: 'Laguna de la Calma',
    article: 'la',
    tagline: 'Aprendo a calmarme',
    marker: { x: 78, y: 15 },
    thumbPosition: '85% 15%',
    levels: w4,
    arrivalBadge: 'ola-calma',
  },
  {
    id: 5,
    name: 'Islas de los Amigos',
    article: 'las',
    tagline: 'Entiendo a los demás',
    marker: { x: 79, y: 62 },
    thumbPosition: '82% 85%',
    levels: w5,
    arrivalBadge: 'mano-amiga',
  },
];

/** Todos los niveles en orden de juego. */
export const ALL_LEVELS: Level[] = ISLANDS.flatMap((island) => island.levels);

export const LEVEL_BY_ID: Record<string, Level> = Object.fromEntries(ALL_LEVELS.map((l) => [l.id, l]));

export const ISLAND_BY_ID: Record<number, Island> = Object.fromEntries(ISLANDS.map((i) => [i.id, i]));

/** Insignias que se ganan al completar un nivel concreto. */
export const LEVEL_BADGES: Record<string, 'detective-caritas'> = {
  '1-3': 'detective-caritas',
};

/** «la Isla de los Rostros», «el Valle de las Voces». */
export const theIsland = (i: Island) => `${i.article} ${i.name}`;
/** «a la Laguna de la Calma», «al Bosque de las Pistas». */
export const toIsland = (i: Island) => (i.article === 'el' ? `al ${i.name}` : `a ${i.article} ${i.name}`);
