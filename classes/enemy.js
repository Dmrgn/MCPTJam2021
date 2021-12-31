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
    static ATK_TIME = 60;
    static WIDTH = 100;
    static HEIGHT = 75;
    static ANIM_TIME = 30;
    static MARGIN = 100;
    static HEALTH = 80;
    static DAMAGE = 10;
    static CORRECT_AMT = 0.1;
    static ATK_RANGE = 50;

    timer = Dragon.ATK_TIME;
    velocity = 10;
    animTimer = Dragon.ANIM_TIME;
    curFrame = 1;
    worldBounds; // x1, y1, x2, y2
    dir;
    speed;

    constructor(_x, _y, _world, worldBounds){
        super(_x, _y, Dragon.WIDTH, Dragon.HEIGHT, Dragon.HEALTH, _world);
        this.layers = [];
        this.worldBounds = worldBounds;
        this.dir = [this.velocity / sqrt(2), this.velocity / sqrt(2)]
        this.speed = this.velocity;
    }

    onTouch(other){
        if(other instanceof Player){
            let [px, py, pw, ph] = [other.x, other.y, other.width, other.height]
            if(this.timer <= 0 &&
                this.mag([(px + pw / 2) - (this.x + this.width / 2), (py + ph / 2) - (this.y + this.height / 2)]) <= Dragon.ATK_RANGE) {
                other.damage(Dragon.DAMAGE)
                this.timer = Dragon.ATK_TIME;
            }
        }
    }

    mag(arr){
        return sqrt(arr[0] * arr[0] + arr[1] * arr[1]);
    }

    normalizeDir(vel){
        let mag = this.mag(this.dir);
        if(mag > 0){
            this.dir = [this.dir[0] / mag * vel, this.dir[1] / mag * vel];
        } else{
            this.dir = [0, 0]
        }
    }

    tick(){
        let playerAngle = atan2(this.player.y - this.y, this.player.x - this.x);
        let [x1, y1, x2, y2] = this.worldBounds;

        let amt = Dragon.CORRECT_AMT;

        let xDir = undefined;
        let yDir = undefined;

        let incSpeed = true;
        if(this.dir[0] > 0 && this.x + this.width / 2 >= x2 - Dragon.MARGIN){
            this.speed = max(0, this.speed - amt);
            xDir = -1;
            incSpeed = false;
        } else if(this.dir[0] < 0 && this.x + this.width / 2 <= x1 + Dragon.MARGIN){
            this.speed = max(0, this.speed - amt);
            xDir = 1;
            incSpeed = false;
        }
        if(this.dir[1] > 0 && this.y + this.height / 2 >= y2 - Dragon.MARGIN){
            this.speed = max(0, this.speed - amt);
            yDir = -1;
            incSpeed = false;
        } else if(this.dir[1] < 0 && this.y + this.height / 2 <= y1 + Dragon.MARGIN){
            this.speed = max(0, this.speed - amt);
            yDir = 1;
            incSpeed = false;
        }

        if(incSpeed){
            this.speed += amt;
        }
        this.speed = min(max(0, this.speed), this.velocity);
        if(this.speed <= 0.1){
            if(!xDir || Math.sign(xDir) === Math.sign(cos(playerAngle))){
                this.dir[0] = cos(playerAngle);
            } else {
                this.dir[0] = xDir;
            }
            if(!yDir || Math.sign(yDir) === Math.sign(sin(playerAngle))){
                this.dir[1] = sin(playerAngle)
            } else {
                this.dir[1] = yDir;
            }
        }
        this.normalizeDir(this.speed);

        this.world.move(this, this.dir[0], this.dir[1]);

        this.animTimer--;
        if(this.animTimer <= 0){
            this.curFrame = this.curFrame % 2 + 1;
            this.animTimer = Dragon.ANIM_TIME;
        }
        this.timer = max(0, this.timer - 1);
    }

    render(){
        let [x, y, w, h] = [this.x, this.y, this.width, this.height]
        fill(0, 0, 0, 0);
        stroke(255);
        strokeWeight(2);
        rect(x, y - 15, w, 10);
        fill(255, 0, 0);
        let amtFill = this.health / this.totHealth;
        rect(x, y - 15, w * amtFill, 10);

        if(this.player.x + this.player.width >= this.x + this.width){
            image(getSprite("dragon-r-" + this.curFrame), this.x, this.y, this.width, this.height);
        } else {
            image(getSprite("dragon-l-" + this.curFrame), this.x, this.y, this.width, this.height);
        }
    }
}
