const MineSweeper = require("./src/minesweeper").MineSweeper;

const assert = require('assert');

function compareCells(actual, expected, doValue=false) {

    assert.equal(expected.length, actual.length);

    //sort the array as a precaution
    actual = actual.sort((a, b) => { return a.pos[0] === b.pos[0]? a.pos[1] - a.pos[1]: a.pos[0] - b.pos[0];});
    expected = expected.sort((a, b) => { return a.pos[0] === b.pos[0]? a.pos[1] - a.pos[1]: a.pos[0] - b.pos[0];});

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
    console.log(flags);
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