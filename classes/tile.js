// A class to hold an individual cell in the grid which makes up the map
class Tile {
    // width and height of each tile
    static WIDTH = 128;
    static HEIGHT = 128;
    // constructor
    constructor(_x, _y, _type, _walls) {
        this.x = _x;
        this.y = _y;
        // what type of tile this is
        // see TileController init function
        this.type = _type;
        // left top right and bottom
        // wall values respectively
        this.walls = _walls;
    }
    // draw this tile to the screen
    draw() {
        // draw the floor
        image(this.type.textures["0000"],this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        // draw each wall
        // this.walls.forEach((wall,index) => {
        //     if (wall) { // if this tile has a wall on this side
        //         const texture = this.type.textures[wallMap[index]];
        //         const offset = index == 1 ? -Tile.HEIGHT : 0;
        //         image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT+offset,Tile.WIDTH,Tile.HEIGHT);
        //     }
        // });
        // draw left wall
        if (this.walls[0]) {
            let texture = this.type.textures[wallMap[0]];
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-128,Tile.WIDTH,Tile.HEIGHT);
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        }
        // draw top wall
        if (this.walls[0]) {
            let texture = this.type.textures[wallMap[1]];
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-128,Tile.WIDTH,Tile.HEIGHT);
        }
        // draw right wall
        if (this.walls[0]) {
            let texture = this.type.textures[wallMap[2]];
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-128,Tile.WIDTH,Tile.HEIGHT);
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        }
        // draw bottom wall
        if (this.walls[0]) {
            let texture = this.type.textures[wallMap[3]];
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        }

    }
}
