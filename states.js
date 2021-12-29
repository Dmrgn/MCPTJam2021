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
        text("Press the screen to continue", width / 2, height / 2);
    }
    mousePressed(){
        changeState(new GameState(Math.floor(Math.random() * 187287231281)));
    }
}

class GameState extends State{
    world;
    constructor(seed){
        super();
        this.world = new World(seed);
    }
    tick(){
        this.world.tick();
    }
    render(){
        background(0);
        this.world.render();
    }
}
