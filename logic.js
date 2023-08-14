var BlockType;
(function (BlockType) {
    BlockType[BlockType["Opened"] = 0] = "Opened";
    BlockType[BlockType["Closed"] = 1] = "Closed";
    BlockType[BlockType["Mine"] = 2] = "Mine";
})(BlockType || (BlockType = {}));
function initApp() {
    var drawBlockSize = 40;
    var fontSize = (drawBlockSize * 0.6);
    var canvas = document.getElementById("gameScreen");
    var initGameButton = document.getElementById("initGame");
    var statusMsg = document.getElementById("statusMessage");
    var mineCountInput = document.getElementById("mineCount");
    var areaWidthInput = document.getElementById("areaWidth");
    var areaHeightInput = document.getElementById("areaHeight");
    var areaWidth = parseInt(areaWidthInput.value);
    var areaHeight = parseInt(areaHeightInput.value);
    var areaMines = parseInt(mineCountInput.value);
    var level = generateLevel(areaWidth, areaHeight, areaMines);
    if (canvas === null) {
        return;
    }
    // Resize the canvas to match block and area size
    var ctx = adjustCanvas(canvas, areaWidth, areaHeight, fontSize, drawBlockSize);
    initGameButton.addEventListener("click", function (event) {
        var areaWidth = parseInt(areaWidthInput.value);
        var areaHeight = parseInt(areaHeightInput.value);
        var areaMines = parseInt(mineCountInput.value);
        event.preventDefault();
        level = generateLevel(areaWidth, areaHeight, areaMines);
        var ctx = adjustCanvas(canvas, areaWidth, areaHeight, fontSize, drawBlockSize);
        drawScreen(level, ctx, drawBlockSize, fontSize);
    });
    statusMsg.addEventListener("click", function (event) {
        statusMsg.style.visibility = "hidden";
        var areaWidth = parseInt(areaWidthInput.value);
        var areaHeight = parseInt(areaHeightInput.value);
        var areaMines = parseInt(mineCountInput.value);
        event.preventDefault();
        level = generateLevel(areaWidth, areaHeight, areaMines);
        var ctx = adjustCanvas(canvas, areaWidth, areaHeight, fontSize, drawBlockSize);
        drawScreen(level, ctx, drawBlockSize, fontSize);
    });
    canvas.addEventListener("click", function (event) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;
        var x = Math.floor(mouseX / drawBlockSize);
        var y = Math.floor(mouseY / drawBlockSize);
        makeGuess(x, y, level);
        drawScreen(level, ctx, drawBlockSize, fontSize);
    }, false);
    // Starts the game. No main loops because actions happen only when
    // user click the play area
    drawScreen(level, ctx, drawBlockSize, fontSize);
}
function adjustCanvas(canvas, areaWidth, areaHeight, fontSize, drawBlockSize) {
    canvas.width = areaWidth * drawBlockSize;
    canvas.height = areaHeight * drawBlockSize;
    var ctx = canvas.getContext("2d");
    if (ctx !== null)
        ctx.font = fontSize + "pt Courier";
    return ctx;
}
// Generates new level
function generateLevel(width, height, mines) {
    var level = new Array();
    // Reset level data
    for (var y = 0; y < height; y++) {
        level[y] = new Array();
        for (var x = 0; x < width; x++) {
            level[y][x] = BlockType.Closed;
        }
    }
    var mineCount = 0;
    // Place the mines to the level
    while (mineCount < mines) {
        var x = Math.floor(Math.random() * width);
        var y = Math.floor(Math.random() * height);
        while (level[y][x] == BlockType.Mine) {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
        }
        level[y][x] = BlockType.Mine;
        mineCount++;
    }
    return level;
}
// The main logic of the game
function makeGuess(x, y, level) {
    var statusMsg = document.getElementById("statusMessage");
    var messageBox = document.getElementById("messageBox");
    if (level[y][x] == BlockType.Mine) {
        statusMsg.style.visibility = "visible";
        messageBox.innerText = "You lost the game!";
    }
    else if (level[y][x] == BlockType.Closed) {
        revealFromPoint(level, x, y);
    }
    if (isFinished(level)) {
        statusMsg.style.visibility = "visible";
        messageBox.innerText = "You won the game!";
    }
}
// Depth-first search algorithm
function revealFromPoint(level, x, y) {
    if (level[y][x] == BlockType.Closed) {
        level[y][x] = BlockType.Opened;
        // Check for nearby free spots and release them
        for (var i = -1; i < 2; i++) {
            for (var a = -1; a < 2; a++) {
                if (isInsideBounds(x + a, y + i, level.length, level[0].length) &&
                    level[y + i][x + a] == BlockType.Closed &&
                    getNearbyMineCount(level, x + a, y + i) > 0) {
                    level[y + i][x + a] = BlockType.Opened;
                }
            }
        }
    }
    // Go recursively throught every connected piece
    for (var i = -1; i < 2; i++) {
        for (var a = -1; a < 2; a++) {
            if (isInsideBounds(x + a, y + i, level.length, level[0].length) && level[y + i][x + a] == BlockType.Closed &&
                getNearbyMineCount(level, x + a, y + i) == 0) {
                revealFromPoint(level, x + a, y + i);
            }
        }
    }
}
// Updates the screen
function drawScreen(level, ctx, drawBlockSize, fontSize) {
    for (var y = 0; y < level.length; y++) {
        for (var x = 0; x < level[0].length; x++) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(x * drawBlockSize, y * drawBlockSize, drawBlockSize, drawBlockSize);
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(x * drawBlockSize + 1, y * drawBlockSize + 1, drawBlockSize - 2, drawBlockSize - 2);
            if (level[y][x] == BlockType.Opened) {
                var nearbyMines = getNearbyMineCount(level, x, y);
                ctx.fillStyle = "#eeeeee";
                ctx.fillRect(x * drawBlockSize + 1, y * drawBlockSize + 1, drawBlockSize - 2, drawBlockSize - 2);
                if (nearbyMines > 0) {
                    ctx.fillStyle = "#000000";
                    ctx.fillText("" + nearbyMines, x * drawBlockSize + (fontSize * 0.4), y * drawBlockSize + (fontSize * 1.3));
                }
            }
        }
    }
}
// Counts the number of mines around the x y -position
function getNearbyMineCount(level, x, y) {
    var mines = 0;
    for (var i = -1; i < 2; i++) {
        for (var a = -1; a < 2; a++) {
            if (isInsideBounds(x + a, y + i, level.length, level[0].length) && level[y + i][x + a] == BlockType.Mine) {
                mines++;
            }
        }
    }
    return mines;
}
// Check that position is inside game area
function isInsideBounds(x, y, areaHeight, areaWidth) {
    if (y < 0) {
        return false;
    }
    else if (y >= areaHeight) {
        return false;
    }
    else if (x < 0) {
        return false;
    }
    else if (x >= areaWidth) {
        return false;
    }
    return true;
}
function isFinished(level) {
    var finished = level.map(function (row) { return row.map(function (block) {
        return block == BlockType.Closed;
    }).reduce(function (a, b) { return a || b; }); }).reduce(function (a, b) { return a || b; });
    return !finished;
}
initApp();
