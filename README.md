# minesweeper
a minesweeper game in js/React

First, I implemented the minesweeper class. The implementation is decoupled from the display, making the code much easier to test and maintain.
An instance the this class represents an active game.
When the user flags or presses a cell , the games internal state is updated and the new state of affected cells is returned (so we can update the display efficiently).
Illegal actions, such as pressing a flagged cell or pressing out of bounds, have no effect but should not return an error/ raise an exception.
The display must check if the game is completed between steps.
Some work can be done to clean up the class, such as adding getters.

I added basic unit tests for the minesweeper classs using mocha.
to run them:
1. npm install mocha (if needed)
2. in the project folder, run "npm test"

Second, I started working on the React display.
Being new to React, I started out with their basic tic-tac-toe tutorial (https://reactjs.org/tutorial/tutorial.html), and then implemented the minesweeper game over the basic "game board" from the example.
Following the tutorail, I created a new React package using "npx create-react-app my-app", and replaced the default code.
To run the code:
1. npm install react-helmet (I use it to change the page title)
2. "npm start" in the folder
3. open "http://localhost:3000" in the browser

The package contains three components:
1. the parent (the whole screen)
2. the board
3. cells in the board

My initial plan was "mirror" the MineSweeper class implementation by maintaining a map of changed cells and refreshing  only them, but in order to simplify the react code I opted of create a "matrix" of display values instead. After a user action, the contents of changed cells are updated.
The display is kept simple - using background color to tell apart pressed and unpressed cells, and unicode characters for the cell contents (including a flag and a mine).
I did not invest time in styling the form portion of the game.
I did noticed that rendering large boards is a bit slow, but did not get around to imroving performance.

I tested the React game itself manually on Google Chrome (Version 81.0.4044.113 and 81.0.4044.122) and Firefox (75.0 ).
