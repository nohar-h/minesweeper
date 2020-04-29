const MineSweeper = require("./src/minesweeper").MineSweeper;

const assert = require('assert');

function compareCells(actual, expected, doValue=false) {

    assert.equal(expected.length, actual.length);

    //sort the array as a precaution
    actual = actual.sort((a, b) => { return a.pos[0] - b.pos[0];}).sort((a, b) => { return a.pos[1] - b.pos[1];});
    expected = expected.sort((a, b) => { return a.pos[0] - b.pos[0];}).sort((a, b) => { return a.pos[1] - b.pos[1];});

    for (let i in actual) {
        assert.equal(actual[i].pos[0], expected[i].pos[0]);
        assert.equal(actual[i].pos[1], expected[i].pos[1]);
         assert.equal(actual[i].state, expected[i].state);

        if (doValue) { // we only care when testing press
            assert.equal(actual[i].value, expected[i].value);
        }
    }
}

it('flagging returns correct changes', () => {
    let myBoard = new MineSweeper(3,3,1);

    let flags = myBoard.flag(0, 0);

    //flagged first time
    compareCells(flags, [{"pos":[0,0],"value":1,"state":1}]);
    // can't flag - no flags left
    flags = myBoard.flag( 1, 0);
    compareCells(flags, []);
    //now un-flag
    flags = myBoard.flag(0, 0);
    compareCells(flags, [{"pos":[0,0],"value":1,"state":0}]);

    // // now we can flag someplace else
    flags = myBoard.flag(1, 0);
    compareCells(flags, [{"pos":[1,0],"value":1,"state":1}]);
});

it('can flag', () => {
    let myBoard = new MineSweeper(3,3,1);

    //nothjing flagged yet
    assert.equal(myBoard.canFlag(), true);

    //no flags left
    myBoard.flag(0, 0);
    assert.equal(myBoard.canFlag(), false);

    //flag freed up
    myBoard.flag(0, 0);
    assert.equal(myBoard.canFlag(), true);


});

it('is completed - not done', () => {
    let myBoard = new MineSweeper(3,3,1);
    myBoard.mines = {};
    myBoard.mines[[0, 0]] = 1;
    let done = myBoard.isCompleted();
    assert.equal(done.done, false);
    assert.equal(done.success, false);

    //after wrong flag - still not done
    myBoard.flag(1, 1);
    done = myBoard.isCompleted();
    assert.equal(done.done, false);
    assert.equal(done.success, false);
});

it('is completed - success', () => {
    let myBoard = new MineSweeper(3,3,1);
    myBoard.mines = {};
    myBoard.mines[[0, 0]] = 1;
    myBoard.flag( 0, 0);

    let done = myBoard.isCompleted();
    assert.equal(done.done, true);
    assert.equal(done.success, true);
});

it('is completed - fail', () => {
    let myBoard = new MineSweeper(3,3,1);
    myBoard.mines = {};
    myBoard.mines[[0, 0]] = 1;
    myBoard.press( 0, 0);

    let done = myBoard.isCompleted();
    assert.equal(done.done, true);
    assert.equal(done.success, false);
});

it('press cell with value 0', () => {
    // this also tests none-zero values, but not mines
    let myBoard = new MineSweeper(3,3,1);
    myBoard.mines = {};
    myBoard.mines[[0, 0]] = 1;
    let pressed = myBoard.press(2, 2);
    let expected = [
        {"pos":[2,2],"value":0,"state":2},
        {"pos":[1,1],"value":1,"state":2},
        {"pos":[1,2],"value":0,"state":2},
        {"pos":[0,1],"value":1,"state":2},
        {"pos":[1,0],"value":1,"state":2},
        {"pos":[0,2],"value":0,"state":2},
        {"pos":[2,1],"value":0,"state":2},

        {"pos":[2,0],"value":0,"state":2}];

    //in this case we also test the value of each cell
    compareCells(pressed, expected, true);
});

it('superman', () => {
    myBoard = new MineSweeper(2, 3, 1);
    myBoard.mines = {};
    myBoard.mines[[0, 0]] = 1;
    let pressed = myBoard.superman();

    const expected = [
        {"pos":[0,0],"value":"💣","state":2},
        {"pos":[0,1],"value":1,"state":2},
        {"pos":[0,2],"value":0,"state":2},
        {"pos":[1,0],"value":1,"state":2},
        {"pos":[1,1],"value":1,"state":2},
        {"pos":[1,2],"value":0,"state":2}
        ];
    //in this case we also test the value of each cell
    compareCells(pressed, expected, true);

    // the game is done now
    let done = myBoard.isCompleted();
    assert.equal(done.done, true);
    assert.equal(done.success, true);
});

it('ignore clicks and presses out of bounds', () => {
    myBoard = new MineSweeper(2, 3, 1);

    compareCells(myBoard.flag(100, 0), []);
    compareCells(myBoard.flag(0, 100), []);
    compareCells(myBoard.flag(-1, 0), []);
    compareCells(myBoard.flag(0, -1), []);
    compareCells(myBoard.press(100, 0), []);
    compareCells(myBoard.press(0, 100), []);
    compareCells(myBoard.press(-1, 0), []);
    compareCells(myBoard.press(0, -1), []);
});

// it('pressing large, empty board doesn\'t crash', () => {
//     let myBoard = new MineSweeper(300,300,1);
//     myBoard.mines = {};
//     myBoard.mines[[0, 0]] = 1;
//     //this takes FOREVER
//     //mostly I wanted to see this didn't reach an recursion limit
//     let pressed = myBoard.press(299, 299);
//
//     assert.equal(pressed.length, 89999);
// });



