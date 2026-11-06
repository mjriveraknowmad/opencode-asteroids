# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Power-ups

Al destruir un asteroide hay un 15% de probabilidad de que suelte un power-up. El tipo se elige al azar entre velocidad y escudo.

- **Velocidad (`2X`)** — al recogerlo, la nave se mueve al doble de velocidad durante 5 segundos; el HUD muestra `VELOCIDAD x2` con el tiempo restante.
- **Escudo (`ESC`)** — al recogerlo, la nave queda protegida durante 8 segundos con un anillo cian pulsante. Mientras el escudo esté activo, cualquier asteroide que impacte contra la nave se destruye sin restarle vidas. El HUD muestra `ESCUDO` con el tiempo restante.

## Estrella fugaz

- Asteroide especial, mucho más rápido que los normales. Aparece de forma aleatoria en algunas oleadas (25% de probabilidad), no se fragmenta al ser destruido y se desvanece por sí solo tras 6-10 segundos si no lo alcanzas.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Power-ups de velocidad y escudo temporal
- Partículas de explosión al destruir asteroides
