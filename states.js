class State{
    tick(){}
    render(){}
    enterState(){}
    exitState(){}
    keyPressed(){}
    keyReleased(){}
    mousePressed(){}
    mouseReleased(){}
}

class MainMenuState extends State{
    lastTime = 0;
    constructor(shader) {
        super();
        this.shader=shader;
    }
    enterState() {
        getSprite("splash").time(0);
    }

    tick(){
        if(getSprite("splash").time() < this.lastTime){
            this.exit();
        } else {
            this.lastTime = getSprite("splash").time();
        }
    }
    render(){
        background(0);
        if(!didAutoplay){
            textSize(40);
            textAlign(CENTER, CENTER);
            textFont(getFont("roboto"));
            fill(255);
            text("Click the screen to play", width / 2, height / 2);
        } else {
            let dim = min(width, height);
            image(getSprite("splash"), width / 2 - dim / 2, height / 2 - dim / 2, dim, dim);
        }
    }
    exit(){
        changeState(new GameState(this.shader, 1));
    }
    mousePressed(){
        this.exit();
    }
}

class GameState extends State{
    world;
    curUI;
    playerData;
    shader;
    constructor(shader, _level){
        super();
        curLevel = _level;
        this.shader = shader;
        this.playerData = new PlayerData(50);
        this.world = new ExplorationWorld(this.playerData, shader);
        this.curUI = new Default(this.world);
        this.world.curPlayer.addItem(new SwordItem(1, []))
    }
    switchUI(to){
        this.curUI.exitState();
        to.enterState();
        this.curUI = to;
    }
    enterState(){
        this.curUI.enterState();
        getSound("maze").jump(0);
        getSound("maze").setVolume(1);
    }
    tick(){
        this.world.tick();
        this.curUI.tick();
    }
    render(){
        background(0);
        this.world.render();
        this.curUI.render();
    }
    mousePressed() {
        this.curUI.mousePressed();
        this.world.attack();
    }
    explorationDone(){
        changeState(new FadeState(this, new MessageState(new BossState(this.world.curPlayer.playerData, this.shader),
            "As your torch burns out|You hear rumbling - the walls falling down|... and the coldness becomes alive")));
    }
    mouseReleased() {
        this.curUI.mouseReleased();
    }
    exitState() {
        this.curUI.exitState();
        sounds.get("maze").setVolume(0);
    }
    keyPressed() {
        if(keyCode === 27){
            changeState(new MenuState(this));
        } else if(key === 'g'){
            this.world.interact();
        } else if (key === ' '){
            this.world.switchWeapon();
        }
    }
}

class MessageState extends State {
    next;
    // "Line 1|Line 2|Line 3|"
    message;
    curFrame = 0;
    static FRAMES_PER_CHAR = 5;
    static PAUSE_FRAMES = 100;

    constructor(_next, message){
        super();
        this.next = _next;
        this.message = message;
    }
    tick(){
        this.curFrame++;
        if(this.curFrame > this.message.length * MessageState.FRAMES_PER_CHAR + MessageState.PAUSE_FRAMES){
            changeState(this.next);
        }
    }
    render(){
        background(0);
        let toDisplay = this.message.substr(0, Math.floor(this.curFrame / MessageState.FRAMES_PER_CHAR)).split("|");
        textFont(getFont("v-script"));
        textSize(24);
        fill(255);
        textAlign(CENTER, BOTTOM);
        let spacing = 30;
        let start = height / 2 - spacing * toDisplay.length / 2;
        for(let i = 0; i < toDisplay.length; i++){
            text(toDisplay[i], width / 2, start + spacing * i);
        }
    }
    mousePressed(){
        this.curFrame = max(this.curFrame, this.message.length * MessageState.FRAMES_PER_CHAR);
    }
}

class BossState extends State {
    world;
    curUI;
    playerData;
    shader;
    static playerHealth = 100;

