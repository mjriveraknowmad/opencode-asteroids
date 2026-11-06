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
| `S`       | Cambiar skin |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Power-ups

- **Velocidad (`2X`)** — aparece al destruir asteroides (15% de probabilidad). Al recogerlo, la nave se mueve al doble de velocidad durante 5 segundos; el HUD muestra `VELOCIDAD x2` con el tiempo restante.

## Skins

La apariencia de la nave se puede cambiar en cualquier momento con la tecla `S`. La skin activa se muestra en la esquina inferior izquierda del HUD y se guarda en el navegador, por lo que se conserva al recargar la página.

| Skin    | Color  |
| ------- | ------ |
| Clásica | Blanco |
| Flecha  | Cian   |
| Halcón  | Rosa   |
| Ovni    | Verde  |

Los iconos de vidas usan la silueta de la skin seleccionada.

## Estrella fugaz

- Asteroide especial, mucho más rápido que los normales. Aparece de forma aleatoria en algunas oleadas (25% de probabilidad), no se fragmenta al ser destruido y se desvanece por sí solo tras 6-10 segundos si no lo alcanzas.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
