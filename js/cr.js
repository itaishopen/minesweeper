//CR: no 'use strict'
//CR: Very nice project!
var gBoard;
var gLevel;
var gState;
var timerInterval;
var gElBoard = document.querySelector('.game');

function initGame(i = 8, j = 8, mines = 15) {
    clearInterval(timerInterval);
    gLevel = createGLevel(i, j, mines);
    var emptyCells = gLevel.SIZEX * gLevel.SIZEY - gLevel.MINES;
    gState = {
        isGameOn: true,
        isFirstClick: true,
        isHintPressed: false,
        shownCount: gLevel.MINES,
        markedCount: 0,
        secsPassed: 0,
        hints: 3,
        emptyCells: emptyCells,
        isTimer: false
    };
    gBoard = buildEmptyBoard();
    renderBoard(gBoard);
}

gElBoard.addEventListener('mousedown', function (e) {
    var clickedEl = e.target;
    if (clickedEl.classList.contains('cell')) {
        if (e.button === 0) {
            var elFace = document.querySelector(".face");
            elFace.classList.remove("smiley");
            elFace.className += " wrong-smiley";
        }
    }
});

gElBoard.addEventListener('mouseup', function (e) {
    var elCell = e.target;
    if (e.button === 0) {
        tabDisplay(elCell);
        if (gState.isGameOn) {
            if (elCell.classList.contains('cell')) {
                var elFace = document.querySelector(".face");
                elFace.classList.remove("wrong-smiley");
                elFace.className += " smiley";
                var i = parseInt(elCell.dataset.i);
                var j = parseInt(elCell.dataset.j);
                cellClicked(elCell, i, j);
            }
        }
        if (elCell.matches('.face')) {
            initGame(gLevel.SIZEX, gLevel.SIZEY, gLevel.MINES);
        }
    }
    if (gState.isGameOn) {
        if (e.button === 2) {
            if (elCell.classList.contains('cell')) {
                var i = parseInt(elCell.dataset.i);
                var j = parseInt(elCell.dataset.j);
                cellMarked(elCell, i, j)
            }
        }
    }
});

function buildEmptyBoard() {
    var board = new Array(gLevel.SIZEY);
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(gLevel.SIZEX);
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isQMarked: false,
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function buildBoard() {
    //CR: could've used a while loop instead
    //CR: holding an array with possible coords and splicing would've been much more efficient
    for (var i = 0; i < gLevel.MINES; i++) {
        var coords = randomCoords();
        var currCell = gBoard[coords.i][coords.j];
        if (currCell.isShown || currCell.isMine) {
            --i;
        } else {
            currCell.isMine = true;
        }
    }
    setMinesNegsCount(gBoard);
}

// Sets mines-count to neighbors
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var numOfMines = 0;
            for (var x = Math.max(0, i - 1); x <= Math.min(i + 1, board.length - 1); x++) {
                for (var y = Math.max(0, j - 1); y <= Math.min(j + 1, board[0].length - 1); y++) {
                    if (x != i || y != j) {
                        numOfMines += board[x][y].isMine ? 1 : 0;
                    }
                }
            }
            board[i][j].minesAroundCount = numOfMines;
        }
    }
}

function createGLevel(i, j, mines) {
    return { SIZEX: i, SIZEY: j, MINES: mines };
}

function checkLevel() {
    if (gLevel.SIZEX !== gLevel.SIZEY) {
        return "Custom";
    } else {
        var level;
        switch (gLevel.SIZEX) {
            case 4:
                level = "Beginner";
                break;
            case 6:
                level = "Medium"
                break;
            case 8:
                level = "Expert";
                break;
            default:
                level = "Custom";
                break;
        }
        return level;
    }
}

function customGame() {
    var elForm = document.querySelector(`.custom`);
    elForm.style.display = "none";
    var elRows = document.querySelector(`.custom-rows`);
    var i = +elRows.value;
    var elCols = document.querySelector(`.custom-col`);
    var j = +elCols.value;
    var elMines = document.querySelector(`.custom-mines`);
    var mines = +elMines.value;
    initGame(i, j, mines);
}

function tabDisplay(elCell) {
    if (!elCell.matches('.tab1-btn')) {
        var tabContact = document.getElementsByClassName(`tab1`);
        for (var k = 0; k < tabContact.length; k++) {
            var openContact = tabContact[k];
            if (openContact.classList.contains('show')) {
                openContact.classList.remove('show');
            }
        }
    }
}

