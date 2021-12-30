/**
 * MazeRand class - returns random numbers
 */
class MazeRand {
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
    constructor(row, col, seed, optional) {
        if (optional) {
            this.base = optional["base"]
            this.mod = optional["mod"]
        }
        this.seed = seed;
        this.row = (row * row - this.base) * this.base % this.mod;
        this.col = (col * col - this.base) * this.base % this.mod;
    }

    /**
     * returns a random number from 0...1 based on the row, column, and current index
     */
    rand() {
        let b = this.base, m = this.mod, r = this.row, c = this.col, s = this.seed; // shorthands for base and mod
        // transform this.prev to get next number
        this.prev = (((this.prev << 12) % m * b - 123781232343 + 32849 * r % m - 3478278 * c % m) % m + m) % m;
        this.prev = (this.prev + r % m * b % m * b % m + c % m * b % m) % m;
        this.prev = ((this.prev * s % m + r * s % m * s % m - 273223748 * s % m + c * s % m) % m + m) % m;
        return this.prev / m;
    }
}

class DSU {
    par;
    siz;

    constructor(els) {
        this.par = new Array(els);
        this.siz = new Array(els);
        for (let i = 0; i < els; i++) {
            this.par[i] = i;
            this.siz[i] = 1;
        }
    }

    find(i) {
        return this.par[i] === i ? i : this.par[i] = this.find(this.par[i]);
    }

    join(a, b) {
        a = this.find(a);
        b = this.find(b);
        if (a !== b) {
            if (this.siz[a] < this.siz[b]) {
                [a, b] = [b, a];
            }
            this.par[b] = a;
            this.siz[a] += this.siz[b];
        }
    }

    conn(a, b) {
        return this.find(a) === this.find(b);
    }
}

// a list of directions (corresponds to the directions outlined in the function doc)
let mazeDir = [[0, -1], [-1, 0], [0, 1], [1, 0]]

/**
 * Interface-esque Factory pattern
 */
class RoomGen {
    weight
    rows;
    cols;
    static WALL_PROB = 0.3;

    constructor(_weight, _rows, _cols) {
        this.weight = _weight;
        this.rows = _rows;
        this.cols = _cols;
    }

    destroy(arr, r, c, dir) {
        arr[r][c][dir] = false;
        let [nr, nc] = [r + mazeDir[dir][0], c + mazeDir[dir][1]];
        arr[nr][nc][(dir + 2) % 4] = false;
    }

    /**
     * Alters arr so that there is a room at a random position
     * @param arr the grid specifying the maze -> arr[row][col][dir]
     * @param rand the MazeRand generator for randomness
     * @return * the altered arr
     */
    clearRoom(arr, rand) {
        let rows = arr.length;
        let cols = arr[0].length;
        let r = floor(rand.rand() * (rows - (this.rows + 1))) + 1;
        let c = floor(rand.rand() * (cols - (this.cols + 1))) + 1;
        for (let cr = r + 1; cr < r + this.rows - 1; cr++) {
            for (let cc = c + 1; cc < c + this.cols - 1; cc++) {
                arr[cr][cc].fill(true);
            }
        }
        for (let cr = r; cr < r + this.rows; cr++) {
            arr[cr][c][1] = arr[cr][c][2] = arr[cr][c][3] = true;
            let lc = c + this.cols - 1;
            arr[cr][lc][0] = arr[cr][lc][1] = arr[cr][lc][3] = true;
        }
        for (let cc = c; cc < c + this.cols; cc++) {
            arr[r][cc][0] = arr[r][cc][2] = arr[r][cc][3] = true;
            let lr = r + this.rows - 1;
            arr[lr][cc][0] = arr[lr][cc][1] = arr[lr][cc][2] = true;
        }
        for (let cr = r; cr < r + this.rows; cr++) {
            let lc = c + this.cols - 1;
            if (rand.rand() < RoomGen.WALL_PROB) this.destroy(arr, cr, c, 0);
            if (rand.rand() < RoomGen.WALL_PROB) this.destroy(arr, cr, lc, 2);
        }
        for (let cc = c; cc < c + this.cols; cc++) {
            if (rand.rand() < RoomGen.WALL_PROB) this.destroy(arr, r, cc, 1);
            let lr = r + this.rows - 1;
            if (rand.rand() < RoomGen.WALL_PROB) this.destroy(arr, lr, cc, 3);
        }
        return [r, c, this];
    }

    /**
     * fills a room with items
     * @param world The world to alter
     * @param x the x coordinate of the room in terms of tiles
     * @param y the y coordinate of the room in terms of tiles
     */
    fillRoom(world, x, y){
        throw "RoomGen does not have any functionality - use a subclass instead";
    }
}

class BlankRoom extends RoomGen {
    static COLS = 6;
    static ROWS = 4;

    constructor() {
        super(1, BlankRoom.ROWS, BlankRoom.COLS);
    }

