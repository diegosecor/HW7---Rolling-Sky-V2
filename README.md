# Rolling Sky V2

A 2D arcade game where you guide a ball along a scrolling path, collect diamonds and avoid obstacles. This is my second version for HW7, based on [sharon5u's original project](https://github.com/sharon5u/gamegame).

## Play

**[Play in your browser](https://diegosecor.github.io/HW7---Rolling-Sky-V2/)**

Choose one of the eight levels on the map, then press **PLAY LEVEL**. You can also download the project and open `JUGAR.html` in Chrome or Edge to play offline.

## Controls

| Key | Action |
| --- | --- |
| Left / Right arrows | Move sideways |
| Up arrow | Jump over gaps |
| P | Pause or resume |
| Space | Replay after a win or loss |
| Enter | Continue after winning |

The ball moves forward automatically. Jump over gaps and steer around obstacles. Use the Audio button to turn sound on or off. Touch controls are also available on mobile devices.

## What changed

- Eight levels with different colors, scenery and increasing difficulty.
- A pixel-art map where you can select any level.
- More detailed paths, plants, animals and backgrounds.
- A shaded ball with a jump shadow, sparkles and a fading trail.
- A simpler menu, clearer level information and updated victory effects.
- Saved scores and completed-level markers when browser storage is available.

The game keeps the original 2D format and builds on the existing movement, obstacles, scoring and level logic.

## Project files

- `index.html` — main page used by the online game.
- `engine.js` — gameplay rules and level settings.
- `game.js` — controls, game loop, sound and effects.
- `pixel-art.js` and `atlas-art.js` — game artwork and level map.
- CSS files — layout and visual styling.
- `JUGAR.html` — standalone copy for offline play.
- `SPEC.md` — the original specification.
- `prompt_log.md` — prompts and English translations documenting AI assistance.

## Development

The game uses HTML, CSS and JavaScript, with no external runtime dependencies.

With Node.js 18 or newer, run the checks with:

```sh
npm test
```

This also updates `JUGAR.html`. To rebuild only the offline copy after changing the source files, run:

```sh
npm run portable
```

The automated checks cover gameplay, level navigation and rendering logic. Browser layout, audio and touch controls still need manual testing.

## Credits

Original design, specification and code: [sharon5u](https://github.com/sharon5u/gamegame).

Adaptation and improvements: Diego, with AI assistance recorded in `prompt_log.md`. The original specification is preserved in `SPEC.md`, and the received version is kept in the Git history.
