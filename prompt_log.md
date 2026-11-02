# Phase 2 prompt log — fresh 2D proposal

## Tools and scope

- AI tool: Codex desktop, GPT-6.1-sol for this new 2D pass.
- Development tools: PowerShell, Git, Node.js and its built-in assertions/VM test harness.
- Runtime: the inherited JavaScript Canvas game, with no external libraries or assets.
- Original source: https://github.com/sharon5u/gamegame, received commit `2f03b9c`.
- This repository starts from the original received project. The separate experimental chase-camera version is not this repository's baseline.

The originals below are preserved verbatim for the assignment. English translations are included to honor the user's request to save improvement instructions in English. This is a technical prompt log, not the student's personal handoff report.

## Main request

Original user prompt:

> es que eso es muy aburridooooo, yo no sabia que tenia qeu ser 2d yo lo hize 3d, va tocar cambiar todo ora vez,
> vamos a realizarlo otra propuesta crea otra carpeta y toma la vesion uno y vamos a detallarla apra que se vea increible siguiendo todas las reglas al pie de la letra

English translation:

> I did not know it had to be 2D; I made it 3D and thought everything would have to change again. Create a different proposal in another folder, start from version one, and polish it so it looks great while following all the rules exactly.

Actions: verified the source repository was unchanged; copied its eight files without edits; created the baseline commit; corrected track boundaries; adapted the existing renderer and scenery to top-down 2D; added an additive polish stylesheet and optional music; updated tests and acceptance documentation.

## Earlier instruction about the prompt record

Original user prompt:

> quiero que de ahroa en adelante guardes los promps indicaciones que te digo pero lo hagas en ingles traducelas, 1 la prespectia y la movilidad de la esfera esta horrible, las animaciones dentro del jueo se ven feas, megusta mas o menos al interfaz pero podemos agregarle una camino que no sea lineal que me hobliue a salirme de esa grid, tambien podriamos agregar una forma de recoger diamantes para comprar skins o destellos para la esfera, por ahora eso

English translation:

> From now on, save my prompts and instructions translated into English. Improve the sphere's perspective and movement and the in-game animations. I somewhat like the interface. We could add a nonlinear path and collect diamonds to buy sphere skins or trails.

Scope note: those extra mechanics belonged to the earlier exploratory proposal. They were not imported into this spec-focused 2D version. Diamond scoring and the two inherited courses remain.

## Unwanted AI behavior and correction

During this pass, the AI updated engine boundaries to comply with the spec but failed to replace one inherited animation-test fixture. That fixture still expected holding Right to cause an edge fall, so `test-effects.js` failed with `null !== 'fall'`.

Correction: the fixture was changed to trigger an actual gap fall. Separate engine tests assert that left/right movement remains inside the track. The original fall animation, immediate collision stop and restart checks remain. A new orthographic test checks constant object scale and tile width at every sampled distance. This corrected a real test mismatch rather than deleting the failing check.

## Model interpretation corrected by the task

The earlier exploration pursued chase-camera depth, hill momentum and a larger campaign. On re-reading the original spec, the user requested a fresh proposal that follows its 2D top-down presentation. The correction here is an orthographic projection and an unchanged original baseline, with the existing engine and gameplay flow retained.

## Limits of AI assistance

The AI updated technical documentation and tests. It did not write `HANDOFF_REPORT.md`. That personal reflection must be authored by the student, as required by the assignment. No Git history was backdated, and the initial baseline was committed before editing this new project.

## Additional pixel-art direction

Original user prompt:

> mejora todooooo, quiero una estetica pixel art supremamente artistica y creativa con degradados, animales mas detallados y muy bonito

English translation:

> Improve everything. I want an extremely artistic and creative pixel-art aesthetic, with gradients, more detailed animals, and a beautiful overall presentation.

Actions: extended the existing renderer with original pixel painters in `pixel-art.js`, a pixel-art UI skin, two garden palettes, stepped color gradients and deterministic tile textures. The inherited moving duck now has three feather palettes, discrete wing/foot poses and blinking; decorative frogs, koi, butterflies, lotus flowers and fireflies stay outside the playable tiles. The engine and original specification were not changed. Static raster previews were rendered from the drawing code and inspected; this was not interactive browser playtesting.
