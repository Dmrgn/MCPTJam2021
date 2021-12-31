const useShader = true;

class World {
    camera;
    entities;

    tiles;
    chunks;

    curPlayer;
    shader;
    static ZOOM = 1.2;

    constructor(playerData, px, py, shader) {
        this.camera = new Camera(0, 0, World.ZOOM);
        this.curPlayer = new Player(playerData, this, px, py);
        this.entities = new Map();
        this.addEntity(this.curPlayer);
        tileController.setWorld(this);
        this.tiles = new Map();
        this.chunks = new Set();
        this.shader=shader;
    }

    move(toMove, x, y) {
        let tiles = this.getTilesAround(toMove, x, y);
        let valid = [-Infinity, Infinity, -Infinity, Infinity];
        tiles.forEach((tile) => tile.wallEntities.forEach((el) => {
            let bounds = toMove.valid(el);
            if (toMove.willHit(el, x, y)) {
                el.onTouch(toMove);
                toMove.onTouch(el);
            }
            for (let i = 0; i < 4; i += 2) valid[i] = max(valid[i], bounds[i]);
            for (let i = 1; i < 4; i += 2) valid[i] = min(valid[i], bounds[i]);
        }));
        for (let entity of this.getEntitiesAround(toMove)) {
            if (entity !== toMove) {
                if (toMove.willHit(entity, x, y)) {
                    entity.onTouch(toMove);
                    toMove.onTouch(entity);
                }
                let hasLayer = false;
                for (let tag of toMove.layers) {
                    hasLayer = hasLayer || entity.layers.includes(tag);
                }
                if (hasLayer) {
                    let bounds = toMove.valid(entity);
                    for (let i = 0; i < 4; i += 2) valid[i] = max(valid[i], bounds[i]);
                    for (let i = 1; i < 4; i += 2) valid[i] = min(valid[i], bounds[i]);
                }
            }
        }
        toMove.x += min(max(valid[0], x), valid[1]);
        toMove.y += min(max(valid[2], y), valid[3]);
    }

    getChunk(x, y) {
        return [Math.floor(x / Tile.WIDTH / Maze.CHUNKSIZE), Math.floor(y / Tile.HEIGHT / Maze.CHUNKSIZE)]
    }

    addEntity(toAdd) {
        let [sx, sy] = this.getChunk(toAdd.x, toAdd.y)
        let [ex, ey] = this.getChunk(toAdd.x + toAdd.width, toAdd.y + toAdd.height);
        for (let x = sx; x <= ex; x++) {
            for (let y = sy; y <= ey; y++) {
                let of = this.strOf(x, y);
                if (!this.entities.has( of )) this.entities.set( of , new Set())
                this.entities.get( of ).add(toAdd);
            }
        }
    }

    getTilesAround(query, x, y){
        let tiles = [];
        for (let tx = floor((query.x - abs(x)) / Tile.WIDTH) - 2; tx <= floor((query.x + query.width + abs(x)) / Tile.WIDTH) + 2; tx++) {
            for (let ty = floor((query.y - abs(y)) / Tile.HEIGHT) - 2; ty <= floor((query.y + query.height + abs(y)) / Tile.HEIGHT) + 2; ty++) {
                tiles.push(this.getTile(tx, ty));
            }
        }
        return tiles;
    }

    inTile(toAdd){
        let tiles = this.getTilesAround(toAdd, 0, 0);
        let can = false;
        tiles.forEach((tile) => tile.wallEntities.forEach((el) => {
            if(el.isTouching(toAdd)) can = can || true;
        }));
        return can;
    }

    getEntitiesAround(query) {
        let xPerChunk = Tile.WIDTH * Maze.CHUNKSIZE;
        let yPerChunk = Tile.HEIGHT * Maze.CHUNKSIZE;
        return this.entityInChunks(Math.floor(query.x / xPerChunk - 1), Math.floor(query.y / xPerChunk - 1),
            Math.floor((query.x + query.width) / yPerChunk + 1), Math.floor((query.y + query.height) / yPerChunk + 1));
    }

