# Sincero

Aplicación web educativa para niños de 6 a 10 años. Con ella aprenden a reconocer, comprender y gestionar sus emociones junto a **Tico**, el osito de la bufanda azul. El personaje principal es **Sofía**.

Proyecto de *Usabilidad y Accesibilidad (GR2SW)* de la Escuela Politécnica Nacional, desarrollado a partir de los 10 mockups de alta fidelidad.

## Requisitos

- Node.js 18 o superior (probado con Node 22)
- npm 9 o superior

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite abre la aplicación en `http://localhost:5173`.

Otros comandos:

```bash
npm run build      # verificación de TypeScript + compilación de producción en dist/
npm run preview    # sirve la compilación de producción
npm run typecheck  # solo verificación de tipos
```

### Volver al estado inicial de la demo

El progreso y los ajustes se guardan en LocalStorage. Para empezar de cero:

1. Abre las herramientas del navegador (F12).
2. En la consola, ejecuta:

```js
localStorage.removeItem('sincero:progreso:v2');
localStorage.removeItem('sincero:accesibilidad:v1');
```

## Tecnologías

React 18 · TypeScript · Vite 5 · React Router 6 · Lucide React · CSS con variables (sin Tailwind) · fuente Nunito local (`@fontsource/nunito`) · Web Speech API (SpeechSynthesis) · LocalStorage.

No hay backend: todos los datos de prueba están en `src/data/mockData.ts`.

## Rutas (10 pantallas)

| # | Pantalla | Ruta |
|---|----------|------|
| 1 | Inicio (dashboard) | `/inicio` |
| 2 | Mapa de la aventura | `/mapa` |
| 3 | Actividad: identificar emociones | `/actividad/identificar` |
| 4 | Respuesta correcta | `/actividad/correcta` |
| 5 | Respuesta incorrecta / pista | `/actividad/pista` |
| 6 | Respira conmigo: inhalación | `/actividad/respirar` |
| 7 | Nivel superado | `/nivel-completado` |
| 8 | Mis logros | `/logros` |
| 9 | Accesibilidad | `/accesibilidad` |
| 10 | Respira conmigo: exhalación | `/actividad/respirar/exhalar` |

## Estructura

```text
sincero/
├── public/
│   ├── favicon.png · favicon.ico
│   └── assets/
│       ├── tico/         tico-saludando, tico-celebrando, tico-respirando, tico-lupa, tico-logo
│       ├── characters/   lucas-parque
│       ├── emotions/     alegria, tristeza, enojo, miedo (recortadas de la imagen 18)
│       ├── maps/         mapa-islas (imagen 20), mapa-islas-mini (imagen 15)
│       ├── badges/       6 insignias (recortadas de la imagen 19)
│       └── backgrounds/  laguna-calma (reescalada ×4 con ESRGAN, 2152 × 1424)
├── src/
│   ├── components/   Navbar, PageShell, Mascot, Button, ProgressBar, EmotionCard,
│   │                 BadgeCard, ActivityHeader, FeedbackPanel, Caption, ListenButton,
│   │                 Toggle, StatCard, StarCoin, Modal, Confetti
│   ├── pages/        Dashboard, AdventureMap, IdentifyEmotion, CorrectAnswer,
│   │                 IncorrectAnswer, BreathingExercise, LevelCompleted,
│   │                 Achievements, Accessibility, activity/ActivityScreen
│   ├── hooks/        useProgress, useAccessibility, useSpeech, useLocalStorage
│   ├── context/      AppContext (progreso + accesibilidad + voz)
│   ├── data/         mockData.ts (emociones, preguntas, islas, insignias, estado inicial)
│   ├── styles/       variables.css, global.css, components.css, pages.css, animations.css
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── README.md
```

## Funcionalidades

**Navegación.** Barra superior con Inicio, Mapa, Mis logros y Accesibilidad, además de:
- un contador de estrellas,
- un botón de modo calma,
- el avatar de Sofía.

Las actividades tienen «Volver al mapa» y «Pausa». Las rutas inexistentes vuelven a `/inicio`.

**Progresión: 5 mundos y 25 niveles** (`src/data/levels.ts`). Se avanza en orden: superar un nivel desbloquea el siguiente, y completar los 5 niveles de una isla abre la isla siguiente en el mapa. Los niveles completados se pueden repetir; las preguntas ya resueltas no vuelven a sumar estrellas.

| Mundo | Tema | Niveles |
|-------|------|---------|
| 1. Isla de los Rostros | Reconozco emociones (caritas) | Alegría y tristeza · ¿Qué dice su carita? · ¿Cómo se siente Lucas? · Enojo y miedo · Gran repaso |
| 2. Bosque de las Pistas | Descubro por qué me siento así | ¿Qué pasó? · Pistas del cuerpo · Lo que pasa antes · Una emoción, muchas causas · Gran repaso |
| 3. Valle de las Voces | Expreso lo que siento | Pongo nombre a lo que siento · Con calma y respeto · ¿A quién se lo cuento? · Mis palabras de emociones · Gran repaso |
| 4. Laguna de la Calma | Aprendo a calmarme | Señales de alerta · Respira con Tico (respiración) · Mi caja de calma · Calma profunda (respiración) · Gran repaso |
| 5. Islas de los Amigos | Entiendo a los demás | ¿Cómo se siente mi amigo? · Una mano amiga · Ponerme en sus zapatos · Resolvemos juntos · Gran repaso |

