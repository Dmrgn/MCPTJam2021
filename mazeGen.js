/**
 * MazeRand class - returns random numbers
 */
class MazeRand{
    base = 101489;
    mod = 18465223057;
    row;
    col;
    prev = 0;

    /**
     * constructs a MazeRand class
     * @param row the current row (one parameter in the random generation)
     * @param col the current column (the other parameters in the random generation)
     * @param optional optional parameters - such as base and modulo
     */
    constructor(row, col, optional){
        this.row = row;
        this.col = col;
        if(optional){
            this.base = optional["base"]
            this.mod = optional["mod"]
        }
    }

    /**
     * returns a random number from 0...1 based on the row, column, and current index
     */
    mazeRand(){
        let b=this.base, m=this.mod, r=this.row, c=this.col; // shorthands for base and mod
        // transform this.prev to get next number
        this.prev = (((this.prev << 12) % m * b - 123781232343 + 32849 * r % m - 3478278 * c % m) % m + m) % m;
        this.prev = (this.prev + r % m * b % m * b % m + c % m * b % m) % m;
        return this.prev / m;
    }
}

/**
 * creates a new maze
 * note: mazes are compatible with each other - this means that they can always be placed side by side
 *      This is because the function returns mazes in terms of nodes, so they can be placed beside a previous node
 * @param rows number of rows
 * @param cols number of columns
 * @param rGen A MazeRand object for creating random numbers
 * @return maze 3D boolean array
 *      (returned array)[row][column][direction] -> whether or not there is a wall in the direction from (row, column)
 *      for directions, 0: left, 1: up, 2: right, 4: down
 */
function newMaze(rows, cols, rGen){
    let curRI = 0; // current random (index)
}