    fillRoom(world, x, y){
        let [centerX, centerY] = [(x + BlankRoom.COLS / 2) * Tile.WIDTH, (y + BlankRoom.ROWS / 2) * Tile.HEIGHT];
        for(let cx = centerX - Tile.WIDTH; cx <= centerX + Tile.WIDTH; cx += Tile.WIDTH / 3){
            for(let cy = centerY - Tile.HEIGHT; cy <= centerY + Tile.HEIGHT; cy += Tile.HEIGHT / 3) {
                world.addEntity(new Coal(cx, cy, world, 30));
            }
        }
    }
}

class AnvilRoom extends RoomGen{
    static ROWS = 3;
    static COLS = 3;
    constructor(){
        super(2, AnvilRoom.ROWS, AnvilRoom.COLS);
    }
    fillRoom(world, x, y){
        world.addEntity(new Anvil((x + 1) * Tile.WIDTH, (y + 1) * Tile.HEIGHT));
    }
}

class WeaponCraftRoom extends RoomGen{
    static ROWS = 3;
    static COLS = 3;
    constructor(){
        super(2, WeaponCraftRoom.ROWS, WeaponCraftRoom.COLS);
    }
    fillRoom(world, x, y){
        world.addEntity(new CraftBench((x + 1) * Tile.WIDTH, (y + 1) * Tile.HEIGHT));
    }
}

class WeaponRoom extends RoomGen{
    static ROWS = 3;
    static COLS = 3;
    static tierWeight = [100, 23, 8, 2]
    constructor(){
        super(2, WeaponRoom.ROWS, WeaponRoom.COLS);
    }
    fillRoom(world, x, y){
        let chunksAway = x / Maze.CHUNKSIZE + y / Maze.CHUNKSIZE;
        let tierWeight = [...WeaponRoom.tierWeight];
        let tot = 0;
        for(let i = 1; i < tierWeight.length; i++){
            tierWeight[i] += i * chunksAway;
        }
        for(let weight of tierWeight){
            tot += weight;
        }
        let tierRand = new MazeRand(x, y, seed).rand() * tot;
        let curTier = -1;
        for(let [ind, we] of tierWeight.entries()){
            tierRand -= we;
            if(curTier === -1 && tierRand <= 0){
                curTier = ind + 1;
            }
        }
        console.assert(curTier !== -1);
        world.addEntity(new SwordDrop((x + 1) * Tile.WIDTH, (y + 1) * Tile.HEIGHT, world, curTier, []));
    }
}

function compCoords(r, c, cols) {
    return (r + 5) * (cols + 7) + (c + 5);
}

const roomGens = [new BlankRoom(), new AnvilRoom(), new WeaponCraftRoom(), new WeaponRoom()]
const roomProb = 1;

/**
 * creates a new maze
 * note: mazes are self contained - this means that there is a "border" (i.e no edge from any node to an node "outside" the grid")
 *      You should remember to fix the chunks by adding/opening edges between tiles in different squares
 * @param rows number of rows
 * @param cols number of columns
 * @param rGen A MazeRand object for creating random numbers
 * @return [maze, (room)]
 *      maze: 3D boolean array
 *      (returned array)[row][column][direction] -> whether or not there is a wall in the direction from (row, column)
 *      for directions, 0: left, 1: up, 2: right, 3: down
 *      room: array w/ 3 elements
 *      [r, c, roomGen] -> {row of the room created, column of the room creating, roomGen object that made the room}
 */
function newMaze(rows, cols, rGen) {
    // 3D array -> arr[row][col][dir] = hasEdge from (row, col) in [dir] direction
    let arr = []
    // fill in the array
    for (let i = 0; i < rows; i++) {
        // create a 2D array for the current row - everything should be false (a completely blocked grid)
        let cur = []
        for (let c = 0; c < cols; c++) {
            cur.push(new Array(4).fill(false));
        }
        // add the current row
        arr.push(cur);
    }
    // a list of valid edges
    let edges = []
    // iterate through each row ,column, and direction
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            for (let i = 0; i < 4; i++) {
                let [nr, nc] = [r + mazeDir[i][0], c + mazeDir[i][1]];
                if (0 <= nr && nr < rows && 0 <= nc && nc < cols) {
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
        if (!dsu.conn(curComp, nexComp)) {
            // combine the nodes (i.e add them to the same group, or destroy the wall between them
            arr[cr][cc][i] = true;
            // (i + 2) % 4 gives the opposite direction
            arr[nr][nc][(i + 2) % 4] = true;
            // join the two groups in our dsu
            dsu.join(curComp, nexComp);
        }
    });

    if (rGen.rand() < roomProb) {
        let totWeight = 0;
        for (let room of roomGens) {
            totWeight += room.weight;
        }
        let num = rGen.rand() * totWeight;
        for (let room of roomGens) {
            num -= room.weight;
            if (num <= 0) {
                return [arr, room.clearRoom(arr, rGen)];
            }
        }
    }

    // return the array
    return [arr];
}

/**
 * Stores an infinite Maze
 * should usually only use constructor() and hasWall()
 */