Hay dos tipos de pregunta: **elegir una carita** y **elegir una respuesta de texto** (A, B o C). El «Gran repaso» de cada isla mezcla preguntas de sus niveles anteriores. Al llegar a la Laguna de la Calma se gana *Ola de calma*, y al llegar a las Islas de los Amigos, *Mano amiga*. La pantalla «Nivel superado» anuncia la isla nueva y ofrece ir al siguiente nivel.

**Actividad del nivel 3.** El nivel tiene 4 situaciones: Valentina, Lucas, Mateo y Camila. El estado inicial reproduce el mockup: la actividad arranca en «2 de 4», con Lucas.
- **Tristeza** (u otra respuesta correcta) lleva a `/actividad/correcta` y suma 1 estrella.
- Cualquier otra carita lleva a `/actividad/pista`, con «Tu elección» y pistas sobre ojos y boca. Nunca se descuentan estrellas.
- «Pedir una pista» muestra las pistas sin penalización.
- Al terminar la cuarta situación aparece **Nivel superado**. Esa pantalla marca el nivel 3 como completado y desbloquea la insignia *Detective de caritas*.
- Las situaciones ya resueltas no vuelven a sumar estrellas al repetir el nivel.

**Mapa.** Muestra las 5 islas sobre la ilustración original.
- Cada isla se puede seleccionar. Las bloqueadas muestran un aviso.
- El panel lateral indica los estados de cada nivel (completado, aquí estás, bloqueado) y el progreso del mundo.
- El botón «¡Jugar nivel 3!» cambia a «Repetir nivel 3» cuando el nivel ya está superado.

**Respira conmigo.** Son 6 respiraciones de 4 s inhalando y 6 s exhalando, en total 1 minuto.
- El círculo crece al inhalar y se encoge al exhalar.
- La URL alterna entre `/actividad/respirar` y `/actividad/respirar/exhalar`.
- Se puede pausar, reanudar y salir. Al terminar aparece un cierre con «Respirar otra vez».

**Mis logros.** Estrellas, insignias e islas exploradas, calculadas a partir del progreso real. Incluye las 6 insignias (las bloqueadas llevan su pista) y las caritas conocidas. No hay rankings ni comparaciones.

**Accesibilidad.** Las opciones se guardan solas en LocalStorage y se ven en la vista previa:
- tamaño del texto (pequeño, mediano o grande),
- narración,
- subtítulos,
- modo calma (colores suaves, sin nubes, confeti ni animaciones),
- animaciones,
- alto contraste.

Además, la app:
- respeta `prefers-reduced-motion`,
- tiene foco visible, enlace «Saltar al contenido» y etiquetas ARIA,
- usa interruptores con `role="switch"` y modales con Esc y foco atrapado,
- nunca comunica un estado solo con color (siempre añade ícono y texto).

**Voz.** Tico narra automáticamente cada pantalla si la narración está activada. Los botones «Escuchar…» reproducen o detienen la voz. El texto siempre está en pantalla. Si el navegador no tiene síntesis de voz, la actividad sigue funcionando solo con texto.

**Sonidos.** Se generan con la Web Audio API (`src/lib/sounds.ts`), sin archivos de audio:
- campanitas ascendentes al acertar,
- dos notas suaves y amables al elegir otra carita (no es un zumbido de error),
- una fanfarria al superar el nivel,
- una campanita tranquila al terminar la respiración.

Se apagan con la opción «Sonidos» (en Accesibilidad o en el inicio) y también en modo calma. Al activar la opción suena una muestra.

**Persistencia.** Se guardan en LocalStorage las estrellas, las insignias, los niveles completados, la situación en curso y los ajustes de accesibilidad.

## Decisiones tomadas

- **Insignia *Detective de caritas*.** Los mockups no coinciden entre sí. El inicio muestra 7 estrellas con el nivel 3 aún pendiente, mientras que «Nivel superado» anuncia esa insignia como nueva. Por eso, al empezar hay 3 insignias desbloqueadas y la cuarta se gana al superar el nivel 3. Desde ese momento «Mis logros» coincide con su mockup.
- **Valentina, Mateo y Camila.** El mockup indica que el nivel tiene 4 situaciones («2 de 4»), pero solo hay una ilustración de escena: la de Lucas. Las otras tres situaciones usan como imagen las caritas de emociones del ZIP.
- **Niveles 4 y 5, e islas 2 a 5.** Los mockups solo muestran sus nombres. Su contenido (situaciones, preguntas y pistas) se escribió siguiendo el tema de cada isla y reutilizando las ilustraciones del ZIP.
- **Fuera de alcance.** Siguiendo las restricciones del proyecto, no hay login, ni portales de docente o familia, ni reportes.
