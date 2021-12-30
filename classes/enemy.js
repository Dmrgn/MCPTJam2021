class Enemy extends Entity{
    health;
    player;
    constructor(_x, _y, _width, _height, _health, _player){
        super(_x, _y, _width, _height, ["Enemy"]);
        this.health = _health;
        this.player = _player;
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
    static TIME = 60;
    timer;
    constructor(_x, _y, _width, _height){
        super(_x, _y, _width, _height);
        this.timer = BasicEnemy.TIME;
    }
    tick(){
        this.timer--;
        if(this.timer === 0){

            this.timer = BasicEnemy.TIME;
        }
    }
    render(){

    }
}
