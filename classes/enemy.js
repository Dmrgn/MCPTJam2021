class Enemy extends Entity{
    health;
    player;
    world;
    constructor(_x, _y, _width, _height, _health, _world){
        super(_x, _y, _width, _height, ["Enemy"]);
        this.health = _health;
        this.world = _world;
        this.player = _world.curPlayer;
    }
    damage(amt){
        console.assert(curState instanceof GameState);
        this.health -= amt;
        if(this.health <= 0){
            curState.world.removeEntity(this);
        }
    }
}

class BasicEnemy extends Enemy{
    static TIME = 40;
    static HEALTH = 40;
    timer;
    velocity = 5;
    constructor(_x, _y, _width, _height, _world){
        super(_x, _y, _width, _height, BasicEnemy.HEALTH, _world);
        this.timer = BasicEnemy.TIME;
    }
    tick(){
        this.timer--;
        if(this.timer === 0){
            let dx = this.player.x + this.player.width / 2 - (this.x + this.width / 2);
            let dy = this.player.y + this.player.height / 2 - (this.y + this.height / 2);
            let mag = sqrt(dx * dx + dy * dy);
            this.world.addEntity(new Spinny(this.x + this.width / 2, this.y + this.height / 2,
                this.velocity * dx / mag, this.velocity * dy / mag, false, 3));
            this.timer = BasicEnemy.TIME;
        }
    }
    render(){
        fill(255, 0, 0);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }
}
