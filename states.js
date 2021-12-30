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
        changeState(new GameState(this.shader));
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
    constructor(shader){
        super();
        this.shader = shader;
        this.playerData = new PlayerData(100);
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
        changeState(new FadeState(this, new BossState(1, this.world.curPlayer.playerData, this.shader)));
    }
    mouseReleased() {
        this.curUI.mouseReleased();
    }
    exitState() {
        this.curUI.exitState();
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

class BossState extends State {
    world;
    curUI;
    playerData;
    static playerHealth = 100;

    constructor(level, playerData, shader){
        super();
        playerData.health = BossState.playerHealth;
        this.playerData = playerData;
        if(level === 1) this.world = new BossWorld(12, 12, playerData, shader);
        this.curUI = new Default(this.world);
        this.world.addEntity(new BasicEnemy(100, 100, this.world));
    }
    enterState(){
        this.curUI.enterState();
    }
    exitState(){
        this.curUI.exitState();
    }
    tick(){
        this.world.tick();
        this.curUI.tick();
        if(this.world.curPlayer.playerData.health <= 0){
            this.playerDied();
        }
    }
    render(){
        background(0);
        this.world.render();
        this.curUI.render();
    }
    playerDied(){
        changeState(new FadeState(this, new MainMenuState(new Shader(litshader))));
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
        textAlign(CENTER, BOTTOM);
        [x, y, w, h] = this.background;
        text("MENU", x + w / 2, y + 20);
        [x, y, w, h] = this.returnTo;
        text("Return to Game", x + w / 2, y + h);
        [x, y, w, h] = this.mainMenu;
        text("Return to Main Menu", x + w / 2, y + h);
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
            changeState(new MainMenuState());
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
