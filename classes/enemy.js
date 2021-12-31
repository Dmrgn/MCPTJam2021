class Enemy extends Entity{
    health;
    player;
    world;
    totHealth;
    constructor(_x, _y, _width, _height, _health, _world){
        super(_x, _y, _width, _height, ["Foreground"]);
        this.health = _health;
        this.world = _world;
        this.player = _world.curPlayer;
        this.totHealth = _health;
    }
    damage(amt){
        this.health -= amt;
        if(this.health <= 0){
            curState.world.removeEntity(this);
        }
    }
}

class BasicEnemy extends Enemy{
    static TIME = 40;
    static HEALTH = 40;
    static WIDTH = 100;
    static HEIGHT = 100;
    static ANIM_TIME = 20;

    timer;
    velocity = 5;
    curAnim = 1;
    animTimer = BasicEnemy.ANIM_TIME;
    speed = 2;

    constructor(_x, _y, _world){
        super(_x, _y, BasicEnemy.WIDTH, BasicEnemy.HEIGHT, BasicEnemy.HEALTH, _world);
        this.timer = BasicEnemy.TIME;
    }
    tick(){
        this.timer--;
        let dx = this.player.x + this.player.width / 2 - (this.x + this.width / 2);
        let dy = this.player.y + this.player.height / 2 - (this.y + this.height / 2);
        let mag = sqrt(dx * dx + dy * dy);
        if(this.timer === 0){
            this.world.addEntity(new Spinny(this.x + this.width / 2, this.y + this.height / 2,
                this.velocity * dx / mag, this.velocity * dy / mag, false, 3,this.world));
            this.timer = BasicEnemy.TIME;
        }
        if(mag > 500){
            this.world.move(this, this.speed * dx / mag, this.speed * dy / mag);
        } else if (mag < 300){
            this.world.move(this, -this.speed * dx / mag, -this.speed * dy / mag);
        }
    }
    render(){
        let player = this.player;
        if(player.x + player.width > this.x + this.width){
            image(getSprite("snowman-r-" + this.curAnim), this.x, this.y, this.width, this.height);
        } else {
            image(getSprite("snowman-l-" + this.curAnim), this.x, this.y, this.width, this.height);
        }
        let [x, y, w, h] = [this.x, this.y, this.width, this.height];
        fill(0, 0, 0, 0);
        stroke(255);
        strokeWeight(2);
        rect(x, y - 15, w, 10);
        fill(255, 0, 0);
        let amtFill = this.health / this.totHealth;
        rect(x, y - 15, w * amtFill, 10);
        this.animTimer--;
        if(this.animTimer <= 0){
            this.curAnim = this.curAnim % 2 + 1;
            this.animTimer = BasicEnemy.ANIM_TIME;
        }
    }
}

class Dragon extends Enemy{

}