class Maze {
    static CHUNKSIZE = 10;
    seed;

    // stores the loaded chunks & tiles
    chunks;
    tiles;

    constructor(seed) {
        this.seed = seed;
        this.chunks = new Set();
        this.tiles = new Map();
    }

    // compresses 2d & 3d coordinates into a string for sets
    compChunk(r, c) {
        return "" + r + " " + c;
    }

    compTile(r, c, dir) {
        return "" + r + " " + c + " " + dir;
    }

    // "fixes" an a tile - if one side is open but the other tile has it closed, then make the wall open
    fixArea(r, c) {
        for (let dir = 0; dir < 4; dir++) {
            let [nr, nc, nd] = [r + mazeDir[dir][0], c + mazeDir[dir][1], (dir + 2) % 4]
            // whether this tile "thinks" the wall is open
            let curConn = this.tiles.get(this.compTile(r, c, dir));
            // whether to other tile "thinks" the wall is open
            let oConn = this.tiles.get(this.compTile(nr, nc, nd));

            // if both tiles exist
            if (curConn !== undefined && oConn !== undefined) {
                // set the wall to be whether either of the tiles think it's open
                if (curConn) this.tiles.set(this.compTile(nr, nc, nd), true);
                if (oConn) this.tiles.set(this.compTile(r, c, dir), true);
            }
        }
    }

    /**
     * Creates a new chunk
     * @param r the row of the chunk
     * @param c the column of the chunk
     * @return (room) if a room was created, it returns [row of room, column of room, roomGen object that made it]
     */
    newChunk(r, c) {
        console.assert(!this.chunks.has(this.compChunk(r, c)));
        // create the current chunk
        let [curChunk, room] = newMaze(Maze.CHUNKSIZE, Maze.CHUNKSIZE, new MazeRand(r, c, this.seed));

        // store the tiles in the chunk into the "central database"
        for (let ir = 0; ir < Maze.CHUNKSIZE; ir++) {
            for (let ic = 0; ic < Maze.CHUNKSIZE; ic++) {
                for (let dir = 0; dir < 4; dir++) {
                    this.tiles.set(this.compTile(Maze.CHUNKSIZE * r + ir, Maze.CHUNKSIZE * c + ic, dir),
                        curChunk[ir][ic][dir]);
                }
            }
        }

        // fix the edges so that it is compatible with the other chunks
        for (let cr = Maze.CHUNKSIZE * r; cr < Maze.CHUNKSIZE * (r + 1); cr++) {
            for (let cc = Maze.CHUNKSIZE * c; cc < Maze.CHUNKSIZE * (c + 1); cc++) {
                this.fixArea(cr, cc);
            }
        }

        // add the chunk to the "chunks database"
        this.chunks.add(this.compChunk(r, c));

        if(room){
            return [room[0] + r * Maze.CHUNKSIZE, room[1] + c * Maze.CHUNKSIZE, room[2]];
        }
    }

    /**
     * exterior function for querying if a wall exists
     * @param x the x coordinate of the current tile
     * @param y the y coordinate of the current tile
     * @param dir the direction of the wall relative to the tile (0: left, 1: up, 2: right, 3: down)
     * @returns {*} whether or not there is a wall from tile (r, c) in the [dir] direction
     */
    hasWall(x, y, dir) {
        // convert x, y coordinates into row, col coordinates
        let [r, c] = [y, x]

        if(!this.tiles.has(this.compTile(r, c, dir))){
            throw "The tile doesn't exist!";
        }

        // return the current wall
        return !this.tiles.get(this.compTile(r, c, dir));
    }

    /**
     * Gets the walls for a particular tile
     * @param x the x coordinate
     * @param y the y coordinate
     * @returns {*[]} boolean array - {has left wall, has top wall, has right wall, has bottom wall}
     */
    getTile(x, y) {
        return [this.hasWall(x, y, 0), this.hasWall(x, y, 1), this.hasWall(x, y, 2), this.hasWall(x, y, 3)];
    }
}

$(function () {
    // test();
})

const testWindow = (p) => {
    let maze;
    p.setup = function () {
        p.createCanvas(800, 800)
        maze = new Maze(10, Math.floor(17623876123));
    }

    p.draw = function () {
        p.background(0);
        p.stroke(255);
        p.strokeWeight(3);
        for (let x = 0; x < 20; x++) for (let y = 0; y < 20; y++) {
            if (maze.hasWall(x, y, 0)) p.line(40 * x, 40 * y, 40 * x, 40 * y + 40);
            if (maze.hasWall(x, y, 1)) p.line(40 * x, 40 * y, 40 * (x + 1), 40 * y);
            if (maze.hasWall(x, y, 2)) p.line(40 * (x + 1), 40 * y, 40 * (x + 1), 40 * y + 40);
            if (maze.hasWall(x, y, 3)) p.line(40 * x, 40 * (y + 1), 40 * (x + 1), 40 * (y + 1));
        }
    }
}

function test() {
    new p5(testWindow);
}
