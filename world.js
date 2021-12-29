class World {
    camera;
    maze;
    curPlayer;
    coldness;
    playerTime = 500;

    constructor(seed){
        this.camera = new Camera(0, 0);
        this.maze = new Maze(10, seed);
        this.curPlayer = new Player(new PlayerData(100), 20, 20, this.playerTime);
        tileController.setMaze(this.maze);
        this.coldness = 0.002;
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
        if(keyIsDown(87)) this.move(this.curPlayer, 0, -5);
        if(keyIsDown(65)) this.move(this.curPlayer, -5, 0);
        if(keyIsDown(83)) this.move(this.curPlayer, 0, 5);
        if(keyIsDown(68)) this.move(this.curPlayer, 5, 0);
        this.camera.x = this.curPlayer.x - width / 2;
        this.camera.y = this.curPlayer.y - height / 2;
        tileController.prepareRendered(floor((this.curPlayer.x + this.curPlayer.width / 2) / Tile.WIDTH),
            floor((this.curPlayer.y + this.curPlayer.height / 2) / Tile.HEIGHT));
        if(this.curPlayer.reduceTimer(this.coldness)){
            changeState(new FadeState(this, new MainMenuState()));
        }
        this.coldness += 0.001;
    }

    render(){
        this.camera.alterMatrix();
        tileController.drawTiles();
        this.curPlayer.render();
        pop();
        fill(0, 0, 0, 0);
        stroke(255);
        strokeWeight(2);
        rect(10, 10, 200, 20);
        fill(255, 0, 0);
        print(this.curPlayer.timeLeft);
        rect(10, 10, 200 * this.curPlayer.timeLeft / this.playerTime, 20);
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
