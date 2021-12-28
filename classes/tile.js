// A class to hold an individual cell in the grid which makes up the map
class Tile {
    // width and height of each tile
    static WIDTH = 128;
    static HEIGHT = 128;
    static WALL_WIDTH = Tile.WIDTH / 10;
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
        this.walls.forEach((wall,index) => {
            if (wall) { // if this tile has a wall on this side
                const texture = this.type.textures[wallMap[index]];
                image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
            }
        });
    }
    // checks for collision
    wallCollide(entity){
        let [cx, cy] = [this.x, this.y];
        return this.walls[0] && entity.isTouching(new Entity(cx, cy, Tile.WALL_WIDTH, Tile.HEIGHT))
        || this.walls[1] && entity.isTouching(new Entity(cx, cy, Tile.WIDTH, Tile.WALL_WIDTH))
        || this.walls[2] && entity.isTouching(new Entity(cx + Tile.WIDTH - Tile.WALL_WIDTH, cy, Tile.WALL_WIDTH, Tile.HEIGHT))
        || this.walls[3] && entity.isTouching(new Entity(cx, cy + Tile.HEIGHT - Tile.WALL_WIDTH, Tile.WIDTH, Tile.WALL_WIDTH));
    }
}