// Print the board as a <table> to the page
function renderBoard(board) {
    var strHTML = `<table style="border-collapse:"collapse";">
  <thead>
    <tr>
        <div class="menu title" >
         <div class="right">  
            <div class="mine-img"></div>
            <div class="game-name">Minesweeper</div>
          </div>
          <div class="minimize-img"></div>
          <div class="maximize-img"></div>
          <div class="close-img" onclick = "window.open('', '_self', ''); window.close();"></div>
        </div>
    </tr>
    <tr>
      <td class="menu game-menu" colspan="${board.length}">
      <div class="dropdown">
        <div class="tab1-btn" onclick="tabOpener()">Game
            <div class="tab1 content">
              <a onclick="initGame(4, 4, 2)">Beginner</a>
              <a onclick="initGame(6, 6, 5)">Medium</a>
              <a onclick="initGame(8, 8, 15)">Expert</a>
              <a onclick="initCustomModal()">Custom</a>
            </div>
          </div>
        <div class="tab-hint-btn" onclick="hintPressd()">Hints</div>
        <div class="tab hint-num">3</div>
      </div>
      </td>
    </tr>
    <tr>
      <td class="menu status" colspan="${board.length}">
        <section class = "game-status">
          <div class = "num-of-mines">${gState.shownCount.toString().padStart(3, '0')}</div>
          <div class = "face smiley"></div> 
          <div class = "timer">000</div> 
        </section>
      </td>
    </tr>
    </thead>
    <tbody width="100%"'>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += "<tr>\n";
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j });
            if (!currCell.isShown) cellClass += " blank";
            else if (currCell.isQMarked) cellClass += " question";
            else if (currCell.isMarked) cellClass += " mark";
            if (currCell.isShown) {
                if (currCell.isMine) {
                    cellClass += " mine";
                } else {
                    var mines = currCell.minesAroundCount;
                    cellClass += ` open${mines}`;
                }
            }
            strHTML +=
                '\t<td class="cell ' +
                cellClass +
                `" data-i = "${i}" data-j= "${j}"`
            ')" >\n';
            strHTML += "\t</td>\n";
        }
        strHTML += "</tr>\n";
    }
    strHTML += "</tbody></table>";
    gElBoard.innerHTML = strHTML;
}

function tabOpener() {
    var elTab = document.querySelector(`.tab1`);
    elTab.classList.toggle("show");
}

function initCustomModal() {
    var htmlStr = `
  <div class="custom modal">
    <div class="modal-sandbox"></div>
    <div class="modal-box">
      <div class="custom modal-body">
        <p>Height: <input type="text" value="30" class = "custom-rows" size = "3"></p>
        <p>Width:<input type="text" value="30" class = "custom-col" size = "3"></p>
        <p>Mines:<input type="text" value="150" class = "custom-mines" size = "3"></p>
        <br />
        <button class="close-modal" onclick="customGame()">submit</button>
      </div>
  </div>
</div>`
    gElBoard.innerHTML += htmlStr;
    var elModel = document.querySelector(`.custom`);
    elModel.style.display = "block";
}

function initWinModal() {
    var htmlStr = `
  <div class="win modal">
    <div class="modal-sandbox"></div>
    <div class="modal-box">
      <div class="modal-header">
      <h2>congratulations you have won the game<h2>
      </div>
      <div class="win modal-body">
        <p>You have played in ${checkLevel()} mode</p>
        <p>with a time of ${gState.secsPassed} sec do you want to save your score?</p>
        <p>name: <input type="text" value="Your name" class = "win-name"></p>
        <br />
        <button class="close-modal" onclick="saveScore()">submit</button>
      </div>
  </div>
</div>`
    gElBoard.innerHTML += htmlStr;
    var elModel = document.querySelector(`.win`);
    elModel.style.display = "block";
}

function saveScore() {
    var elForm = document.querySelector(`.win`);
    elForm.style.display = "none";
    var elWin = document.querySelector(`.win-name`);
    var name = elWin.value;
    localStorage.setItem(name, `Laval: ${checkLevel()} Time: ${gState.secsPassed}`);
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (!gState.isTimer) {
        setTimer();
        gState.isTimer = true;
    }
    if (gState.isHintPressed) {
        if (gState.isFirstClick) {
            buildBoard();
            gState.isFirstClick = false;
        }
        gState.isHintPressed = false;
        cellReveal(i, j);
        return;
    }
    var currCell = gBoard[i][j];
    if (currCell.isMarked || currCell.isShown) return;
    else {
        currCell.isShown = true;
        if (gState.isFirstClick) {
            buildBoard();
            gState.isFirstClick = false;
        }
        if (currCell.isMine) {
            var lastClass = elCell.classList.toString().split(' ').pop()
            elCell.classList.remove(lastClass);
            elCell.className += " mine death";
            gameOver();
        } else {
            var mines = currCell.minesAroundCount;
            if (mines === 0) {
                expandShown(i + 1, j);
                expandShown(i - 1, j);
                expandShown(i, j - 1);
                expandShown(i, j + 1);
                expandShown(i - 1, j + 1);
                expandShown(i + 1, j + 1);
                expandShown(i - 1, j - 1);
                expandShown(i + 1, j - 1);
            }
            gState.emptyCells--;
            elCell.classList.remove("blank");
            elCell.className += ` open${mines}`;
        }
    }
    var isGameWon = checkGameOver();
    if (isGameWon) {
        gameOver(true);
    }
}

