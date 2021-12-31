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
        this.topwallfull = false;
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
    drawFloor() {
        // draw the floor
        image(this.type.textures["0000"],this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
    }
    drawWalls() {
        // draw each wall
        litscreen.strokeWeight(2);
        litscreen.stroke(255);
        const player = curState.world.curPlayer;
        this.topwallfull = false;
        const playerunder = (player.y+player.height > this.y*Tile.HEIGHT);
        if (this.walls[1]) { // if tile has top wall
            const texture = this.type.textures[wallMap[1]];
            const nexttile = playerunder && player.x < (this.x+1)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x+1)*Tile.WIDTH && curState.world.getTile(this.x+1,this.y).walls[1];
            const prevtile = playerunder && player.x < (this.x-1)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x-1)*Tile.WIDTH && curState.world.getTile(this.x-1,this.y).walls[1];
            const thistile = playerunder && player.x < (this.x)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x)*Tile.WIDTH;
            const thisblockedr = player.x > this.x * Tile.WIDTH + Tile.WIDTH && (curState.world.getTile(this.x, this.y-1).walls[2]);
            const thisblockedl = player.x < this.x * Tile.WIDTH && (curState.world.getTile(this.x, this.y-1).walls[0]);
            const playerfar = ((abs(player.x) - abs(this.x*Tile.WIDTH+Tile.WIDTH/2)) + (abs(player.y) - abs(this.y*Tile.HEIGHT+Tile.HEIGHT/2))) > Tile.WIDTH*2;
            if ((thistile || nexttile || prevtile) || ((thisblockedl || thisblockedr) && playerunder) || (playerfar && playerunder)) { // tile is behind player
                this.topwallfull = true;
                image(texture,this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                // if the wall to the left is disabled
                if (!curState.world.getTile(this.x-1,this.y).walls[1]) {
                    litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT-20, this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT-20); // left side
                }
                // if the wall to the right is disabled
                if (!curState.world.getTile(this.x+1,this.y).walls[1]) {
                    litscreen.line(this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT-20, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT-20); // right side
                }
                litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT); // top side side
            }
        }
        if (this.walls[0]) { // if tile has left wall
            const texture = this.type.textures[wallMap[0]];
            if (this.walls[1]) { // if the top wall is active
                if (this.topwallfull) { // if the full top wall is being drawn
                    image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
            if (!curState.world.getTile(this.x,this.y+1).topwallfull) { // if the tile beneath has an active top wall
                image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                if (player.x < this.x * Tile.WIDTH) {
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
        }
        if (this.walls[2]) { // if tile has right wall
            const texture = this.type.textures[wallMap[2]];
            if (this.walls[1]) { // if the top wall is active
                if (this.topwallfull) { // if the full top wall is being drawn
                    image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
            if (!curState.world.getTile(this.x,this.y+1).topwallfull) { // if the tile beneath doesnt have an active top wall
                image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                if (player.x > this.x * Tile.WIDTH + Tile.WIDTH ) {
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
        }
        if (this.walls[3]) { // if tile has bottom wall
            const texture = this.type.textures[wallMap[3]];
            image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
            if (!curState.world.getTile(this.x,this.y+1).topwallfull) { // if the tile below isnt using a full top wall
                if (player.y < this.y*Tile.HEIGHT+Tile.HEIGHT) {
                    litscreen.line(this.x*Tile.WIDTH+1,(this.y)*Tile.HEIGHT+Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH-2,(this.y)*Tile.HEIGHT+Tile.HEIGHT); //bottom side
                } else {
                    litscreen.line(this.x*Tile.WIDTH+1,(this.y)*Tile.HEIGHT+Tile.HEIGHT-20, this.x*Tile.WIDTH+Tile.WIDTH-2,(this.y)*Tile.HEIGHT+Tile.HEIGHT-20); //bottom side
                }
            }
        }
    }
}
