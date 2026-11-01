# Game Overview: Rolling Sky
Inspired by the mobile game Rolling Sky, this game is a single player obstacle dodging game where the player controls arrows keys to jump, move sides ways. 
The objective is to survive, avoid obstacles, and reach finish line without falling from the sky. 
The game will use a 2D top-down perspective to simulate the original Rolling Sky experience.

## Controls:
Left arrow key: Move the ball left.
Right arrow key: Move the ball right.
Up arrow key: Jump

# Why it is fun
The game challenges players' reaction times and coordination. As the ball progresses, obstacles become increasingly difficult to avoid. 

# The full intended feature set
Core Gameplay
- A ball that moves forward automatically.
- A continuously scrolling track that creates the sense of movement.
- Left and right keyboard controls for shifting the ball.
- Up arrow controls the jumping of ball.
- Obstacles that the player must avoid.
- Gaps in the track that cause the player to fall.
- Collision detection that ends the game when the ball hits an obstacle or falls into a gap.
- A score and restart option after losing.

Obstacles and Challenges
- Static obstacles: Blocks positioned on the track that the player must steer around.
- Gaps: Missing sections of the track that the player must jump or steer to avoid falling. 
- Moving obstacles: Blocks that move left and right, requiring the player to time their movements.
- Increasing difficulty: Obstacles appear more frequently or the scrolling speed increases as the player progresses.
- Scoring and Progress
- A score based on the player's distance traveled.
- Collectible diamonds that increase the player's score.
- A progress indicator at top showing how close the player is to completing the level.
- A finish line that the player must reach to win.

Visual Design
- A colorful tiled track with a contrasting background.
- A brightly colored ball that is easy to identify.
- Distinct colors for obstacles, gaps, and collectible diamonds.
- A start screen displaying the title and instructions.
- A game-over screen displaying the player's score and restart instructions.
- A victory screen displayed when the player completes the level.

# Acceptance Criteria
## Essential Requirements — High Priority
- The game opens with a start screen showing the title and basic controls.
- Clicking start button starts the game.
- The ball remains near the bottom of the screen while the track scrolls downward continuously.
- Pressing the left arrow key moves the ball left, and pressing the right arrow key moves it right.
- The ball cannot move beyond the left or right boundaries of the track.
- Static obstacles appear along the track and move toward the player as the screen scrolls.
- Colliding with an obstacle immediately ends the game.
- Falling into a gap in the track ends the game.
- When the game ends, a game-over message appears.
- Pressing the space bar after losing restarts the game from the beginning.
## Additional Requirements — Medium Priority
- The player earns points based on the distance traveled.
- Collecting a diamond increases the player's score.
- The current score is displayed during gameplay.
- The scrolling speed increases as the player progresses through the level.
- The game contains a defined finish line.
- Reaching the finish line without losing displays a victory message.
- At least one type of moving obstacle appears during gameplay.
## Optional Requirements — Low Priority
- The game includes at least two levels with different obstacle layouts.
- Background music plays during gameplay.
- Sound effects play when collecting diamonds or colliding with obstacles.
- The ball includes a visual rolling animation.
- The game records and displays the player's highest score.
  