// Called on right click to mark a cell as suspected to have a mine
function cellMarked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    if (currCell.isMarked) {
        currCell.isQMarked = true;
        currCell.isMarked = false;
        gState.markedCount--;
        elCell.classList.remove("mark");
        elCell.className += " question";
    } else if (currCell.isQMarked) {
        currCell.isQMarked = false;
        elCell.classList.remove("question");
        elCell.className += " blank";
    } else if (gState.markedCount < gLevel.MINES) {
        currCell.isMarked = true;
        gState.markedCount++;
        elCell.classList.remove("blank");
        elCell.className += " mark";
    }
    gState.shownCount = gLevel.MINES - gState.markedCount;
    var elMines = document.querySelector('.num-of-mines');
    elMines.innerText = gState.shownCount.toString().padStart(3, '0');
}

// Game ends when all mines are marked and all the other cells are shown
function checkGameOver() {
    if (gState.emptyCells === 0) {
        return true;
    }
    return false;
}

function expandShown(i, j) {
    if (j < 0 || j > gBoard[0].length - 1 || i < 0 || i > gBoard.length - 1)
        return;
    var currCell = gBoard[i][j];
    var cellSelector = "." + getClassName({ i: i, j: j });
    var elCell = document.querySelector(cellSelector);
    if (!currCell.isMine && !currCell.isShown && !currCell.isMarked && !currCell.isQMarked) {
        var numOfMines = currCell.minesAroundCount;
        if (numOfMines === 0) {
            currCell.isShown = true;
            elCell.classList.remove("blank");
            elCell.className += ` open${numOfMines}`;
            gState.emptyCells--;
            expandShown(i + 1, j);
            expandShown(i - 1, j);
            expandShown(i, j - 1);
            expandShown(i, j + 1);
            expandShown(i - 1, j + 1);
            expandShown(i + 1, j + 1);
            expandShown(i - 1, j - 1);
            expandShown(i + 1, j - 1);
        } else {
            currCell.isShown = true;
            elCell.classList.remove("blank");
            elCell.className += ` open${numOfMines}`;
            gState.emptyCells--;
            return;
        }
    } else {
        return;
    }
}

function hintPressd() {
    if (gState.hints > 0 && !gState.isHintPressed) {
        gState.isHintPressed = true;
        var elFace = document.querySelector(".face");
        elFace.classList.remove("smiley");
        elFace.className += " hint-smiley";
        gState.hints--;
        var elHint = document.querySelector(".hint-num");
        elHint.innerText = gState.hints;
    }
}

function gameOver(win = false) {
    clearInterval(timerInterval);
    gState.isTimer = false;
    gState.isGameOn = false;
    var elFace = document.querySelector(".face");
    if (win) {
        renderCells("mark");
        elFace.classList.remove("smiley");
        elFace.className += " win-smiley";
        initWinModal()
    } else {
        renderCells("mine");
        elFace.classList.remove("smiley");
        elFace.className += " dead-smiley";
    }
}

function renderCells(value) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var cellSelector = "." + getClassName({ i: i, j: j });
            var elCell = document.querySelector(cellSelector);
            if (!currCell.isShown && currCell.isMine && !currCell.isMarked) {
                elCell.classList.remove("blank");
                elCell.className += ` ${value}`;
            } else if (!currCell.isMine && currCell.isMarked) {
                elCell.classList.remove("mark");
                elCell.className += ` wrong-mark`;
            }
        }
    }
}

function cellReveal(i, j) {
    var elFace = document.querySelector(".face");
    elFace.classList.remove("hint-smiley");
    elFace.className += " smiley";
    var saveMat = [];
    for (var x = Math.max(0, i - 1); x <= Math.min(i + 1, gBoard.length - 1); x++) {
        for (var y = Math.max(0, j - 1); y <= Math.min(j + 1, gBoard[0].length - 1); y++) {
            var currCell = gBoard[x][y];
            if (!currCell.isShown) {
                var cellSelector = "." + getClassName({ i: x, j: y });
                var elCell = document.querySelector(cellSelector);
                saveMat.push({ elCell: elCell, class: elCell.classList });
                elCell.classList.remove('blank');
                if (currCell.isMine) {
                    elCell.className += ' mine';
                } else {
                    elCell.className += ` open${currCell.minesAroundCount}`;
                }
            }
        }
    }
    setTimeout(function () {
        for (var k = 0; k < saveMat.length; k++) {
            var lastClass = saveMat[k].class.toString().split(' ').pop();
            saveMat[k].elCell.classList.remove(lastClass);
            saveMat[k].elCell.className += ' blank';
        }
        return;
    }, 1000)
}

function setTimer() {
    timerInterval = setInterval(function () {
        gState.secsPassed += 1;
        document.querySelector('.timer').innerText = gState.secsPassed.toString().padStart(3, '0');
    }, 1000);
};

function getClassName(location) {
    var cellClass = "cell-" + location.i + "-" + location.j;
    return cellClass;
}

function randomCoords() {
    var i = Math.floor(Math.random() * gBoard.length);
    var j = Math.floor(Math.random() * gBoard[0].length);
    return { i: i, j: j };
}