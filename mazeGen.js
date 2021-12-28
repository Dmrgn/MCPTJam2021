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
        this.par = new Array(els).map((el, ind) => ind);
        this.siz = new Array(els).fill(1);
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
    // 3D array -> arr[row][col][dir] = hasEdge
    let arr = []
    for(let i = 0; i < rows; i++){
        let cur = []
        for(let c = 0; c < cols; c++){
            cur.push(new Array(4).fill(true));
        }
        if(i === 0) cur.map((el) => {el[1] = false; return el;});
        if(i === rows - 1) cur.map((el) => {el[3] = false; return el;});
        cur[0][0] = false;
        cur[cols - 1][2] = false;
        arr.push(cur);
    }
    let cost = []
    for(let i = 0; i < rows; i++){
        let cur = []
        for(let c = 0; c < cols; c++){
            cur.push(new Array(4).map(rGen.rand));
        }
        cost.push(cur);
    }
    let edges = []
    let dir = [[0, -1], [-1, 0], [0, 1], [1, 0]]
    for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
            for(let i = 0; i < dir; i++){
                let nr = r + dir[i][0], nc = c + dir[i][1];
                edges.push([r, c, i, cost[r][c][i]]);
            }
        }
    }
    // sort edges in increasing order of cost
    edges.sort((a, b) => a[3] - b[3]);
    let dsu = new DSU(rows * cols + cols + 200);
    edges.forEach(el => {
        let [cr, cc, i, cost] = el;
        let [nr, nc] = [cr + dir[i][0], cc + dir[i][1]];
        let curComp = compCoords(cr, cc, cols);
        let nexComp = compCoords(nr, nc, cols);
        if(!dsu.conn(curComp, nexComp)){
            arr[cr][cc][i] = true;
            if(0 <= nr && nr < rows && 0 <= nc && nc < cols){
                arr[nr][nc][(i + 2) % 4] = true;
            }
            dsu.join(curComp, nexComp);
        }
    });
    return arr;
}

$(function(){
    // test();
})

function test(){
    let ran = new MazeRand(20, 4950)
    let ran2 = new MazeRand(19, 1449);
    for(let i = 0; i < 1000; i++){
        console.log(ran.rand());
        console.log(ran2.rand());
    }
}
