class Weapon {
    player;
    world;
    tier;
    enhance;
    constructor(_player, _world, _tier, _enhance){
        this.player = _player;
        this.world = _world;
        this.tier = _tier;
        this.enhance = _enhance;
    }
    tick(){}
    render(){}
    attack(){}
    drawIcon(x, y, w, h){}
}

class Sword extends Weapon{
    static DAMAGE = 10;
    static RANGE = 30;
    static TIME = 30;
    static ANIM_TIME = 20;
    timer;
    atkProgress;
    constructor(_player, _world, _tier, _enhance){
        super(_player, _world, _tier ? _tier : 1, _enhance ? _enhance : []);
        this.timer = Sword.TIME;
        this.atkProgress = -1;
    }
    tick(){
        this.timer = max(0, this.timer - 1);
    }
    render(){
        if(this.atkProgress >= 0){
            this.atkProgress++;
            let [cw, ch] = [this.player.x + this.player.width / 2, this.player.y + this.player.height / 2];
            push();
            translate(cw, ch);
            let angle = this.atkProgress / Sword.ANIM_TIME * 2 * PI;
            rotate(angle);
            let range = Sword.RANGE + 5 * (this.tier - 1);
            let height = range / 3;
            image(getSprite("basic-sword"), 0, -height / 2, range, height);
            if(this.atkProgress > Sword.ANIM_TIME){
                this.atkProgress = -1;
            }
            pop();
        }
    }
    attack(_wielder, _world){
        if(this.timer === 0){
            this.player = _wielder;
            this.world = _world;
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
}

class Spear extends Weapon{
    static ATK_TIME = 5;
    static ATK_RETURN = 5;
    static ATK_COOL = 10;
    static RANGE = 90;
    static LENGTH = 30;
    static WIDTH = 10;
    static DAMAGE = 3;
    timer;
    atkProgress;
    dir;
    enemiesAttacked;

    range;
    damage;
    timeLeft;

    constructor(_player, _world, _tier, _enhance){
        super(_player, _world, _tier ? _tier : 1, _enhance ? _enhance : []);
        this.timer = Spear.ATK_COOL;
        this.atkProgress = -1;
    }
    spearOff(){
        console.assert(this.atkProgress >= 0);
        if(this.atkProgress <= Spear.ATK_TIME){
            return [this.dir[0] * this.atkProgress / Spear.ATK_TIME, this.dir[1] * this.atkProgress / Spear.ATK_TIME];
        } else {
            let progress = this.atkProgress - Spear.ATK_TIME - 1;
            return [this.dir[0] - this.dir[0] * progress / Spear.ATK_RETURN, this.dir[1] - this.dir[1] * progress / Spear.ATK_RETURN]
        }
    }
    tick(){
        if(this.atkProgress !== -1){
            let [px, py, pw, ph] = [this.player.x, this.player.y, this.player.width, this.player.height];
            let [offX, offY] = this.spearOff();
            let [bw, bh] = [30, 30];
            let [bx, by] = [px + pw / 2 + offX - bw / 2, py + ph / 2 + offY - bh / 2];
            for(let entity of this.world.getEntitiesAround(this.player)){
                if(entity instanceof Enemy && entity.isTouching(new Entity(bx, by, bw, bh)) && !this.enemiesAttacked.has(entity)){
                    entity.damage(this.damage);
                    this.enemiesAttacked.add(entity);
                }
            }
            this.atkProgress++;
            if(this.atkProgress === Spear.ATK_TIME + Spear.ATK_RETURN){
                this.atkProgress = -1;
            }
        }
        this.timer = max(0, this.timer - 1);
    }
    render(){
        let [px, py, pw, ph] = [this.player.x, this.player.y, this.player.width, this.player.height];
        if(this.atkProgress !== -1){
            let [offX, offY] = this.spearOff();
            let [x, y] = [px + pw / 2 + offX, py + ph / 2 + offY];
            let angle = atan2(offY, offX);
            push();
            translate(x, y);
            rotate(angle);
            image(getSprite("spear"), -Spear.LENGTH, -Spear.WIDTH / 2, Spear.LENGTH, Spear.WIDTH);
            pop();
        } else {
            let [wmx, wmy] = this.world.camera.toWorld(mouseX, mouseY);
            push();
            translate(px + pw / 2, py + ph / 2);
            let angle = atan2(wmy - (py + ph / 2), wmx - (px + pw / 2));
            rotate(angle);
            image(getSprite("spear"), 0, -Spear.WIDTH / 2, Spear.LENGTH, Spear.WIDTH);
            pop();
        }
    }
    attack(_wielder, _world){
        if(this.timer <= 0){
            this.player = _wielder;
            this.world = _world;
            this.atkProgress = 0;
            this.range = Spear.RANGE + 5 * (this.tier - 1);
            this.damage = Spear.DAMAGE + 3 * (this.tier - 1);
            this.timeLeft = Spear.ATK_COOL - 2 * (this.tier - 1);
            for(let item of this.enhance){
                if(item instanceof StoneItem){
                    this.damage += item.amt;
                } else if (item instanceof FeatherItem){
                    this.timeLeft = max(0, this.timeLeft - item.amt);
                } else if (item instanceof StickItem){
                    this.range += item.amt;
                }
            }
            let [wmx, wmy] = _world.camera.toWorld(mouseX, mouseY);
            let [dx, dy] = [wmx - (_wielder.x + _wielder.width / 2), wmy - (_wielder.y + _wielder.height / 2)];
            let mag = sqrt(dx * dx + dy * dy);
            this.dir = [this.range * dx / mag, this.range * dy / mag];
            this.enemiesAttacked = new Set();
            this.timer = this.timeLeft;
        }
    }
}

/**
 * Weapon inside the inventory
 */
class WeaponItem{
    tier;
    enhance;
    constructor(tier, enhancers){
        this.tier = tier;
        this.enhance = enhancers;
    }
    drawIcon(x, y, w, h){}
    weaponOf(_player, _world){}
    copy(tier, enhance){}
    physicalItem(x, y, world){}
    drawEnhancers(x, y, w, h){
        image(getSprite("tier-" + this.tier), x, y, w / 3, h / 3);
        let smallSideLen = min(w / 6, h / 2 / this.enhance.length);
        for(let i = 0; i < this.enhance.length; i++){
            this.enhance[i].drawIcon(x + w - smallSideLen, y + h - (i + 1) * smallSideLen, smallSideLen, smallSideLen);
        }
    }
}

class SwordItem extends WeaponItem{
    constructor(tier, enhancers){
        super(tier, enhancers);
    }
    weaponOf(_player, _world){
        return new Sword(_player, _world, this.tier, this.enhance);
    }
    drawIcon(x, y, w, h){
        image(getSprite("basic-sword-icon"), x, y, w, h);
        this.drawEnhancers(x, y, w, h);
    }

    physicalItem(x, y, world) {
        return new SwordDrop(x, y, world, this.tier, this.enhance);
    }

    copy(tier, enhance){
        return new SwordItem(tier, enhance);
    }
}

class SpearItem extends WeaponItem{
    constructor(tier, enhancers){
        super(tier, enhancers);
    }
    weaponOf(_player, _world){
        return new Spear(_player, _world, this.tier, this.enhance);
    }
    drawIcon(x, y, w, h){
        image(getSprite("spear-icon"), x, y, w, h);
        this.drawEnhancers(x, y, w, h);
    }
    physicalItem(x, y, world){
        return new SpearDrop(x, y, world, this.tier, this.enhance);
    }
    copy(tier, enhance){
        return new SwordItem(tier, enhance);
    }
}

class Projectile extends Entity{
    hitEnemy;
    vx;
    vy;
    world;
    constructor(_x, _y, _width, _height, _vx, _vy, _playerFired, _world){
        super(_x, _y, _width, _height, [], false);
        this.vx = _vx;
        this.vy = _vy;
        this.hitEnemy = _playerFired;
        this.world = _world;
    }
    tick(){
        this.world.move(this, this.vx, this.vy);
    }
    onTouch(other) {
        if (this.hitEnemy && other instanceof Enemy) {
            this.attack(other);
        } else if (!this.hitEnemy && other instanceof Player) {
            this.attack(other);
        }
        if (!(!this.hitEnemy && other instanceof Enemy || this.hitEnemy && other instanceof Player)) {
            this.world.removeEntity(this);
        }
    }
    render(){}
    attack(other){}
}

/**
 * basic enemy's projectile
 */
class Spinny extends Projectile{
    static WIDTH = 10;
    static HEIGHT = 10;
    static DEFAULT_DAMAGE = 5;
    damage;
    curSpin = 0;
    constructor(_x, _y, _vx, _vy, _playerFired, _damage, _world){
        super(_x, _y, Spinny.WIDTH, Spinny.HEIGHT, _vx, _vy, _playerFired, _world);
        if(_damage) this.damage = _damage;
        else this.damage = Spinny.DEFAULT_DAMAGE;
    }
    attack(other){
        if(other instanceof Player){
            other.damage(this.damage);
        }
        if(other instanceof Enemy){
            other.damage(this.damage);
        }
    }
    render(){
        this.curSpin += PI / 6;
        let [x, y, w, h] = [this.x, this.y, this.width, this.height];
        push();
        translate(x + w / 2, y + h / 2);
        rotate(this.curSpin);
        image(getSprite("snowball"),-w / 2, -h / 2, w, h);
        pop();
    }
}
