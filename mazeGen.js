/*
* TODO create tiles
 */

/**
 * MazeRand class - returns random numbers
 */
class MazeRand{
    base = 101489;
    mod = 18465223057;
    row;
    col;
    seed;
    prev = 0;

    /**
     * constructs a MazeRand class
     * @param row the current row (one parameter in the random generation)
     * @param col the current column (the other parameters in the random generation)
     * @param seed this seed for the random number generator
     * @param optional optional parameters - such as base and modulo
     */
    constructor(row, col, seed, optional){
        if(optional){
            this.base = optional["base"]
            this.mod = optional["mod"]
        }
        this.seed = seed;
        this.row = (row * row - this.base) * this.base  % this.mod;
        this.col = (col * col - this.base) * this.base % this.mod;
    }

    /**
     * returns a random number from 0...1 based on the row, column, and current index
     */
    rand(){
        let b=this.base, m=this.mod, r=this.row, c=this.col, s=this.seed; // shorthands for base and mod
        // transform this.prev to get next number
        this.prev = (((this.prev << 12) % m * b - 123781232343 + 32849 * r % m - 3478278 * c % m) % m + m) % m;
        this.prev = (this.prev + r % m * b % m * b % m + c % m * b % m) % m;
        this.prev = ((this.prev * s % m + r * s % m * s % m - 273223748 * s % m + c * s % m) % m + m) % m;
        return this.prev / m;
    }
}

class DSU{
    par;
    siz;
    constructor(els){
        this.par = new Array(els);
        this.siz = new Array(els);
        for(let i = 0; i < els; i++){
            this.par[i] = i;
            this.siz[i] = 1;
        }
    }
    find(i){
        return this.par[i] === i ? i : this.par[i] = this.find(this.par[i]);
    }
    join(a, b){
        a = this.find(a);
        b = this.find(b);
        if(a !== b){
            if(this.siz[a] < this.siz[b]){
                [a, b] = [b, a];
            }
            this.par[b] = a;
            this.siz[a] += this.siz[b];
        }
    }
    conn(a, b){
        return this.find(a) === this.find(b);
    }
}

function compCoords(r, c, cols){
    return (r + 5) * (cols + 7) + (c + 5);
}

// a list of directions (corresponds to the directions outlined in the function doc)
let mazeDir = [[0, -1], [-1, 0], [0, 1], [1, 0]]

/**
 * creates a new maze
 * note: mazes are self contained - this means that there is a "border" (i.e no edge from any node to an node "outside" the grid")
 *      You should remember to fix the chunks by adding/opening edges between tiles in different squares
 * @param rows number of rows
 * @param cols number of columns
 * @param rGen A MazeRand object for creating random numbers
 * @return maze 3D boolean array
 *      (returned array)[row][column][direction] -> whether or not there is a wall in the direction from (row, column)
 *      for directions, 0: left, 1: up, 2: right, 3: down
 */
function newMaze(rows, cols, rGen){
    // 3D array -> arr[row][col][dir] = hasEdge from (row, col) in [dir] direction
    let arr = []
    // fill in the array
    for(let i = 0; i < rows; i++){
        // create a 2D array for the current row - everything should be false (a completely blocked grid)
        let cur = []
        for(let c = 0; c < cols; c++){
            cur.push(new Array(4).fill(false));
        }
        // add the current row
        arr.push(cur);
    }
    // a list of valid edges
    let edges = []
    // iterate through each row ,column, and direction
    for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
            for(let i = 0; i < 4; i++){
                let [nr, nc] = [r + mazeDir[i][0], c + mazeDir[i][1]];
                if(0 <= nr && nr < rows && 0 <= nc && nc < cols){
                    // add the current edge if it leads to a valid square
                    edges.push([r, c, i])
                } else {
                    // set some of the edges to be open outside the chunk
                    arr[r][c][i] = rGen.rand() > 0.5;
                }
            }
        }
    }
    // sort edges in a random order
    edges.sort(() => rGen.rand() - 0.5);
    // Disjoint set union - can "combine" groups of nodes & see if two nodes are in the same group
    let dsu = new DSU(rows * cols + 10 * cols + 10 * rows + 200);

    // add each edge if it doesn't cause two nodes in the same group to combine
    edges.forEach(el => {
        // current coords & direction, next coords
        let [cr, cc, i] = el;
        let [nr, nc] = [cr + mazeDir[i][0], cc + mazeDir[i][1]];
        // compress the coordinates for usage in the DSU
        let curComp = compCoords(cr, cc, cols);
        let nexComp = compCoords(nr, nc, cols);

        // if the two coordinates are not in the same "group"
        if(!dsu.conn(curComp, nexComp)){
            // combine the nodes (i.e add them to the same group, or destroy the wall between them
            arr[cr][cc][i] = true;
            // (i + 2) % 4 gives the opposite direction
            arr[nr][nc][(i + 2) % 4] = true;
            // join the two groups in our dsu
            dsu.join(curComp, nexComp);
        }
    });
    // return the array
    return arr;
}

