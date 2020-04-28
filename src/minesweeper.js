/*
enum for "click state" of a cell - it can be either free, flagged or pressed.
this way, we can "switch" over the cell state instead of checking two flags (pressed/flagged)
possible changes:
free -> [flagged / pressed]
flagged -> [free]
pressed -> []
 */
const CellState = {
    FREE: 0,
    FLAGGED: 1,
    PRESSED: 2,
};

const MINE = '💣'; // hoping this unicode doesn't kill me
const FLAG = "🚩";  // hoping this unicode doesn't kill me

/*
This class represents a MineSweeper game
It is constructed with board dimensions and number of mines
User actions (flagging and pressing) are tracked as the game progresses.
Instead of maintaining a matrix with the status of each cell, we use maps (objects).
This alleviates the need for some annoying boundary checks, and possibly improves performance.
When the user performs an action, affected cell values are returned (for easy display update)
Two flags - track available flags and correct flags as part of the progress
The game ends when we flag all mines correctly or press a mine
 */
class MineSweeper {
    constructor (height, wid, nMines) {
        // these validation should be done in the display, but let's not trust it
        if (wid > 300 || height > 300) {
            alert("Board size is up to 300 * 300!");
            return;
        }
        if (nMines > wid * height) {
            alert("Too many mines!");
            return;
        }

        //select mine positions
        //1. all possible positions
        let board = [];
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < wid; j++) {
                board.push([i, j]);
            }
        }

        //2. randomly sort the positions (Fisher-Yates, taken from a tutorial)
        for (let i = board.length -1; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            let k = board[i];
            board[i] = board[j];
            board[j] = k;
        }
        // console.log(board);

        //3. select the mines
        board.splice(nMines, board.length - nMines);
        //console.log(board);

        //4. for efficiency, convert to a dict
        let mines = {};
        for (let mine of board) {
            mines[mine] = 1;
        }
        //console.log(mines);

        // for now, all is "public"
        // todo - getter/ setter and encapsulation
        this.width = wid; //width of the board
        this.height = height; //height of the board
        this.total = nMines;  //number of mines
        this.mines = mines; //position of mines
        this.progress =  {
            flagsLeft: nMines,  // flags still unused
            correctFlagged: 0,  //number of flags selected correctly
            clicked: {}, // indices of clicked (flagged or pressed) cells
            exploded: false,  // will become true if we press a mine
        };
    }
    /*
    check if there is a mine in this position
    */
    isMine(i, j) {
        // console.log("isMine: [" + i + ', ' + j + ']');
        return this.mines[[i, j]] === 1;
    }

    /*
    helper function
    get the (indices) of the surrounding cells
     */
    getSurrounding(i, j) {
        return [[i-1,j-1], [i-1, j], [i-1, j+1], [i, j-1], [i, j+1], [i+1, j-1], [i+1, j], [i+1,j+1]];
    }

    /*
    get the value for an index - return '💣' for a mine or the number of surrounding mines
    */
    getVal( i, j) {
        // console.log("getVal: [" + i + ', ' + j + ']');
        if (this.isMine(i, j)) {
            return MINE;
        }
        //these are the slots surrounds [i, j]. some of them are out of bounds but that's fine
        let toCheck = this.getSurrounding(i, j);
        return toCheck.reduce((t, v) => t + 1 * this.isMine(v[0], v[1]), 0);
    }

    /*
    get the state for an index - PRESSED, FLAGGED or FREE
     */
    getState( i, j) {
        // if the cell was bot touched yet, it's not in the map
        return this.progress.clicked[[i, j]] || CellState.FREE;
    }

    /*
   check true value and click state of a cell
    */
    getCell( i, j) {
        return {
            pos: [i, j],
            value: this.getVal(i, j),
            state: this.getState(i, j)
        };
    }

    /*
    helper function for testing - print the board to console
     */
    debugLog() {
        console.log("**********");
        console.log("board: " + this.width + " * " + this.height);
        console.log("mines: " + this.total + ": " + JSON.stringify(this.mines));
        let row = [];
        for(let j=0; j < this.width; j++) {
            row.push(j);
        }
        for (let i=0; i < this.height; i++) {
            console.log(row.map((v) => this.getVal(i, v)).join(" "))
        }
    }

    /*
    helper function for testing - print "user visible" the board to console
    */
    debugLogUser() {
        console.log("**********");
        console.log("board: " + this.width + " * " + this.height);
        console.log("remaining flags: " + this.progress.flagsLeft);
        function userShow(board, i, j) {
            let cell = board.getCell(i, j);
            switch (cell.state) {
                case CellState.FLAGGED:
                    return FLAG;
                case CellState.PRESSED:
                    return cell.value;
                case CellState.FREE:
                default:
                    return '-';
            }
        }
        let row = [];
        for(let j=0; j < this.width; j++) {
            row.push(j);
        }
        for (let i=0; i < this.height; i++) {
            console.log(row.map((v) => userShow(this, i, v)).join(" "))
        }
    }

    /*
   check if the game is done
   (Either we flagged all mines correctly or pressed a mine)
    */
    isCompleted() {
        let res = { done: false, success: false};
        // for some reason this failed in chrome on one computer with '==='. Just changed it and moved on.
        console.log("total " + this.total + " correct: " + this.progress.correctFlagged + " success? " + (this.total == this.progress.correctFlagged));
        if (this.total == this.progress.correctFlagged) {
            //console.log("Hurray");
            res.done = true;
            res.success = true;
        } else if (this.progress.exploded) {
            //nsole.log("Boo!");
            res.done = true;
        }
        return res;
    }

    /*
    flag (or un-flag) a cell
    action ignored if cell is pressed, or if all the flags are used up
    return: value and cell state of changed cells
     */
    flag( i, j) {
        // if we are done, ignore
        if (this.isCompleted().done)  {
            console.log("already done, ignoring flag");
            return [];
        }
        // flagging out of bounds is not allowed
        else if ( i < 0 || i >= this.height || j < 0 || j >= this.width) {
            console.log("cell out of bounds, ignoring flag: " + [i, j]);
            return [];
        }

        let cell = [i, j];
        let state = this.progress.clicked[cell];
        switch (state) {
            case CellState.PRESSED:
                //console.log("cannot flag a pressed cell: " + cell);
                break;
            case CellState.FLAGGED:
                //console.log("un-flagging cell: " + cell);
                this.progress.clicked[cell] = CellState.FREE;
                //update our counter
                this.progress.flagsLeft += 1;
                if (this.isMine(i, j)) {
                    this.progress.correctFlagged -= 1;
                }
                break;
            case CellState.FREE:
            default:  // undefined is also free..
                // can't flag if no flags left
                if (!this.canFlag()) {
                    console.log("No flags left!!!!");
                    return []; //actually no cells were changed...
                }
                //console.log("flagging cell: " + cell);
                this.progress.clicked[cell] = CellState.FLAGGED;
                this.progress.flagsLeft -= 1;
                if (this.isMine(i, j)) {
                    this.progress.correctFlagged += 1;
                }
                break;
        }

        return [this.getCell(i, j)];
    }

    /*
    check if we can flag (user still has some flags left
     */
    canFlag() {
        return (this.progress.flagsLeft > 0 );
    }

    /*
    press a cell
    ignored for flagged and pressed cells
    affects surrounding cells if the value is 0 (by pressing them as well)
    return values and click status of changed cells
     */
    press(i, j) {
        let alreadyChecked = {};
        return this._internalPress(i, j, alreadyChecked);
    }

    /*
    helper for press (prevent optimize code by not repeating cell presses in recursion
    (so we don't reach max recursion on large boards)
    code can be improved, I noticed this bug during final tests
     */
    _internalPress(i, j, cellsChecked) {
        // if we are done, ignore
        if (this.isCompleted().done)  {
            console.log("Game already done, ignoring press: " + [i, j]);
            return [];
        }
        // though pressing out of bounds won't cause an error, there's no need for it
        else if ( i < 0 || i >= this.height || j < 0 || j >= this.width) {
            console.log("cell out of bounds, ignoring press: " + [i, j]);
            return [];
        }

        let cell = [i, j];
        let state = this.progress.clicked[cell];
        switch (state) {
            case CellState.PRESSED:
            case CellState.FLAGGED:
                //console.log("can't press flagged or pressed cells " + cell);
                return []; // nothing has changed ...
            case CellState.FREE:
            default:  // undefined is also free..
                //console.log("pressing: " + cell);

                this.progress.clicked[cell] = CellState.PRESSED;
                cellsChecked[cell] = true;
                let res = [this.getCell(i, j)];
                let val = this.getVal(i, j);
                if (val === MINE) {
                    console.log("Kaboom!");
                    this.progress.exploded = true;
                } else if (val === 0) { // cells adjacent are also pressed
                    //get surrounding cells that are within bounds and have not been updated yet
                    let around = this.getSurrounding(i, j)
                        .filter(v => { return (v[0] >= 0 && v[0] < this.height &&
                            v[1] >= 0 && v[1] < this.width &&
                            cellsChecked[v] === undefined)});

                    // and press them as well
                    around.forEach(c => {
                        res = res.concat( this._internalPress(c[0], c[1], cellsChecked));
                    });
                }

                return res;
        }
    }

    /*
    change all cell states to "pressed"
    returns all the cell states and values, so their values can be displayed ( or whatever)
     */
    superman() {
        let res = [];
        for(let i=0; i< this.height; i++) {
            for (let j=0;j < this.width; j++) {
                this.progress.clicked[[i, j]] = CellState.PRESSED;
                res.push(this.getCell(i, j));
            }
        }
        // this will "complete" the game (successfully)
        this.progress.flagsLeft = 0;
        this.progress.correctFlagged = this.total;

        return res;
    }
}

module.exports.MineSweeper = MineSweeper;
module.exports.CellState = CellState;
module.exports.MINE = MINE;
module.exports.FLAG = FLAG;


