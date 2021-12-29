class World {
    camera;
    maze;
    curPlayer;
    static interactRadius = 50;

    // coldness dictates the speed at which the player loses time
    coldness;

    // starting time
    playerTime = 900;

    // list of entities
    entities;

    // second map of tiles - this time with actual tiles
    tiles;
    chunks;

    coalSeed;
    static coalProb = 0.1;
    gemSeed;
    static gemProb = 0.1;

    constructor(seed){
        this.camera = new Camera(0, 0);
        this.maze = new Maze(10, seed);
        this.curPlayer = new Player(new PlayerData(100), 20, 20, this.playerTime);
        this.entities = new Set([this.curPlayer]);
        tileController.setWorld(this);
        this.coldness = 1 / frameRate();
        this.tiles = new Map();
        this.chunks = new Set();

        this.coalSeed = Math.floor(Math.random() * 817238721879312);
        this.gemSeed = Math.floor(Math.random() * 817238721879312);
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
        for(let entity of this.entities){
            if(entity !== toMove){
                let hasLayer = false;
                for(let tag of toMove.layers){
                    hasLayer = hasLayer || entity.layers.includes(tag);
                }
                if(hasLayer){
                    let bounds = toMove.valid(entity);
                    for(let i = 0; i < 4; i += 2) valid[i] = max(valid[i], bounds[i]);
                    for(let i = 1; i < 4; i += 2) valid[i] = min(valid[i], bounds[i]);
                }
            }
        }
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
        for(let entity of this.entities){
            if(this.curPlayer.isTouching(entity)){
                this.curPlayer.onTouch(entity);
                entity.onTouch(this.curPlayer);
            }
        }
    }

    render(){
        this.camera.alterMatrix();
        tileController.drawTiles();
        this.curPlayer.render();
        for(let entity of this.entities){
            entity.render();
        }
        fill(0);
        noStroke();
        for(let cx = Math.floor(this.camera.x / Tile.WIDTH) - 1; cx <= Math.floor((this.camera.x + width) / Tile.WIDTH) + 3; cx++){
            for(let cy = Math.floor(this.camera.y / Tile.HEIGHT) - 1; cy <= Math.floor((this.camera.y + height) / Tile.HEIGHT) + 3; cy++) {
                let toRender = false;
                for(let tile of renderedTiles){
                    toRender = toRender || tile.x === cx && tile.y === cy;
                }
                if(!toRender){
                    rect(cx * Tile.WIDTH, cy * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
                }
            }
        }
        this.drawInteract();
        pop();
    }

    strOf(x, y){
        return x + " " + y;
    }

    newChunk(x, y){
        console.assert(!this.chunks.has(this.strOf(x, y)));
        let [r, c] = [y, x];
        let room = this.maze.newChunk(r, c);
        for(let cx = x * this.maze.chunkSize; cx < (x + 1) * this.maze.chunkSize; cx++){
            for(let cy = y * this.maze.chunkSize; cy < (y + 1) * this.maze.chunkSize; cy++){
                this.tiles.set(this.strOf(cx, cy), new Tile(cx, cy, tileController.tileData.brick, this.maze.getTile(cx, cy)));
                if(new MazeRand(cx, cy, this.coalSeed).rand() < World.coalProb){
                    this.addEntity(new Coal(cx * Tile.WIDTH + Tile.WIDTH / 2, cy * Tile.HEIGHT + Tile.HEIGHT / 2, 10, 10, this, 20));
                }
                if(new MazeRand(cx, cy, this.gemSeed).rand() < World.gemProb){
                    this.addEntity(new Gemstone(cx * Tile.WIDTH + Tile.WIDTH / 3, cy * Tile.HEIGHT + Tile.HEIGHT / 3, 10, 10, 1, this));
                }
            }
        }
        if(room){
            let [rx, ry] = [room[1], room[0]];
            room[2].fillRoom(this, rx, ry);
        }
        this.chunks.add(this.strOf(x, y));
    }

    syncTile(x, y){
        console.assert(this.tiles.has(this.strOf(x, y)))
        this.tiles.get(this.strOf(x, y)).walls = this.maze.getTile(x, y);
    }

    addEntity(toAdd){
        this.entities.add(toAdd);
    }

    removeEntity(toRemove){
        this.entities.delete(toRemove);
    }

    getTile(x, y){
        if(!this.tiles.has(this.strOf(x, y))){
            // make sure the chunks around the current tile exist
            let [cx, cy] = [Math.floor(x / this.maze.chunkSize), Math.floor(y / this.maze.chunkSize)]
            for(let ax = cx - 1; ax <= cx + 1; ax++){
                for(let ay = cy - 1; ay <= cy + 1; ay++){
                    if (!this.chunks.has(this.strOf(ax, ay))) {
                        this.newChunk(ax, ay);
                    }
                }
            }
        }
        this.syncTile(x, y);
        return this.tiles.get(this.strOf(x, y));
    }

    canInteract(a, b){
        return dist((b.x + b.width) / 2, (b.y + b.height) / 2,
        (a.x + a.width) / 2, (a.y + a.height) / 2) <= World.interactRadius;
    }

    interact(){
        for(let entity of this.entities){
            if(entity.canInteract && this.canInteract(this.curPlayer, entity)){
                entity.onInteract(this.curPlayer);
                return;
            }
        }
    }

    drawInteract(){
        for(let entity of this.entities){
            if(entity.canInteract && this.canInteract(this.curPlayer, entity)){
                fill(0);
                noStroke();
                textAlign(CENTER);
                text("Press 'g' to interact", entity.x - 100, entity.y - 10, entity.width + 200)
                return;
            }
        }
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