    removeEntity(toRemove) {
        let [sx, sy] = this.getChunk(toRemove.x, toRemove.y)
        let [ex, ey] = this.getChunk(toRemove.x + toRemove.width, toRemove.y + toRemove.height);
        for (let x = sx - 1; x <= ex + 1; x++) {
            for (let y = sy - 1; y <= ey + 1; y++) {
                if (this.entities.has(this.strOf(x, y))) {
                    this.entities.get(this.strOf(x, y)).delete(toRemove);
                }
            }
        }
    }

    dist(a, b) {
        return dist((b.x + b.width) / 2, (b.y + b.height) / 2, (a.x + a.width) / 2, (a.y + a.height) / 2);
    }

    closestInteract(cur) {
        let closestEntity = undefined;
        for (let entity of this.getEntitiesAround(cur)) {
            if (entity.canInteract && entity !== cur &&
                (!closestEntity || this.dist(this.curPlayer, entity) < this.dist(this.curPlayer, closestEntity))) {
                closestEntity = entity;
            }
        }
        return closestEntity;
    }

    interact() {
        let closest = this.closestInteract(this.curPlayer);
        if (closest && this.dist(this.curPlayer, closest) <= ExplorationWorld.interactRadius) {
            closest.onInteract(this.curPlayer)
        }
    }

    drawInteract() {
        let closest = this.closestInteract(this.curPlayer);
        if (closest && this.dist(this.curPlayer, closest) <= ExplorationWorld.interactRadius) {
            fill(255);
            textSize(10);
            textFont(getFont("roboto"));
            noStroke();
            textAlign(CENTER);
            text("Press 'g' to interact", closest.x - 100, closest.y - 10, closest.width + 200);
        }
    }

    switchWeapon() {
        this.curPlayer.switchWeapon(1);
    }

    entityInChunks(sx, sy, ex, ey) {
        let toRet = new Set();
        for (let x = sx; x <= ex; x++) {
            for (let y = sy; y <= ey; y++) {
                if (this.entities.has(this.strOf(x, y))) {
                    for (let entity of this.entities.get(this.strOf(x, y))) {
                        toRet.add(entity);
                    }
                }
            }
        }
        return toRet;
    }

    centerCamera() {
        this.camera.x = this.curPlayer.x + this.curPlayer.width / 2 - width / 2;
        this.camera.y = this.curPlayer.y + this.curPlayer.width / 2 - height / 2;
    }

    strOf(x, y) {
        return x + " " + y;
    }

    movePlayer() {
        if (keyIsDown(87)) this.curPlayer.move(0, -1);
        if (keyIsDown(65)) this.curPlayer.move(-1, 0);
        if (keyIsDown(83)) this.curPlayer.move(0, 1);
        if (keyIsDown(68)) this.curPlayer.move(1, 0);
    }

    tick() {}
    render() {}
    getTile(x, y) {}
}

class ExplorationWorld extends World {
    maze;

    static interactRadius = 50;

    // coldness dictates the speed at which the player loses time
    coldness;

    probabilities = [
        ["coal", 0.1],
        ["gem", 0.1],
        ["stone", 0.1],
        ["feather", 0.1],
        ["stick", 0.1]
    ]

    constructor(playerData, shader) {
        super(playerData, 20, 20, shader);
        this.maze = new Maze(seed);
        this.coldness = 1 / frameRate();
    }

    tick() {
        this.movePlayer();
        this.centerCamera();
        tileController.prepareRendered(floor((this.curPlayer.x + this.curPlayer.width / 2) / Tile.WIDTH),
            floor((this.curPlayer.y + this.curPlayer.height / 2) / Tile.HEIGHT));
        if (this.curPlayer.damage(this.coldness)) {
            curState.explorationDone();
        }
        this.curPlayer.tick();
        for (let entity of this.getEntitiesAround(this.curPlayer)) {
            entity.tick();
            if (this.curPlayer.isTouching(entity)) {
                this.curPlayer.onTouch(entity);
                entity.onTouch(this.curPlayer);
            }
        }
        this.coldness += 0.00002;
    }

