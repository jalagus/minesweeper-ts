enum BlockType {
    Opened,
    Closed,
    Mine
}

function initApp() {
    let areaWidth = 15;
    let areaHeight = 15;
    let areaMines = 20;

    let drawBlockSize = 40;
    let fontSize = (drawBlockSize * 0.6);

    let level = generateLevel(areaWidth, areaHeight, areaMines);
    
    const canvas = document.getElementById("gameScreen") as HTMLCanvasElement;
    
    // Resize the canvas to match block and area size
    canvas.width = areaWidth * drawBlockSize;
    canvas.height = areaHeight * drawBlockSize;
    
    if (canvas === null) {
        return;
    }

    let ctx = canvas.getContext('2d');

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        var x = Math.floor(mouseX / drawBlockSize);
        var y = Math.floor(mouseY / drawBlockSize);
                        
        makeGuess(x, y, level, () => drawScreen(level, areaWidth, areaHeight, ctx, drawBlockSize, fontSize));
    }, false);

    // Initialize the canvas element
    if (ctx !== null) ctx.font = fontSize + "pt Courier";

    // Starts the game. No main loops because actions happen only when
    // user click the play area
    drawScreen(level, areaWidth, areaHeight, ctx, drawBlockSize, fontSize);    
}

// Generates new level
function generateLevel(width: number, height: number, mines: number) {
    var level = new Array<Array<BlockType>>();
    
    // Reset level data
    for (let y = 0; y < height; y++) {
        level[y] = new Array<BlockType>();
        for (let x = 0; x < width; x++) {
            level[y][x] = BlockType.Closed;
        }
    }
    
    let mineCount = 0;
    
    // Place the mines to the level
    while (mineCount < mines) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        
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
function makeGuess(x: number, y: number, level: Array<Array<BlockType>>, drawScreenFn: () => void) {
    const statusMsg = document.getElementById("statusMessage") as HTMLDivElement;

    if (level[y][x] == BlockType.Mine) {
        statusMsg.innerText = "POW!!! You lost the game! \n\nRefresh the page to start a new game.";
    }
    else if (level[y][x] == BlockType.Closed) {
        revealFromPoint(level, x, y);
    }

    drawScreenFn();
        
    if (isFinished(level)) {
        statusMsg.innerText = "Congatulation! You won the game!";
    }
}

// Depth-first search algorithm
function revealFromPoint(level: Array<Array<BlockType>>, x: number, y: number) {
    if (level[y][x] == BlockType.Closed) {
        level[y][x] = BlockType.Opened;       
        
        // Check for nearby free spots and release them
        for (let i = -1; i < 2; i++) {
            for (let a = -1; a < 2; a++) {
                if (isInsideBounds(x + a, y + i, level.length, level[0].length) && 
                    level[y + i][x + a] == BlockType.Closed && 
                    getNearbyMineCount(level, x + a, y + i) > 0) {
                    
                    level[y + i][x + a] = BlockType.Opened;
                }
            }
        }                    
    }           

    // Go recursively throught every connected piece
    for (let i = -1; i < 2; i++) {
        for (let a = -1; a < 2; a++) {
            if (isInsideBounds(x + a, y + i, level.length, level[0].length) && level[y + i][x + a] == BlockType.Closed && 
                getNearbyMineCount(level, x + a, y + i) == 0) {
                
                revealFromPoint(level, x + a, y + i);
            }
        }
    }  
}

// Updates the screen
function drawScreen(level: number[][], width: number, height: number, ctx: any, drawBlockSize: number, fontSize: number) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            ctx.fillStyle="#000000";
            ctx.fillRect(x * drawBlockSize, y * drawBlockSize, 
                drawBlockSize, drawBlockSize);

            ctx.fillStyle="#aaaaaa";
            ctx.fillRect(x * drawBlockSize + 1, y * drawBlockSize + 1, 
                drawBlockSize - 2, drawBlockSize -2);                            

            if (level[y][x] == BlockType.Opened) {
                let nearbyMines = getNearbyMineCount(level, x, y);
                
                ctx.fillStyle="#eeeeee";
                ctx.fillRect(x * drawBlockSize + 1, y * drawBlockSize + 1, 
                    drawBlockSize - 2, drawBlockSize - 2);
                
                if (nearbyMines > 0) {
                    ctx.fillStyle="#000000";
                    ctx.fillText("" + nearbyMines, x * drawBlockSize + (fontSize * 0.4), y * drawBlockSize + (fontSize * 1.3) );
                }
            }
        }          
    }                
}

// Counts the number of mines around the x y -position
function getNearbyMineCount(level: Array<Array<BlockType>>, x: number, y: number) {
    let mines = 0;
    
    for (let i = -1; i < 2; i++) {
        for (let a = -1; a < 2; a++) {
            if (isInsideBounds(x + a, y + i, level.length, level[0].length) && level[y + i][x + a] == BlockType.Mine) {
                mines++;
            }
        }
    }
    
    return mines;
}

// Check that position is inside game area
function isInsideBounds(x: number, y: number, areaHeight: number, areaWidth: number) {
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


function isFinished(level: Array<Array<BlockType>>): boolean {        
    let finished = level.map((row) => row.map((block): boolean => {
        return block == BlockType.Closed;
    }).reduce((a, b) => a || b)).reduce((a, b) => a || b);
    
    return !finished;
}

initApp();