    constructor(playerData, shader){
        super();
        playerData.health = BossState.playerHealth;
        this.shader = shader;
        this.playerData = playerData;
        this.world = new BossWorld(12, 12, playerData, shader);
        this.curUI = new Default(this.world);
        if(curLevel === 1){
            this.world.addEntity(new BasicEnemy(100, 100, this.world));
        } else if (curLevel === 2){
            this.world.addEntity(new Dragon(100, 100, this.world, [Tile.WIDTH, Tile.HEIGHT, (this.world.width - 1) * Tile.WIDTH, (this.world.height - 1) * Tile.HEIGHT]));
        } else if (curLevel === 3){
            this.world.addEntity(new Dragon(100, 100, this.world, [Tile.WIDTH, Tile.HEIGHT, (this.world.width - 1) * Tile.WIDTH, (this.world.height - 1) * Tile.HEIGHT]));
            this.world.addEntity(new BasicEnemy(Tile.WIDTH * (this.world.width - 4), Tile.HEIGHT * (this.world.height - 4), this.world));
            this.world.addEntity(new BasicEnemy(Tile.WIDTH * (this.world.width - 4), 100, this.world));
            this.world.addEntity(new BasicEnemy(Tile.WIDTH * (this.world.width / 2), Tile.HEIGHT * (this.world.height - 4), this.world));
            this.world.addEntity(new BasicEnemy(Tile.WIDTH * (this.world.width / 2), 100, this.world));
            this.world.addEntity(new BasicEnemy(100, Tile.HEIGHT * (this.world.height / 2), this.world));
            this.world.addEntity(new BasicEnemy(100, Tile.HEIGHT * (this.world.height - 4), this.world));
        }
    }
    enterState(){
        this.curUI.enterState();
        if(curLevel === 3) {
            getSound("sarajevo").jump(0);
            getSound("sarajevo").setVolume(1);
        } else {
            getSound("sarajevo-8").jump(0);
            getSound("sarajevo-8").setVolume(1);
        }
    }
    exitState(){
        this.curUI.exitState();
        if(curLevel === 3) {
            getSound("sarajevo").setVolume(0);
        } else {
            getSound("sarajevo-8").setVolume(0);
        }
    }
    tick(){
        this.world.tick();
        this.curUI.tick();
        if(this.world.curPlayer.playerData.health <= 0){
            this.playerDied();
        }
        let enemies = new Set();
        for(let [coord, entities] of this.world.entities){
            for(let entity of entities){
                if(entity instanceof Enemy){
                    enemies.add(entity);
                }
            }
        }
        if(enemies.size === 0){
            this.completed();
        }
    }
    completed(){
        if(curLevel < 3){
            changeState(new FadeState(this, new MessageState(new GameState(this.world.shader, curLevel + 1),
                "The monster fades away - and the entire area crumbles|You wake up at the next level|Of This Labyrinth.")));
        } else {
            changeState(new Won(this.shader));
        }
    }
    render(){
        background(0);
        this.world.render();
        this.curUI.render();
    }
    playerDied(){
        changeState(new FadeState(this, new GameOver(new Shader(litshader))));
    }
    keyPressed() {
        if(keyCode === 27){
            changeState(new MenuState(this));
        } else if (key === ' '){
            this.world.switchWeapon();
        }
    }
    mouseReleased() {
        this.curUI.mouseReleased();
    }
    mousePressed() {
        this.curUI.mousePressed();
        this.world.attack();
    }
}

class FadeState extends State {
    prev;
    next;
    screenOpacity = 0;
    constructor(_prev, _next){
        super();
        this.prev = _prev;
        this.next = _next;
        this.world = _prev.world;
        this.curPlayer = this.world.curPlayer;
    }
    tick(){
        this.screenOpacity += 5;
        if(this.screenOpacity > 255){
            changeState(this.next);
        }
    }
    render(){
        this.prev.render();
        stroke(0, 0, 0, 0);
        fill(0, 0, 0, this.screenOpacity);
        rect(0, 0, width, height);
    }
}

class MenuState extends State{
    prev;
    background;
    returnTo;
    mainMenu;
    world;
    constructor(_prev){
        super();
        this.prev = _prev;
        this.world = _prev.world;
    }
    calcPositions(){
        this.background = [width / 2 - 100, height / 2 - 120, 200, 240];
        let [x, y, w, h] = this.background;
        this.returnTo = [x + 5, y + h - 20, w - 10, 15];
        this.mainMenu = [x + 5, y + h - 40, w - 10, 15];
    }
    render(){
        this.calcPositions();
        this.prev.render();
        stroke(0);
        strokeWeight(1);
        let [x, y, w, h] = this.background;
        fill(235, 171, 54);
        rect(x, y, w, h, 5);

        fill(0, 0, 255);
        [x, y, w, h] = this.returnTo;
        rect(x, y, w, h, 5);
        [x, y, w, h] = this.mainMenu;
        rect(x, y, w, h, 5);

        fill(0);
        noStroke();
        textSize(26);
        textFont(getFont("pacifico"));
        textAlign(CENTER, TOP);
        [x, y, w, h] = this.background;
        text("MENU", x + w / 2, y + 2);

        textFont(getFont("roboto"))
        textAlign(CENTER, BOTTOM)
        textSize(14);
        [x, y, w, h] = this.returnTo;
        text("Return to Game", x + w / 2, y + h);
        [x, y, w, h] = this.mainMenu;
        text("Restart", x + w / 2, y + h);
    }
    isPressed(rect){
        let [x, y, w, h] = rect;
        return x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h;
    }
    mousePressed(){
        this.calcPositions();
        if(this.isPressed(this.returnTo)){
            changeState(this.prev);
        } else if (this.isPressed(this.mainMenu)){
            changeState(new MainMenuState(this.world.shader));
        }
    }
}

class CraftState extends State {
    playerData;
    curPlayer;
    world;
    curRecipe;

    itemSlots;
    inventoryBG;

    prev;