/**
 * Stores an infinite Maze
 * should usually only use constructor() and hasWall()
 */
class Maze{
    chunkSize;
    seed;

    // stores the loaded chunks & tiles
    chunks;
    tiles;
    constructor(chunkSize, seed){
        this.chunkSize = chunkSize;
        this.seed = seed;
        this.chunks = new Set();
        this.tiles = new Map();
    }
    // compresses 2d & 3d coordinates into a string for sets
    compChunk(r, c){
        return "" + r + " " + c;
    }
    compTile(r, c, dir){
        return "" + r + " " + c + " " + dir;
    }

    // "fixes" an a tile - if one side is open but the other tile has it closed, then make the wall open
    fixArea(r, c){
        for(let dir = 0; dir < 4; dir++){
            let [nr, nc, nd] = [r + mazeDir[dir][0], c + mazeDir[dir][1], (dir + 2) % 4]
            // whether this tile "thinks" the wall is open
            let curConn = this.tiles.get(this.compTile(r, c, dir));
            // whether to other tile "thinks" the wall is open
            let oConn = this.tiles.get(this.compTile(nr, nc, nd));

            // if both tiles exist
            if(curConn !== undefined && oConn !== undefined){
                // set the wall to be whether either of the tiles think it's open
                if(curConn) this.tiles.set(this.compTile(nr, nc, nd), true);
                if(oConn) this.tiles.set(this.compTile(r, c, dir), true);
            }
        }
    }

    /**
     * Creates a new chunk
     * @param r the row of the chunk
     * @param c the column of the chunk
     */
    newChunk(r, c){
        console.assert(!this.chunks.has(this.compChunk(r, c)));
        // create the current chunk
        let curChunk = newMaze(this.chunkSize, this.chunkSize, new MazeRand(r, c, this.seed));

        // store the tiles in the chunk into the "central database"
        for(let ir = 0; ir < this.chunkSize; ir++){
            for(let ic = 0; ic < this.chunkSize; ic++){
                for(let dir = 0; dir < 4; dir++){
                    this.tiles.set(this.compTile(this.chunkSize * r + ir, this.chunkSize * c + ic, dir),
                        curChunk[ir][ic][dir]);
                }
            }
        }

        // fix the edges so that it is compatible with the other chunks
        for(let cr = this.chunkSize * r; cr < this.chunkSize * (r + 1); cr++){
            this.fixArea(cr, this.chunkSize * c);
            this.fixArea(cr, this.chunkSize * (c + 1) - 1);
        }
        for(let cc = this.chunkSize * c; cc < this.chunkSize * (c + 1); cc++){
            this.fixArea(cc, this.chunkSize * r);
            this.fixArea(cc, this.chunkSize * (r + 1) - 1);
        }

        // add the chunk to the "chunks database"
        this.chunks.add(this.compChunk(r, c));
    }

    /**
     * exterior function for querying if a wall exists
     * @param r the row of the current tile
     * @param c the column of the current tile
     * @param dir the direction of the wall relative to the tile (0: left, 1: up, 2: right, 3: down)
     * @returns {*} whether or not there is a wall from tile (r, c) in the [dir] direction
     */
    hasWall(r, c, dir){
        // if the chunk doesn't exist, create the chunk
        let [cr, cc] = [Math.floor(r / this.chunkSize), Math.floor(c / this.chunkSize)]
        if(!this.chunks.has(this.compChunk(cr, cc))){
            this.newChunk(cr, cc);
        }
        // return the current wall
        return this.tiles.get(this.compTile(r, c, dir));
    }
}

$(function(){
    test();
})

const testWindow = (p) => {
    let maze;
    p.setup = function(){
        p.createCanvas(800, 800)
        maze = new Maze(10, Math.floor(Math.random() * 87238127893));
    }

    p.draw = function(){
        p.background(0);
        p.stroke(255);
        p.strokeWeight(3);
        for(let r = 0; r < 20; ++r) for(let c = 0; c < 20; ++c){
            if(!maze.hasWall(r, c, 0)) p.line(40 * c, 40 * r, 40 * c, 40 * r + 40);
            if(!maze.hasWall(r, c, 1)) p.line(40 * c, 40 * r, 40 * (c + 1), 40 * r);
            if(!maze.hasWall(r, c, 2)) p.line(40 * (c + 1), 40 * r, 40 * (c + 1), 40 * r + 40);
            if(!maze.hasWall(r, c, 3)) p.line(40 * c, 40 * (r + 1), 40 * (c + 1), 40 * (r + 1));
        }
    }
}

function test(){

    new p5(testWindow);
}
