class World {
    camera;
    maze;
    curPlayer;

    constructor(seed){
        this.camera = new Camera(0, 0);
        this.maze = new Maze(10, seed);
        this.curPlayer = new Player(new PlayerData(100), 20, 20);
    }
    move(toMove, x, y) {
        let tiles = [];
        for (let tx = floor((toMove.x - abs(x)) / Tile.WIDTH) - 2; tx <= floor((toMove.x + toMove.width + abs(x)) / Tile.WIDTH) + 2; tx++) {
            for (let ty = floor((toMove.y - abs(y)) / Tile.HEIGHT) - 2; ty <= floor((toMove.y + toMove.height + abs(y)) / Tile.HEIGHT) + 2; ty++) {
                tiles.push(new Tile(tx, ty, tileController.tileData.brick, this.maze.getTile(tx, ty)));
            }
        }
        let valid = [-Infinity, Infinity, -Infinity, Infinity];
        tiles.forEach((tile) => tile.wallEntities.forEach((el) => {
            let bounds = toMove.valid(el);
            for(let i = 0; i < 4; i += 2) valid[i] = max(valid[i], bounds[i]);
            for(let i = 1; i < 4; i += 2) valid[i] = min(valid[i], bounds[i]);
        }));
        toMove.x += min(max(valid[0], x), valid[1]);
        toMove.y += min(max(valid[2], y), valid[3]);
    }

    tick(){
        if(keyIsDown(87)) this.move(this.curPlayer, 0, -10);
        if(keyIsDown(65)) this.move(this.curPlayer, -10, 0);
        if(keyIsDown(83)) this.move(this.curPlayer, 0, 10);
        if(keyIsDown(68)) this.move(this.curPlayer, 10, 0);
        this.camera.x = this.curPlayer.x - width / 2;
        this.camera.y = this.curPlayer.y - height / 2;
        let [wmx, wmy] = this.camera.toWorld(mouseX, mouseY);
        tileController.preparePerimeter(floor(wmx / Tile.WIDTH), floor(wmy / Tile.HEIGHT), 5, this.maze);
        tileController.prepareRendered(floor(wmx / Tile.WIDTH), floor(wmy / Tile.HEIGHT));
    }

    render(){
        this.camera.alterMatrix();
        tileController.drawTiles();
        this.curPlayer.render();
        pop();
    }
}

class Camera {
    x;
    y;
    constructor(_x, _y){
        this.x = _x;
        this.y = _y;
    }
    alterMatrix(){
        push();
        translate(-this.x, -this.y);
    }
    toWorld(x, y){
        return [x + this.x, y + this.y];
    }
}