    constructor(_recipe, _prev){
        super();
        console.assert(_prev instanceof GameState);
        this.world = _prev.world;
        this.curPlayer = this.world.curPlayer;
        this.playerData = this.curPlayer.playerData;
        this.curRecipe = _recipe;
        this.prev = _prev;
        this.updateInventory();
    }
    updateInventory(){
        this.curRecipe.setPos(width / 2 - 200, height / 2 - 200, 400, 200);
        let [x, y, w] = [width / 2 - 300, height / 2 + 50, 600];
        let amt = PlayerData.ITEMS + PlayerData.WEAPONS + 1;
        let slotWidth = w / amt;
        this.inventoryBG = [x, y, w, slotWidth]
        this.weaponSlots = new Array(PlayerData.WEAPONS)
        this.itemSlots = new Array(PlayerData.ITEMS);
        for(let i = 0; i < PlayerData.WEAPONS; i++){
            let margin = 10;
            this.weaponSlots[i] = [x + slotWidth * i + margin, y + margin, slotWidth - 2 * margin, slotWidth - 2 * margin];
        }
        let extra = PlayerData.WEAPONS + 1;
        for(let i = 0; i < PlayerData.ITEMS; i++){
            let margin = 10;
            this.itemSlots[i] = [x + slotWidth * (extra + i) + margin, y + margin, slotWidth - 2 * margin, slotWidth - 2 * margin];
        }
    }
    exitState(){
        for(let item of this.curRecipe.onExit()){
            if(!this.playerData.addItem(item)){
                this.throwInWorld(item);
            }
        }
    }
    inBox(x, y, w, h){
        return x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h;
    }
    addItems(slots, items){
        for(let i = 0; i < slots.length; i++){
            let [x, y, w, h] = slots[i];
            if(x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h){
                if(items[i] && this.curRecipe.canUse(items[i])){
                    this.curRecipe.insert(items[i]);
                    items[i] = undefined;
                }
            }
        }
    }
    throwInWorld(item){
        this.prev.world.addEntity(item.physicalItem(this.curPlayer.x + this.curPlayer.width / 2, this.curPlayer.y + this.curPlayer.height / 2, this.prev.world))
    }
    mousePressed(){
        this.addItems(this.weaponSlots, this.playerData.weapons);
        this.addItems(this.itemSlots, this.playerData.items);
        for(let item of this.curRecipe.mousePressed()){
            if(!this.curPlayer.addItem(item)){
                this.throwInWorld(item);
            }
        }
        if(!this.inBox(this.curRecipe.x, this.curRecipe.y, this.curRecipe.width, this.curRecipe.height)
        && !this.inBox(this.inventoryBG[0], this.inventoryBG[1], this.inventoryBG[2], this.inventoryBG[3])){
            changeState(this.prev);
        }
    }
    drawItems(slots, items){
        for(let [ind, slot] of slots.entries()){
            let [x, y, w, h] = slot;
            fill(255);
            stroke(0);
            strokeWeight(1);
            rect(x, y, w, h, 10);
            if(items[ind]){
                let margin = 5;
                items[ind].drawIcon(x + margin, y + margin, w - 2 * margin, h - 2 * margin);
            }
        }
    }
    render(){
        this.world.render();
        this.updateInventory();
        this.curRecipe.render();
        let [x, y, w, h] = this.inventoryBG;
        fill(235, 171, 54);
        noStroke();
        rect(x, y, w, h, 5);

        this.drawItems(this.weaponSlots, this.playerData.weapons);
        this.drawItems(this.itemSlots, this.playerData.items);
    }
    keyPressed() {
        if(keyCode === 27){
            changeState(this.prev);
        }
    }
}

class GameOver extends State {
    curFrame = 0;
    static WAIT_FRAMES = 120;
    shader;
    constructor(_shader){
        super();
        this.shader = _shader;
    }
    render(){
        this.curFrame++;
        image(getSprite("game-over"), 0, 0, width, height);
        fill(0);
        noStroke();
        rect(0, height - 40, width, 40);
        textAlign(CENTER, CENTER);
        textFont(getFont("roboto"));
        textSize(26);
        fill(255);
        text("Oh no! You lost - click the screen to try again :D", width / 2, height - 20);
    }
    mousePressed(){
        if(this.curFrame > GameOver.WAIT_FRAMES){
            changeState(new MainMenuState(this.shader))
        }
    }
}

class Won extends State {
    shader;
    curFrame = 0;
    static WAIT_FRAMES = 120;
    constructor(_shader){
        super();
        this.shader = _shader;
    }
    render(){
        ++this.curFrame;
        image(getSprite("win-screen"), 0, 0, width, height);
        fill(0);
        noStroke();
        rect(0, height - 40, width, 40);
        textAlign(CENTER, CENTER);
        textFont(getFont("roboto"));
        textSize(26);
        fill(255);
        text("You won! Here's a triumphant screen! Press the screen to play again :)", width / 2, height - 20);
    }
    mousePressed(){
        if(this.curFrame > Won.WAIT_FRAMES){
            changeState(new MainMenuState(this.shader))
        }
    }
}
