# TODO

- ~~delay /~~ preload tiles that use mathjax to skip the parsing
- leaderboards in localStorage + maybe some leaderboard server (NODEjs, PHP?)
- TUTORIAL on seperate page
- ~~use same image for tile area and bar area (no seperation between them)~~
- ~~definitely will need a cooldown to prevent spamming random arrows~~
- **warning message if in IE (or maybe firefox, depends on if we test on it or not)**
- lower int limits overall
- streaks like in OSU with popups saying "good!" "great!" "mathematical!" "UNREAL" "IRRATIONAL!!"
- trig mode with unit circle relationships
- **couple second delay after each round ends, during which tiles are loaded hidden. ~~~this will require changes to tile.js since new Tile(...) adds it on the spot~~**
- **~~support for different modes~~ and if they need the main tile**
- background scrolling is broken with the new background for some reason

# Ideas

- after each round, scroll right to next room (one long background image with connection of some sort between rooms)
- \+ have player walking with a corridor in the background

# Gameplay Outline

character and npc walk in
hud pops up under them
timer bar loads and the the big number tile shows up
Screens darkens like 20% and LET'S CRUNCH THE NUMBERS shows up center
then goes back to game and the timer starts, hp bars appear (optional atm)
and the player inputs
the input gives feedback and the character either gets hit or hits them
timer resets and new tiles appear
this continues until somebody dies

right answer = hit enemy
wrong answer = get hit

right answer depends on mode
greatest sum mode
trig matching mode (?)