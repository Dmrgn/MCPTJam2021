class World {
    camera;
    maze;
    constructor(seed){
        this.camera = new Camera(0, 0);
        this.maze = new Maze(10, seed);
    }
    render(){
        if(keyIsDown(87)) this.camera.y -= 10;
        if(keyIsDown(65)) this.camera.x -= 10;
        if(keyIsDown(83)) this.camera.y += 10;
        if(keyIsDown(68)) this.camera.x += 10;
        this.camera.alterMatrix();
        let [wmx, wmy] = this.camera.toWorld(mouseX, mouseY);
        tileController.preparePerimeter(floor(wmx / Tile.WIDTH), floor(wmy / Tile.HEIGHT), 5, maze);
        tileController.drawTiles();
        pop();
    }
    keyPressed(){
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
