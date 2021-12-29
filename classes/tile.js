// A class to hold an individual cell in the grid which makes up the map
class Tile {
    // width and height of each tile
    static WIDTH = 128;
    static HEIGHT = 128;
    static WALL_WIDTH = Tile.WIDTH / 10;

    wallEntities;
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
        this.wallEntities = []
        let [rx, ry] = [this.x * Tile.WIDTH, this.y * Tile.HEIGHT];
        if(this.walls[0]) this.wallEntities.push(new Entity(rx, ry, Tile.WALL_WIDTH, Tile.HEIGHT));
        if(this.walls[1]) this.wallEntities.push(new Entity(rx, ry, Tile.WIDTH, Tile.WALL_WIDTH));
        if(this.walls[2]) this.wallEntities.push(new Entity(rx + Tile.WIDTH - Tile.WALL_WIDTH, ry, Tile.WALL_WIDTH, Tile.HEIGHT));
        if(this.walls[3]) this.wallEntities.push(new Entity(rx, ry + Tile.HEIGHT - Tile.WALL_WIDTH, Tile.WIDTH, Tile.WALL_WIDTH));
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
                litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
            }
        });
    }
}
