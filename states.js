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
    }
    enterState(){
        this.world = new World(this.seed);
        this.curUI = new Default(this.world.curPlayer);
    }
    tick(){
        this.world.tick();
    }
    render(){
        background(0);
        this.world.render();
        this.curUI.render();
    }
    mousePressed() {
        this.curUI.mousePressed();
    }
    mouseReleased() {
        this.curUI.mouseReleased();
    }
    keyPressed() {
        if(key === 'g'){
            this.world.interact();
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