    syncTile(x, y) {
        console.assert(this.tiles.has(this.strOf(x, y)))
        this.tiles.get(this.strOf(x, y)).updateWalls(this.maze.getTile(x, y));
    }

    render() {
        litscreen.background(0);
        this.camera.alterMatrix();
        tileController.drawFloors();
        
        let [chunkL, chunkT] = this.getChunk(this.camera.toWorld(0, 0)[0], this.camera.toWorld(0, 0)[1]);
        let [chunkR, chunkB] = this.getChunk(this.camera.toWorld(width, height)[0], this.camera.toWorld(width, height)[1]);
        for (let entity of this.entityInChunks(chunkL - 2, chunkT - 2, chunkR + 2, chunkB + 2)) {
            entity.render();
        }
        
        tileController.drawWalls();
        this.curPlayer.render();
        
        fill(0);
        noStroke();
        for (let cx = Math.floor(this.camera.x / Tile.WIDTH) - 1; cx <= Math.floor((this.camera.x + width) / Tile.WIDTH) + 3; cx++) {
            for (let cy = Math.floor(this.camera.y / Tile.HEIGHT) - 1; cy <= Math.floor((this.camera.y + height) / Tile.HEIGHT) + 3; cy++) {
                let toRender = false;
                for (let tile of renderedTiles) {
                    toRender = toRender || tile.x === cx && tile.y === cy;
                }
                if (!toRender) {
                    rect(cx * Tile.WIDTH, cy * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
                }
            }
        }
        this.drawInteract();
        pop();
        litscreen.pop();

        let [sx, sy] = this.camera.toScreen(this.curPlayer.x + this.curPlayer.width / 2,
            this.curPlayer.y + this.curPlayer.height / 2);
        if (this?.shader) {
            this.shader.addLight(sx,sy,100,100,100);
        }
        if (useShader) {
            if (frameCount%1 === 0) {
                this.shader.runShader();
            }
            this.shader.pushShader();
        }

    }

    createEl(type, x, y) {
        if (type === "coal") {
            this.addEntity(new Coal(x, y, this, 30));
        } else if (type === "gem") {
            this.addEntity(new Gem(x, y, 1, this));
        } else if (type === "stone") {
            this.addEntity(new Stone(x, y, 5, this));
        } else if (type === "feather") {
            this.addEntity(new Feather(x, y, 5, this));
        } else if (type === "stick") {
            this.addEntity(new Stick(x, y, 5, this));
        }
    }

    newChunk(x, y) {
        console.assert(!this.chunks.has(this.strOf(x, y)));
        let [r, c] = [y, x];
        let room = this.maze.newChunk(r, c);
        for (let cx = x * Maze.CHUNKSIZE; cx < (x + 1) * Maze.CHUNKSIZE; cx++) {
            for (let cy = y * Maze.CHUNKSIZE; cy < (y + 1) * Maze.CHUNKSIZE; cy++) {
                this.tiles.set(this.strOf(cx, cy), new Tile(cx, cy, tileController.tileData.brick, this.maze.getTile(cx, cy)));
                let randNum = new MazeRand(cx, cy, seed).rand();
                for (let el of this.probabilities) {
                    randNum -= el[1];
                    if (randNum <= 0) {
                        this.createEl(el[0], cx * Tile.WIDTH + Tile.WIDTH / 2, cy * Tile.HEIGHT + Tile.HEIGHT / 2);
                        break;
                    }
                }
            }
        }
        if (room) {
            let [rx, ry] = [room[1], room[0]];
            room[2].fillRoom(this, rx, ry);
        }
        this.chunks.add(this.strOf(x, y));
    }

    attack() {
        this.curPlayer.attack();
    }

    getTile(x, y) {
        if (!this.tiles.has(this.strOf(x, y))) {
            // make sure the chunks around the current tile exist
            let [cx, cy] = [Math.floor(x / Maze.CHUNKSIZE), Math.floor(y / Maze.CHUNKSIZE)]
            for (let ax = cx - 1; ax <= cx + 1; ax++) {
                for (let ay = cy - 1; ay <= cy + 1; ay++) {
                    if (!this.chunks.has(this.strOf(ax, ay))) {
                        this.newChunk(ax, ay);
                    }
                }
            }
        }
        this.syncTile(x, y);
        return this.tiles.get(this.strOf(x, y));
    }
}

class BossWorld extends World {
    width;
    height;
    constructor(width, height, playerData, shader) {
        super(playerData, width * Tile.WIDTH / 2, height * Tile.HEIGHT / 2, shader);
        this.width = width;
        this.height = height;
        let hasWall = [] // hasWall[x][y][dir]
        for (let i = 0; i < width; i++) {
            let col = [];
            for (let c = 0; c < height; c++) {
                col.push(new Array(4).fill(false));
            }
            hasWall.push(col);
        }
        for (let i = 0; i < width; i++) {
            hasWall[i][0][1] = true;
            hasWall[i][height - 1][3] = true;
        }
        for (let i = 0; i < height; i++) {
            hasWall[0][i][0] = true;
            hasWall[width - 1][i][2] = true;
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.tiles.set(this.strOf(x, y), new Tile(x, y, tileController.tileData.brick, hasWall[x][y]));
            }
        }
    }

