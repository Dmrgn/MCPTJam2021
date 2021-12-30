class World {
    camera;
    maze;
    curPlayer;
    static interactRadius = 50;

    // coldness dictates the speed at which the player loses time
    coldness;

    // starting time
    playerTime = 900;

    // map of entities - entities[cur chunk] = {entities in chunk as a set}
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
        this.entities = new Map();
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
        this.removeEntity(toMove);
        for(let entity of this.getEntitiesAround(toMove)){
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
        this.addEntity(toMove);
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
        for(let entity of this.getEntitiesAround(this.curPlayer)){
            if(this.curPlayer.isTouching(entity)){
                this.curPlayer.onTouch(entity);
                entity.onTouch(this.curPlayer);
            }
        }
    }

    entityInChunks(sx, sy, ex, ey){
        let toRet = new Set();
        for(let x = sx; x <= ex; x++){
            for(let y = sy; y <= ey; y++){
                if(this.entities.has(this.strOf(x, y))){
                    for(let entity of this.entities.get(this.strOf(x, y))){
                        toRet.add(entity);
                    }
                }
            }
        }
        return toRet;
    }

    render() {
        litscreen.background(0);
        this.camera.alterMatrix();
        tileController.drawTiles();
        this.curPlayer.render();

        let [chunkL, chunkT] = this.getChunk(this.camera.toWorld(0, 0)[0], this.camera.toWorld(0, 0)[1]);
        let [chunkR, chunkB] = this.getChunk(this.camera.toWorld(width, height)[0], this.camera.toWorld(width, height)[1]);
        for(let entity of this.entityInChunks(chunkL - 1, chunkT - 1, chunkR + 1, chunkB + 1)){
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
        // runShader(sx, sy);
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

    getChunk(x, y){
        return [Math.floor(x / Tile.WIDTH / this.maze.chunkSize), Math.floor(y / Tile.HEIGHT / this.maze.chunkSize)]
    }

    addEntity(toAdd){
        let [sx, sy] = this.getChunk(toAdd.x, toAdd.y)
        let [ex, ey] = this.getChunk(toAdd.x + toAdd.width, toAdd.y + toAdd.height);
        for(let x = sx; x <= ex; x++){
            for(let y = sy; y <= ey; y++){
                let of = this.strOf(x, y);
                if(!this.entities.has(of)) this.entities.set(of, new Set())
                this.entities.get(of).add(toAdd);
            }
        }
    }

    getEntitiesAround(query){
        let xPerChunk = Tile.WIDTH * this.maze.chunkSize;
        let yPerChunk = Tile.HEIGHT * this.maze.chunkSize;
        return this.entityInChunks(Math.floor(query.x / xPerChunk - 1), Math.floor(query.y / xPerChunk - 1),
            Math.floor((query.x + query.width) / yPerChunk + 1), Math.floor((query.y + query.height) / yPerChunk + 1));
    }

    removeEntity(toRemove){
        let [sx, sy] = this.getChunk(toRemove.x, toRemove.y)
        let [ex, ey] = this.getChunk(toRemove.x + toRemove.width, toRemove.y + toRemove.height);
        for(let x = sx - 1; x <= ex + 1; x++) {
            for (let y = sy - 1; y <= ey + 1; y++) {
                if (this.entities.has(this.strOf(x, y))) {
                    this.entities.get(this.strOf(x, y)).delete(toRemove);
                }
            }
        }
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

    dist(a, b){
        return dist((b.x + b.width) / 2, (b.y + b.height) / 2, (a.x + a.width) / 2, (a.y + a.height) / 2);
    }

    closestInteract(cur){
        let closestEntity = undefined;
        for(let entity of this.getEntitiesAround(cur)){
            if(entity.canInteract && entity !== cur &&
                (!closestEntity || this.dist(this.curPlayer, entity) < this.dist(this.curPlayer, closestEntity))){
                closestEntity = entity;
            }
        }
        return closestEntity;
    }

    interact(){
        let closest = this.closestInteract(this.curPlayer);
        if(closest && this.dist(this.curPlayer, closest) <= World.interactRadius){
            closest.onInteract(this.curPlayer)
        }
    }

    drawInteract(){
        let closest = this.closestInteract(this.curPlayer);
        if(closest && this.dist(this.curPlayer, closest) <= World.interactRadius){
            fill(0);
            noStroke();
            textAlign(CENTER);
            text("Press 'g' to interact", closest.x - 100, closest.y - 10, closest.width + 200);
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
