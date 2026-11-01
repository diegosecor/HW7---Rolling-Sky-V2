# Rolling Sky — Skyline Run

A local, original fan-made prototype inspired by Rolling Sky. No downloads, npm packages, or build tools required. All graphics and sound effects are generated in the browser.

## Play and edit in VS Code

1. Open this `rolling-sky` folder in VS Code (File → Open Folder).
2. Open `index.html` in any modern browser by double-clicking it in Finder/Explorer.
3. Edit the files, save, and refresh the browser. Optionally use VS Code's Live Server extension for automatic reloads.

Controls: hold **← / →** to steer, press **↑** to jump, **P** to pause/resume, and **Space** to restart after losing or winning. Click **Let's roll** to start. Touch controls appear on smaller screens. Switching routes resets the run. Leaving the browser pauses automatically.

## What's included

- Two deterministic courses with different layouts, lengths, colors, and speeds.
- Automatic forward movement, scrolling tiles, smooth horizontal steering with edge falls, and animated jumps.
- Voxel trees, mountains and rocks; animated walking ducks; partial and full-width sky gaps; collision detection.
- Distance scoring (1 point / 10 world pixels), collectible diamonds (+100), progress, finish line, loss and victory screens.
- Optional synthesized sound effects; toggle Sound on. High score stored locally in your browser when storage is available.
- Ball rolling animation, responsive layout, keyboard and touch input.

Steer around trees, mountains, rocks, and ducks; jumping is for gaps. Jump gaps before reaching their edge. Jumps last 0.82 seconds, with a brief takeoff and landing period. The first hazards are deliberately spaced away from the starting point. Each course has a clear route but diamonds near moving hazards still require timing. Background music is not included.

## Source map

- `index.html`: start/end overlays, score HUD, route selection, controls.
- `style.css`: layout, responsive behavior, colors and typography.
- `engine.js`: pure gameplay rules. Edit `LEVELS` to tune speed, length, and spacing; edit `layout()` for obstacle placement. Distances are world pixels and lane numbers are 0–4.
- `game.js`: canvas drawing, keyboard/touch input, sound, storage, and fixed 120 Hz simulation.
- `test-engine.js`: gameplay regression tests; run `node test-engine.js` if Node.js is installed.

Jumping changes only the ball's visual height and gap clearance. The ball's ground position remains at 575 canvas pixels while the world scrolls toward it. A shared perspective projection draws the continuous cobalt-and-emerald trail, terrain, collectibles and ball; gameplay stays in world coordinates. World-indexed texture details prevent tile pattern popping. The dark interface uses saturated cobalt, violet, emerald and lime accents, paired with a deep blue night sky, sparse stars, faint clouds, and two small floating islands. Voxel scenery is original procedural canvas art. Simulation uses small fixed steps to prevent obstacle tunneling. No assets, code, or music from the original game are included.

## Faster action and impact effects

Forward speed and steering are about 50% faster. The ball spins faster and leaves a short trail; peripheral streaks emphasize movement. Diamonds trigger particles and a +100 popup. Duck patrols leave the outside lanes usable at the faster pace.

On obstacle impact, gameplay freezes immediately and the ball bursts into fragments with a short screen shake, then shows the result after 0.85 seconds. A missed gap shrinks and fades the ball into the sky over 1.15 seconds before showing the result. Steering eases into motion and brakes smoothly when released. Crossing either road edge triggers a fall, including while jumping; missing track sections also cause falls. The higher camera reduces perspective and exposes more of the road surface. Restart clears all effects. System reduced-motion preferences disable screen shake, impact tint, and speed streaks.

Run `node test-engine.js` for gameplay checks and `node test-effects.js` for headless animation lifecycle checks.

## Progression challenges

Both levels include two distance-triggered sections:

- **25–50% — Nightfall:** darkness fades in from 25–30%, stays at 97% outside the flashlight through 45%, then smoothly returns to normal by 50%. A soft elliptical flashlight follows the ball and reveals a short stretch of road ahead. The HUD, controls and overlays stay readable.
- **55–65% — Crosswind:** the entire road sways right then left and returns to center. Obstacles, gaps, diamonds and edge collision boundaries shift together; the player must steer to stay on the road. The shift envelope has zero slope at its endpoints, so there are no sudden jumps.

The small label below the course identifies each active challenge. These effects are driven by distance, so pausing freezes them and restarting resets them. Tune `darkness()` and `roadOffset()` in `engine.js` to adjust the intensity and windows.

Obstacle rows now arrive roughly 30% more often: Azure has 30 hazard rows and Violet has 34. Row spacing starts at 330/350 world pixels and tightens gradually by up to 12% toward the finish. The opening runway remains clear so you can settle into the controls.
