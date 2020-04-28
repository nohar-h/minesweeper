import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// for the page title - see https://stackoverflow.com/questions/46160461/how-do-you-set-the-document-title-in-react
import { Helmet } from 'react-helmet';
const TITLE = 'Minesweeper by NH';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick} style={props.colors}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, j) {
        return (
            <Square
                value={this.props.cells[i][j].display}
                pos={[i, j]}
                onClick={(e) => this.props.onClick(e, i, j)}
                colors={{backgroundColor: this.props.cells[i][j].color}}
            />
        );
    }

    renderBoard(mineGame) {
        const width= mineGame.width;
        const height = mineGame.height;
        let row = [];
        for(let j=0; j < width; j++) {
            row.push(j);
        }
        let col = [];
        for (let i=0; i < height; i++) {
            col.push(i);
        }
        return (
          col.map(i => { return (
              <div className="board-row">
                  {row.map( j => { return (this.renderSquare(i, j));})}
              </div>
              );}
          )
        );

    }

    render() {
        return (
            <div className="board-frame">
                { this.renderBoard(this.props.game)}
            </div>
        );
    }
}

const BkColors = {
    FREE: "CadetBlue",
    FLAGGED: "CadetBlue",
    PRESSED: "AliceBlue"
};

class Game extends React.Component {
    constructor(props){
        super(props);
        let MineSweeper = require('./minesweeper.js').MineSweeper;

        let height = 5;
        let width = 5;
        let mines = 2;
        this.state = {
            width: width,
            height: height,
            mines: mines,
            game: new MineSweeper(height, width, mines),
            cellStates: this.initCells(width, height),  // a 2-dim array that for updating the cell components (can be optimized to a map)
            superman: false
        };

        // bind some handlers
        this.handleWidth = this.handleWidth.bind(this);
        this.handleHeight = this.handleHeight.bind(this);
        this.handleMines = this.handleMines.bind(this);
        this.onCreateGame = this.onCreateGame.bind(this);
        this.onSuperman = this.onSuperman.bind(this);
    }

    initCells(width, height) {
        const CellState = require('./minesweeper').CellState;
        let cells = [];
        for (let i=0; i< height; i++) {
            cells[i] = [];
            for(let j=0; j< width; j++) {
                cells[i].push({
                    pos: [i, j],
                    state: CellState.FREE,
                    value: 0,
                    display: '',
                    'color': BkColors.FREE
                });
            }
        }

        return cells;
    }

    handleWidth(event) {
        this.setState({width: event.target.value});
    }

    handleHeight(event) {
        this.setState({height: event.target.value});
    }

    handleMines(event) {
        this.setState({mines: event.target.value});
    }

    onCreateGame(event) {
        //console.log("State: " + this.state.height+ " " + this.state.width+ " " + this.state.mines);

        let MineSweeper = require('./minesweeper.js').MineSweeper;
        let newGame = new MineSweeper(this.state.height, this.state.width, this.state.mines);
        this.setState({
            game : newGame,
            cellStates: this.initCells(this.state.width, this.state.height),
            superman: false
        });

        newGame.debugLog();

        event.preventDefault();
    }

    onSuperman(event) {
        console.log("Superman!");

         let revealed = this.state.game.superman();
         this.updateCells(revealed);
         this.setState({superman: true});

        event.preventDefault();
    }

    updateCells(changes) {
        let newStates = this.state.cellStates.map(arr => arr.slice());

        for (const cell of changes) {
            //console.log("changing cell " + JSON.stringify(cell.pos) + " to " + JSON.stringify(cell));
            let newI = cell.pos[0];
            let newJ = cell.pos[1];
            newStates[newI][newJ] = cell;
            newStates[newI][newJ]["display"] = this.getCellValue(cell);
            newStates[newI][newJ]["color"] = this.getCellBkColor(cell);
        }

        console.log("after: Correct: " + this.state.game.progress.correctFlagged +
            " total: " + this.state.game.total +
            " Done? " + JSON.stringify(this.state.game.isCompleted()));

        this.setState({cellStates: newStates});
    }

    handleClick(event, i, j) {
        const CellState = require('./minesweeper').CellState;
        // alert if trying to falg but ran out of flags.
        if (event.shiftKey &&
            !this.state.game.canFlag() &&
            this.state.game.getState(i, j) !== CellState.FLAGGED) {
            alert("No Flags left!");
            return;
        }

        //depending on the shift button, we either flag or press
        const changes = event.shiftKey? this.state.game.flag(i, j) : this.state.game.press(i, j);

        this.updateCells(changes)
    }

    /*
    get the "Text" to show in this cell
     */
    getCellValue(cell) {
        const CellState = require('./minesweeper').CellState;
        const FLAG = require('./minesweeper').FLAG;

        switch (cell.state) {
            case CellState.FLAGGED:
                return FLAG;
            case CellState.PRESSED:
                switch (cell.value) {
                    case 0:
                        return '';
                    default:
                        return cell.value;
                }
            case CellState.FREE:
            default:
                return '';  // just until we sort out the bk color
        }
    }
   /*
    get the "Text" to show in this cell
     */
    getCellBkColor(cell) {
        const CellState = require('./minesweeper').CellState;

        switch (cell.state) {
            case CellState.FLAGGED:
                return BkColors.FLAGGED;
            case CellState.FREE:
                return BkColors.FREE;
            case CellState.PRESSED:
            default:
                return BkColors.PRESSED;
        }
    }

    render() {
        const game = this.state.game;

        let status;
        let completed = game.isCompleted();
        if (this.state.superman) {
            status = "Superman says:"
        } else if (completed.done) {
            status = completed.success? "Great Job!" : "CABOOM! Better luck next time :)"
        } else {
            status = "Remaining Flags: " + game.progress.flagsLeft;
        }
        return (
            <>
                <Helmet>
                    <title>{ TITLE }</title>
                </Helmet>
                <div className="game">
                    <form  className="game-form" onSubmit={this.onCreateGame}>
                        <label>
                            Width:
                            <input type="number" value={this.state.width} onChange={this.handleWidth} min="1" max="300"/>
                        </label>
                        <label>
                            Height:
                            <input type="number" value={this.state.height} onChange={this.handleHeight} />
                        </label>
                        <label>
                            Mines:
                            <input type="number" value={this.state.mines} onChange={this.handleMines} min="1" max={this.state.width * this.state.height}/>
                        </label>
                        <input type="submit" value="New Game" />
                    </form>
                    <form  className="game-form" onSubmit={this.onSuperman}>
                        <input type="submit" value="Superman" />
                    </form>
                    <div className="game-info">
                        <div>{status}</div>
                    </div>
                    <div className="game-board">
                        <Board
                            height={game.height}
                            width={game.width}
                            mines={game.total}
                            game={game}
                            onClick={(e, i, j) => this.handleClick(e, i, j)}
                            cells={this.state.cellStates}
                        />
                    </div>

                </div>
            </>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
