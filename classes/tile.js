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
        this.updateWalls(_walls)
    }
    updateWalls(walls){
        let [rx, ry] = [this.x * Tile.WIDTH, this.y * Tile.HEIGHT];
        this.walls = walls;
        this.wallEntities = []
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
        litscreen.strokeWeight(8);
        litscreen.stroke(255);
        const player = curState.world.curPlayer;
        this.walls.forEach((wall,index) => {
            if (wall) { // if this tile has a wall on this side
                const texture = this.type.textures[wallMap[index]];
                if (false) {

                } else {
                    if (index == 1) { //this is backwall
                        const wl = {x:this.x*Tile.WIDTH, y:this.y*Tile.HEIGHT};
                        const wr = {x:(this.x+Tile.WIDTH)*Tile.WIDTH, y:this.y*Tile.HEIGHT};
                        const diffl = {x:abs(player.x+player.width/2-wl.x),y:abs(player.y+player.height-wl.y)};
                        const diffr = {x:abs(player.x+player.width/2-wr.x),y:abs(player.y+player.height-wr.y)};
                        const diff = (diffl.x+diffl.y) > (diffr.x+diffr.y) ? diffr : diffl;
                        // console.log(diff);
                        if ((diff.x < diff.y) && (player.y+player.height > this.y*Tile.HEIGHT)) { // tile is behind player
                            image(texture,this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                            // if the wall to the left is disabled
                            // const getTile = curState.world.getTile;
                            if (!curState.world.getTile(this.x-1,this.y).walls[2]) {
                                litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT); // left side
                            }
                            if (!curState.world.getTile(this.x+1,this.y).walls[0]) {
                                litscreen.line(this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT); // right side
                            }
                            litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT); // top side side
                        }
                    } else { // this is a side or front wall
                        image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                        litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                    }
                }
            }
        });
    }
}
