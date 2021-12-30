class Weapon {
    player;
    world;
    constructor(_player, _world){
        this.player = _player;
        this.world = _world;
    }
    tick(){}
    render(){}
    attack(){}
    drawIcon(x, y, w, h){}
}

class Sword extends Weapon{
    static DAMAGE = 10;
    static RANGE = 30;
    tier;
    enhance;
    static TIME = 20;
    static ANIM_TIME = 10;
    timer;
    atkProgress;
    constructor(_player, _tier, _enhance){
        console.assert(curState instanceof GameState);
        super(_player, curState.world);
        this.timer = Sword.TIME;
        if(_tier) this.tier = _tier;
        else this.tier = 1;
        if(_enhance) this.enhance = _enhance;
        else this.enhance = [];
        this.atkProgress = -1;
    }
    tick(){
        this.timer = max(0, this.timer - 1);
    }
    render(){
        if(this.atkProgress >= 0){
            this.atkProgress++;
            let [cw, ch] = [this.player.x + this.player.width / 2, this.player.y + this.player.height / 2];
            let angle = this.atkProgress / Sword.ANIM_TIME * 2 * PI;
            let range = Sword.RANGE + 5 * (this.tier - 1);
            stroke(0);
            strokeWeight(5);
            line(cw, ch, cw + range * cos(angle), ch - range * sin(angle));
            if(this.atkProgress > Sword.ANIM_TIME){
                this.atkProgress = -1;
            }
        }
    }
    attack(){
        if(this.timer === 0){
            let range = Sword.RANGE + 5 * (this.tier - 1);
            let damage = Sword.DAMAGE + 3 * (this.tier - 1);
            let timeLeft = Sword.TIME - 2 * (this.tier - 1);
            for(let item of this.enhance){
                if(item instanceof StoneItem){
                    damage += item.amt;
                } else if (item instanceof FeatherItem){
                    timeLeft = max(0, timeLeft - item.amt);
                } else if (item instanceof StickItem){
                    range += item.amt;
                }
            }
            for(let entity of this.world.getEntitiesAround(this.player)){
                if(entity instanceof Enemy && boxDist(this.player.x, this.player.y, this.player.width, this.player.height,
                            entity.x, entity.y, entity.width, entity.height) <= range){
                    entity.damage(damage);
                }
            }
            this.timer = timeLeft;
            this.atkProgress = 0;
        }
    }
    drawIcon(x, y, w, h){
        fill(100);
        noStroke();
        beginShape();
        vertex(x + w / 2, y);
        vertex(x, y + h);
        vertex(x + w, y + h);
        endShape();
    }
}

class Projectile extends Entity{
    hitEnemy;
    vx;
    vy;
    constructor(_x, _y, _width, _height, _vx, _vy, _playerFired){
        super(_x, _y, _width, _height, [_playerFired ? "Enemy" : "Foreground"]);
        this.vx = _vx;
        this.vy = _vy;
        this.hitEnemy = _playerFired;
    }
    tick(){
        console.assert(curState instanceof GameState);
        curState.world.move(this, this.vx, this.vy);
    }
    onTouch(other){
        console.assert(curState instanceof GameState);
        if(this.hitEnemy && other instanceof Enemy){
            this.attack(other);
        } else if (!this.hitEnemy && other instanceof Player){
            this.attack(other);
        }
        curState.world.removeEntity(this);
    }
    attack(other){}
}
