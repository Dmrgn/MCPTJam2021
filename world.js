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

    probabilities = [
        ["coal", 0.1],
        ["gem", 0.1],
        ["stone", 0.1],
        ["feather", 0.1],
        ["stick", 0.1]
    ]
    spawnSeed;

    constructor(seed) {
        this.camera = new Camera(0, 0);
        this.maze = new Maze(10, seed);
        this.curPlayer = new Player(new PlayerData(100), 20, 20, this.playerTime);
        this.entities = new Set([this.curPlayer]);
        tileController.setWorld(this);
        this.coldness = 1 / frameRate();
        this.tiles = new Map();
        this.chunks = new Set();

        this.spawnSeed = Math.floor(Math.random() * 127833219183);
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
            for (let i = 0; i < 4; i += 2) valid[i] = max(valid[i], bounds[i]);
            for (let i = 1; i < 4; i += 2) valid[i] = min(valid[i], bounds[i]);
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

    tick() {
        if (keyIsDown(87)) this.move(this.curPlayer, 0, -5);
        if (keyIsDown(65)) this.move(this.curPlayer, -5, 0);
        if (keyIsDown(83)) this.move(this.curPlayer, 0, 5);
        if (keyIsDown(68)) this.move(this.curPlayer, 5, 0);
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

    render() {
        litscreen.background(0);
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
        litscreen.pop();

        let [sx, sy] = this.camera.toScreen(this.curPlayer.x + this.curPlayer.width / 2,
            this.curPlayer.y + this.curPlayer.height / 2);
        runShader(sx, sy);
    }

    strOf(x, y){
        return x + " " + y;
    }

    createEl(type, x, y){
        if(type === "coal"){
            this.addEntity(new Coal(x, y, this, 30));
        } else if(type === "gem"){
            this.addEntity(new Gem(x, y, 1, this));
        } else if(type === "stone"){
            this.addEntity(new Stone(x, y, 5, this));
        } else if(type === "feather"){
            this.addEntity(new Feather(x, y, 5, this));
        } else if(type === "stick"){
            this.addEntity(new Stick(x, y, 5, this));
        }
    }

    newChunk(x, y){
        console.assert(!this.chunks.has(this.strOf(x, y)));
        let [r, c] = [y, x];
        let room = this.maze.newChunk(r, c);
        for(let cx = x * this.maze.chunkSize; cx < (x + 1) * this.maze.chunkSize; cx++){
            for(let cy = y * this.maze.chunkSize; cy < (y + 1) * this.maze.chunkSize; cy++){
                this.tiles.set(this.strOf(cx, cy), new Tile(cx, cy, tileController.tileData.brick, this.maze.getTile(cx, cy)));
                let randNum = new MazeRand(cx, cy, this.spawnSeed).rand();
                for(let el of this.probabilities){
                    randNum -= el[1];
                    if(randNum <= 0){
                        this.createEl(el[0], cx * Tile.WIDTH + Tile.WIDTH / 2, cy * Tile.HEIGHT + Tile.HEIGHT / 2);
                        break;
                    }
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
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
    alterMatrix() {
        push();
        translate(-this.x, -this.y);
        litscreen.push();
        litscreen.translate(-this.x, -this.y);
    }
    toWorld(x, y) {
        return [x + this.x, y + this.y];
    }
    toScreen(x, y){
        return [x - this.x, y - this.y];
    }
}