    tick() {
        this.movePlayer();
        let inRange = new Set();
        for (let chunk of this.entities)
            for (let entity of chunk[1]) inRange.add(entity);
        for (let entity of inRange) {
            entity.tick();
        }
        tileController.prepareRendered(floor((this.curPlayer.x + this.curPlayer.width / 2) / Tile.WIDTH),
            floor((this.curPlayer.y + this.curPlayer.height / 2) / Tile.HEIGHT));
        this.centerCamera();
    }

    render() {
        litscreen.background(0);
        this.camera.alterMatrix();
        tileController.drawFloors();
        for (let chunk of this.entities)
            for (let entity of chunk[1]) entity.render();
        pop();
        litscreen.pop();
        tileController.drawWalls();

        let [sx, sy] = this.camera.toScreen(this.curPlayer.x + this.curPlayer.width / 2,
            this.curPlayer.y + this.curPlayer.height / 2);
        this.shader.addLight(sx,sy,100,100,100);
        if (useShader) {
            if (frameCount%1 === 0) {
                this.shader.runShader();
            }
            this.shader.pushShader();
        }
    }

    attack() {
        this.curPlayer.attack();
    }

    getTile(x, y) {
        if (this.tiles.has(this.strOf(x, y))) return this.tiles.get(this.strOf(x, y));
        else return new Tile(x, y, tileController.tileData.brick, [true, true, true, true]);
    }
}

class Camera {
    x;
    y;
    zoom;
    constructor(_x, _y, _zoom) {
        this.x = _x;
        this.y = _y;
        if(!_zoom) this.zoom = 1;
        else this.zoom = _zoom;
    }
    alterMatrix() {
        push();
        let [bx, by] = [this.x + width / 2 - width / 2 / this.zoom, this.y + height / 2 - height / 2 / this.zoom];
        scale(this.zoom, this.zoom);
        translate(-bx, -by);
        litscreen.push();
        litscreen.scale(this.zoom, this.zoom);
        litscreen.translate(-bx, -by);
    }
    toWorld(x, y) {
        return [x / this.zoom + this.x + width / 2 - width / 2 / this.zoom, y / this.zoom + this.y + height / 2 - height / 2 / this.zoom];
    }
    toScreen(x, y) {
        return [this.zoom * (x - (this.x + width / 2 - width / 2 / this.zoom)), this.zoom * (y - (this.y + height / 2 - height / 2 / this.zoom))];
    }
}
