let canvas = document.getElementsByClassName("game-cont")[0]
let start = document.getElementsByClassName("start-btn")[0]
let stop = document.getElementsByClassName("stop-btn")[0]
let restart = document.getElementsByClassName("restart-btn")[0]
let menu = document.getElementsByClassName("start")[0]
let highscore = document.getElementsByClassName("high")[0]
let scr = document.getElementsByClassName("points")[0]

//geting context of the canvas as we cant draw on the dom object
let grid = canvas.getContext("2d");
grid.scale(20, 20)

let high = [];

if (localStorage.getItem("high") !== null) {
    high = localStorage.getItem("high")
    highscore.innerHTML =localStorage.getItem("high") ;
}

let score = 0;
//creting a tetris piece
const Attribute_Piece = [
    [
    [0,0,0],
    [1,1,1],
    [0,1,0]
    ],
    [
    [2,2],
    [2,2],
    ],
    [
    [0,3,0,0],
    [0,3,0,0],
    [0,3,0,0],
    [0,3,0,0]
    ],
    [
    [0,4,4],
    [4,4,0],
    [0,0,0]
    ],
    [
    [5,5,0],
    [0,5,5],
    [0,0,0]
    ],
    [
    [0,6,0],
    [0,6,0],
    [6,6,0]
    ],
    [
    [0,7,0],
    [0,7,0],
    [0,7,7]
    ],
]

//when a line fills 
const gameGridCheck = () => {
    let count = 1;
    outer: for (let i = gameGrid.length - 1; i >1 ; i--) {
        for (let j = 0; j < gameGrid[i].length; j++) {
            if (gameGrid[i][j] === 0) {
                continue outer;
            }
        }
        // let row = gameGrid.splice(i, 1)[0].fill(0);
        gameGrid.unshift(gameGrid.splice(i, 1)[0].fill(0))
        i++;
        score += 10 * count;
        count*=2;
    }
}

//collision detection funtion 
const collisionDetect = (gameGrid,player) => {
    let piece = player.piece
    let position = player.pos
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] !== 0 && (gameGrid[i + position.y] && gameGrid[i + position.y][j + position.x]) !== 0) {
                return true;
            }
        }        
    }
    return false;
}


//creating grid for pieces
const createGrid = (h, w) => {
    
    let gameGrid = [];
    while (h > 0) {
        gameGrid.push(new Array(w).fill(0));
        h--;
    }
    return gameGrid;
}


//drawing the piece with every animation request
let draw = () => {
    //Repainting the canvas
    grid.fillStyle="#202020"
    grid.fillRect(0, 0, canvas.width, canvas.height);
    
    //drawing the piece
    drawPiece(player.piece, player.pos)
    drawPiece(gameGrid, {x:0,y:0})
}

//colors for 
const colors = [null,"#d7263d","#ffff00","#0c8e36","#4361ee","#c55df6","#80ffdb","#ffffff"]

//drawing the piece
const drawPiece = (Piece, pos) => {
    Piece.forEach((row ,y) => {
        row.forEach((col, x) => {
            if (col !== 0) {
                grid.fillStyle = colors[col];
                grid.fillRect(x+pos.x, y+pos.y, 1,1);
            }
        })
    })
}

//moving the piece every second down
let moveTime = 0;
let movePos = 0;
const pieceMover = (time = 0) => {

    //diffrence of time elapsed
    let diffTime = time - moveTime;
    moveTime = time;

    //total time elaped
    movePos+=diffTime
    if (movePos > 1000) {
        dMove()
    }
    draw()
    
    //calling animation frame for rerendering page
    animation = requestAnimationFrame(pieceMover)
}
//left and right movement
const lrMove = (dir) => {
    player.pos.x += dir;
    if (collisionDetect(gameGrid, player)) {
        player.pos.x -= dir;
    }
}

//down movement
const dMove = () => {
    player.pos.y++;
    scr.innerHTML=score;
    score++;

    //setting up high score
    if (score > localStorage.getItem("high")) {
        localStorage.setItem("high", score);
        highscore.innerHTML =localStorage.getItem("high") ;
    }
    //when moving down collision check
    if (collisionDetect(gameGrid, player)) {
        player.pos.y--;
        setPosition(player,gameGrid)
        newPiece()
        gameGridCheck()
    }
    movePos = 0;
}

//new piece
const newPiece = () => {
    player.piece = Attribute_Piece[Math.floor(Math.random() * 7)];
    player.pos.y = 1;
    player.pos.x = Math.floor(gameGrid[0].length / 2) - Math.floor(player.piece[0].length / 2);
    if (collisionDetect(gameGrid, player)) {
        stopAnimation()
        for (let i of gameGrid) {
            i.fill(0);
        }
        score = -50;
        // start.innerHTML="Restart"
        // menu.style.display = "flex";
        // exit(0)
    }
}


//player attributes
const player = {
    pos: {
        x: 7,
        y: 0,
    },
    piece:Attribute_Piece[0],
}

//rotate funtion 
const rotate = (dir, piece) => {
    let rp = piece;
    for (let i = 0; i < piece.length; i++){
        for (let j = 0; j < i; j++) {
            let temp = piece[i][j];
            piece[i][j] = piece[j][i];
            piece[j][i] = temp;
        }
    }
    
    if (dir !== 1) {
        for (let i = 0; i < piece.length; i++) {
            piece[i].reverse();
        }
    } else {
        piece.reverse();        
    }
    
    //if rotates out
    let offset = 1;
    while(collisionDetect(gameGrid, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset>5) {
            return;
        }
    }
}

//seting position of a piece
let gameGrid = createGrid(30, 18);

const setPosition = (player, gameGrid) => {
    for (let i = 0; i < player.piece.length; i++){
        for (let j = 0; j < player.piece[i].length; j++) {
            if (player.piece[i][j] !== 0) {
                gameGrid[i + player.pos.y][j + player.pos.x] = player.piece[i][j];
            }
        }
    }
}
// menu.style.display="none";
document.addEventListener('keydown', (e) => {
    // console.log(e);
    if (e.keyCode === 37) {
        lrMove(-1)
    }else if (e.keyCode === 39) {
        lrMove(1)
    }else if (e.keyCode === 40) {
        dMove()
    } else if (e.keyCode === 82) {
        rotate(1,player.piece)
    }else if (e.keyCode === 69) {
        rotate(0,player.piece)
    }
    
})
//adding keyboard event when game starts

//start on click

start.addEventListener('click', (e) => {
    
    pieceMover();
})

const stopAnimation = () => {
    cancelAnimationFrame(animation)
    document.animation=false
}
stop.addEventListener('click',stopAnimation
)
restart.addEventListener('click', () => {
    for (let i of gameGrid) {
        i.fill(0)
    }
    score = 0;
})


scr.innerHTML=score;