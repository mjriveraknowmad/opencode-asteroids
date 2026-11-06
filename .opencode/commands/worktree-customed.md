---
description: Crea un git worktree en .worktrees/<nombre-en-kebab-case>
---

Crea un worktree de Git en este repositorio.

Argumento recibido:

$ARGUMENTS

Instrucciones:

1. Analiza el argumento y deriva un nombre corto en kebab-case.
   - Minúsculas, palabras separadas por `-`, sin espacios ni signos de puntuación.
   - Sin acentos ni diacríticos: á→a, é→e, í→i, ó→o, ú→u, ü→u, ñ→n.
   - Descarta verbos genéricos ("implementar", "crear", "agregar", "hacer") y
     artículos; conserva el tema central.
   - Si el argumento ya es un nombre válido, úsalo tal cual.
   - Si el argumento está vacío, no ejecutes nada y pide un nombre.

   Ejemplos:
   - "triple shot" → triple-shot
   - "Sistema de Skins" → sistema-de-skins
   - "implementar el escudo de la nave" → escudo-de-la-nave

2. Ejecuta exactamente este comando de shell, una sola vez:

git worktree add .worktrees/<nombre>

Reglas estrictas:
- Usa la herramienta de shell; no uses las herramientas de worktree de OpenCode
  ni `session_move`.
- No agregues flags ni opciones (nada de `-b`, `-B`, `--detach`, etc.).
- No hagas `cd`, no cambies de directorio, no muevas la sesión.
- No edites archivos, no hagas commits, no verifiques nada más, no ejecutes
  ningún otro comando.
- Responde solo con la ruta del worktree creado y la salida del comando.
