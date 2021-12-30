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
    draw() {
        // draw the floor
        image(this.type.textures["0000"],this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        // draw each wall
        litscreen.strokeWeight(2);
        litscreen.stroke(255);
        const player = curState.world.curPlayer;
        // this.walls.forEach((wall,index) => {
        //     let mouseworld = [player.x,player.y];
        //     let playertile = curState.world.getTile(floor(mouseworld[0]/Tile.WIDTH), floor(mouseworld[1]/Tile.HEIGHT));
        //     if (this.x == playertile.x && this.y == playertile.y) {
        //         console.log(this);
        //     }
        //     if (wall) { // if this tile has a wall on this side
        //         const texture = this.type.textures[wallMap[index]];
        //         if (false) {

        //         } else {
        //             if (index == 1) { //this is backwall
        //                 if ((player.y+player.height > this.y*Tile.HEIGHT)) { // tile is behind player
        //                     image(texture,this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        //                     // if the wall to the left is disabled
        //                     // const getTile = curState.world.getTile;
        //                     if (!curState.world.getTile(this.x-1,this.y).walls[2]) {
        //                         litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT); // left side
        //                     }
        //                     if (!curState.world.getTile(this.x+1,this.y).walls[0]) {
        //                         litscreen.line(this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT); // right side
        //                     }
        //                     litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT); // top side side
        //                 }
        //             } else {
        //                 if (index == 3) { // this is a front wall

        //                 } else { // this is a side wall
        //                     if (this.walls[1]) { // if the top wall is active
        //                         if ((player.y+player.height > this.y*Tile.HEIGHT)) { // if the full top wall is being drawn
        //                             image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        //                             litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        //                         }
        //                     }
        //                     image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        //                     litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
        //                 }
        //             }
        //         }
        //     }
        // });
        this.topwallfull = false;
        if (this.walls[1]) { // if tile has top wall
            const texture = this.type.textures[wallMap[1]];
            const nexttile = (player.y+player.height > this.y*Tile.HEIGHT) && player.x < (this.x+1)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x+1)*Tile.WIDTH && curState.world.getTile(this.x+1,this.y).walls[1];
            const prevtile = (player.y+player.height > this.y*Tile.HEIGHT) && player.x < (this.x-1)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x-1)*Tile.WIDTH && curState.world.getTile(this.x-1,this.y).walls[1];
            const thistile = (player.y+player.height > this.y*Tile.HEIGHT) && player.x < (this.x)*Tile.WIDTH+Tile.WIDTH && player.x > (this.x)*Tile.WIDTH;
            if (thistile || nexttile || prevtile) { // tile is behind player
                this.topwallfull = true;
                image(texture,this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                // if the wall to the left is disabled
                if (!curState.world.getTile(this.x-1,this.y).walls[1]) {
                    litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT-20, this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT-20); // left side
                }
                if (!curState.world.getTile(this.x+1,this.y).walls[1]) {
                    litscreen.line(this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT-20, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT+Tile.HEIGHT-20); // right side
                }
                litscreen.line(this.x*Tile.WIDTH,(this.y-1)*Tile.HEIGHT, this.x*Tile.WIDTH+Tile.WIDTH,(this.y-1)*Tile.HEIGHT); // top side side
            }
        }
        if (this.walls[0]) { // if tile has left wall
            const texture = this.type.textures[wallMap[0]];
            if (this.walls[1]) { // if the top wall is active
                if ((player.y+player.height > this.y*Tile.HEIGHT)) { // if the full top wall is being drawn
                    image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
            if (!curState.world.getTile(this.x,this.y+1).topwallfull) { // if the tile beneath has an active top wall
                image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
            }
        }
        if (this.walls[2]) { // if tile has right wall
            const texture = this.type.textures[wallMap[2]];
            if (this.walls[1]) { // if the top wall is active
                if ((player.y+player.height > this.y*Tile.HEIGHT)) { // if the full top wall is being drawn
                    image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                    litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT-Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                }
            }
            if (!curState.world.getTile(this.x,this.y+1).topwallfull) { // if the tile beneath has an active top wall
                image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
                litscreen.image(texture,this.x*Tile.WIDTH,this.y*Tile.HEIGHT,Tile.WIDTH,Tile.HEIGHT);
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
