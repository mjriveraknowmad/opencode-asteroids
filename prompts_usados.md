# Prompts usados

Registro cronológico de los prompts de usuario utilizados en este proyecto.

## 1. Crear/actualizar `AGENTS.md`

~~~text
Create or update `AGENTS.md` for this repository.

The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What to extract

Look for the highest-signal facts for an agent working in this repo:
- exact developer commands, especially non-obvious ones
- how to run a single test, a single package, or a focused verification step
- required command order when it matters, such as `lint -> typecheck -> test`
- monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
- framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
- testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
- important constraints from existing instruction files worth preserving

Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- content better stored in another file referenced via `opencode.json` `instructions`

When in doubt, omit.

Prefer short sections and bullets. If the repo is simple, keep the file simple. If the repo is large, summarize the few structural facts that actually change how an agent should work.

If `AGENTS.md` already exists at `C:\Proyectos\opencode\opencode-asteroids`, improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.
~~~

## 2. Commit de `AGENTS.md`

~~~text
haz un commit con este cambio
~~~

## 3. Overview del proyecto

~~~text
Hazme un overview del proyecto
~~~

## 4. Crear la rama de trabajo

~~~text
crea una nueva rama de git llamada 01-powerup-velocidad y situate en esa rama
~~~

## 5. Implementar el power-up de velocidad

~~~text
Agrega un nuevo feature llamado "velocidad", con el que se le permitirá al personaje moverse el doble de rápido durante 5 segundos.
~~~

## 6. Commit del power-up

~~~text
Haz un commit
~~~

## 7. Implementar la estrella fugaz y mergear

~~~text
Implenta un asteroide especial llamado "estrella fugaz", este asteroide será más rápido de lo normal pero desaparece con el tiempo

mergea la rama con main
~~~

## 8. Crear este registro

~~~text
Crea un prompts_usados.md, con los prompts usados
~~~

## 9. Rellenar la estrella fugaz

~~~text
rellena de un color amarillento la estrella fugaz, para que se distinga claramente
~~~

## 10. Actualizar el registro y commitear

~~~text
actualiza los prompts_usados.md, y haz un commit
~~~

## 11. Crear el comando de worktrees

~~~text
Crea un comando personalizado de OpenCode que corra con scope local. Que se ejecute con "/worktree".
Y lo que quiero que haga es simplemente el siguiente comando:

git worktree add .worktrees/<nombre-del-worktree>


Ten presente que vas a recibir un argumento, y que ese argumento puede, o no, tener espacios. Necesito que lo analices y le pongas el nombre del worktree que va a estar basado en el contexto que te estoy dando. El nombre debe ser en kebab-case sin espacios ni acentos.
No hagas nada más. No te cambies de directorio. No hagas nada adicional.
Simplemente ejecuta el comando de la creación del worktree
~~~

## 12. Nombre definitivo del comando

~~~text
Vale implementalo, pero llamale worktree-customed para no confundirlo con lo de OpenCode
~~~

## 13. Actualizar el registro

~~~text
Actualiza el archivo de prompts_usados.md con este ultimo prompt que usé
~~~

## 14. Crear los worktrees, en sesiones separadas y ejecutar lo que quiero en cada uno
~~~text
/worktree-customed triple shot
En el worktree de triple-shot. Implementemos un **triple shot**: Por 5 segundos, el personaje dispara 3 veces en línea recta.
~~~

~~~text
/worktree-customed Sistema de Skins
En el worktree de sistema de skins, implementemos un **sistema de skins**: Poder cambiar la apariencia de la nave.
~~~

~~~text
/worktree-customed escudo de la nave
En el worktree del escudo de la nave,  implementemos un **escudo**: Un escudo que protege a la nave de los proyectiles enemigos.
~~~

## 15. Comprobar y mergear los worktrees
~~~text
Comprueba los tres worktrees que existen y mergealos, para que sigan teniendo las funcionalidades que se añadieron en cada worktree
~~~

## 16. Actualizar el registro con los últimos prompts

~~~text
Actualiza el archivo de @prompts_usados.md con los últimos prompt que usé
~~~


## 17. Instalación para poder usar OpenCode en Github

```
opencode github install
```
Luego hay que configurar el repositorio para añadir un nuevo repository secret "OPENCODE_API_KEY", para eso vamos al repo > settings > en el menú lateral vamos a "Secrets and variables" y seleccionamos Actions > pulsamos el botón "New repository secret" y ahí añadimos "OPENCODE_API_KEY" con el valor (que será el valor de api key cread en opencode go)

Después de esto se configura en las settings del repo (en github) para que se puedan añadir issues. Se crea una issue y luego nosotros añadimos un comentario como: 

/oc implementa esta funcionalidad

Y tras un minuto aparecen un icono de ojitos en el comentario, y luego empieza a implementarlo, que se puede ver como lo está haciendo desde pestaña Actions del repositorio de github.
Al terminar hace una Pull Request con el código.

El código del resultado de este prompt es el .github\workflows\opencode.yml

fuente: https://www.udemy.com/course/opencode-guia-completa/learn/lecture/56769027#overview



## 18. Crear un GitHub Action para Formatear Issues usando OpenCode en Github

Prompt usado:
~~~text
Necesito que cada vez que se cree un issue. Ocupamos formatear, poner en las etiquetas "labels", y
también mantener lo que sea que la persona escribió tal cual está, pero a la vez añadir cierta
información que puede ser relevante a la hora de revisar los issues. El set de labels será: bug, enhancement, question, documentations y needs-triage.

En pocas palabras lo que necesito que hagamos es un nuevo GitHub Action
~~~

Pedirá permisos, y le damos a Allow.

(En el curso respondió que: Ante el bloqueo de la acción composite, usaremos opencode run headless.)
(En curso dejó un archivo [opencode.json](https://gist.github.com/Klerith/184c31a7f9931ce7dab5a909ca5b4e20), por si opencode se quedaba estancado al ejecutar el action... que se tendría que colocar en la raíz del proyecto, es decir, donde está también el README.md
El código del resultado de este prompt es el .github\workflows\issue-triage.yml


fuente: https://wwww.udemy.com/course/opencode-guia-completa/learn/lecture/56771139#overview