# Charity: water Game Prototype

In this project, you’ll begin transforming your game concept from last week into a working interactive prototype using HTML, CSS, and JavaScript.

This first version should focus on core functionality — clickable elements, score tracking, and a basic layout. The goal is to bring your idea to life with simple, working mechanics that you’ll refine and expand in the next milestone.

H2O Logic - Game Logic: 

1. Game Start:
   - The user is greeted by the title screen with the game title, mission tagline, and the buttons play game and how to play (see wireframe above for more details). Background visuals incorporate community and natural landscape imagery aligned with charity: water.
   - Clicking on the play game button changes the screen to the game area (see wireframe above for more details). A 4x4 grid of pipe titles appears between a designated water source on the left and the community on the right. 
   - The top bar tracks elements including the level number, settings button, hint button, pause button, restart button, timer, move counter, and an impact counter. 

2. Player Actions:
   - The player can click/tap on individual pipe grid titles to rotate them (90 degrees per click/tap). They can also click on a check flow button located under the grid to test the pipeline connection. Additional buttons include settings, hint, pause, and restart. 

3. Game Logic:
   - The game should continuously check the directional orientation of adjacent pipe tiles starting from the water source coordinate (top left tile). When a tile is moved, the move counter should decrease the amount by one. When the check flow button is pressed it should trace the path from the source tile (water source) through the connected grid segments to determine if a continuous unbroken path reaches the end tile (the community). The impact counter should be updated after each time the check flow button is pushed for any new correct pipe line.
   - The game needs a success condition for a valid pipe connection that has been established between the source tile (water source) to the end tile (the community) before the timer runs out or before move limits are breached. 
   - It should also have a failure condition for if the timer runs out or all the allocated moves are used up before establishing a successful connection. 

4. Score/Feedback:
   - The score is updated using the impact counter which is updated each time the check flow button is pushed. For every correct pipe line the score increases by the designated amount. 
   - Visual feedback is triggered when the check flow button is pushed. Animated blue water flowing through the correctly connected pipes with an accompanied success cue per each correct pipe. The impact counter will be updated each time the check flow button is pushed. Incorrect or broken paths will trigger visual error indicators prompting the player to adjust tiles. When the player successfully connects all the pipes within the allotted time and moves a victory screen with a score display (taken from the impact counter), time taken, moves used, next level button, and home button (see wireframe above for more details) will be shown. Likewise, if the player does not successfully connect all the pipes within the allotted time and moves a game over screen with the option to retry (see wireframe above for more details) will be shown. 

5. Win or Lose Conditions:
   - To win the player needs to complete the pipe line puzzle successfully triggering the victory screen.
   - Running out of time or moves triggers a game over screen with the option to retry. 

6. Reset/Replay:
   - The player can click the restart button in the top navigation bar at any time to reset the current puzzle board. Upon resetting, the timer, move counter, impact counter, and tile rotations revert to their initial default states for that active level.
