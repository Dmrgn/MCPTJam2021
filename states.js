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
    render(){
        background(0);
        fill(255);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 0);
        text("Press the screen to continue", width / 2, height / 2);
    }
    mousePressed(){
        changeState(new GameState(Math.floor(Math.random() * 187287231281)));
    }
}

class GameState extends State{
    world;
    curUI;
    seed;
    constructor(_seed){
        super();
        this.seed = _seed;
        this.world = new World(this.seed);
        this.curUI = new Default(this.world);
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
        litscreen.background(0);
        this.world.render();
        runShader(width / 2, height / 2);
        this.curUI.render();
    }
    mousePressed() {
        this.curUI.mousePressed();
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
        } else if(key === 'e'){
            this.switchUI(new CraftUI(this.world, new GemUpgrade(0, 0, 0, 0)));
        }
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
    constructor(_prev){
        super();
        this.prev = _prev;
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
