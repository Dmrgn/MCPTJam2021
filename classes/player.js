/**
 * PlayerData stores the data for the player - this is useful for when we switch between states
 */
 class PlayerData {
    health;
    items;
    weapons;
    static WEAPONS = 2;
    static ITEMS = 8;

    constructor(_health) {
        this.health = _health;
        this.items = new Array(PlayerData.ITEMS).fill(undefined);
        this.weapons = new Array(PlayerData.WEAPONS).fill(undefined);
    }

    addItem(item){
        if(item instanceof WeaponItem){
            let firstInd = -1;
            for(let i = 0; i < PlayerData.WEAPONS && firstInd === -1; i++){
                if(!this.weapons[i]){
                    firstInd = i;
                }
            }
            if(firstInd === -1) return false;
            this.weapons[firstInd] = item;
            return true;
        } else if (item instanceof InventoryItem){
            let firstInd = -1;
            for(let i = 0; i < PlayerData.ITEMS && firstInd === -1; i++){
                if(!this.items[i]){
                    firstInd = i;
                }
            }
            if(firstInd === -1) return false;
            this.items[firstInd] = item;
            return true;
        }
        throw "couldn't equip this item!";
    }
}

/**
 * The player interacting with the world
 */
class Player extends Entity {
    playerData;
    static WIDTH = 25;
    static HEIGHT = 50;
    weaponInd;
    curWeapon;
    static ANIM_TIME = 25;
    static MAX_SPEED = 4;
    animTimer = Player.ANIM_TIME;
    frame = 1;
    dir = 'd';
    moving = false;
    world;
    velocity;
    static HEADLIGHT_RANGE = 30;
    headlightx = null;
    headlighty = null;

    constructor(_playerData, _world, _x, _y) {
        super(_x, _y, Player.WIDTH, Player.HEIGHT, ["Foreground"]);
        this.velocity = createVector(0,0);
        this.playerData = _playerData;
        this.weaponInd = 0;
        this.world = _world;
        this.setWeapon();
    }

    setWeapon(){
        this.curWeapon = this.playerData.weapons[this.weaponInd] ? this.playerData.weapons[this.weaponInd].weaponOf(this, this.world) : undefined;
    }

    tick(){
        let preDir = this.dir;
        this.moving = true;
        if(keyIsDown(83)) this.dir = 'd';
        else if(keyIsDown(65)) this.dir = 'l';
        else if(keyIsDown(87)) this.dir = 'u';
        else if(keyIsDown(68)) this.dir = 'r';
        else this.moving = false;
        if(this.dir !== preDir){
            this.animTimer = Player.ANIM_TIME;
            this.frame = 1;
        }

        if(this.curWeapon){
            this.curWeapon.tick();
        }
        this.world.move(this, this.velocity.x, this.velocity.y);
        this.velocity = this.velocity.mult(0.9);
    }

    render() {
        let displayImg = !this.moving ? getSprite("player-" + this.dir + "-idle") : getSprite("player-" + this.dir + "-" + this.frame);
        this.animTimer--;
        if(this.animTimer <= 0){
            this.animTimer = Player.ANIM_TIME;
            this.frame = this.frame % 2 + 1;
        }
        image(displayImg, this.x, this.y, this.width, this.height);
        if(this.curWeapon){
            this.curWeapon.render();
        }
        const frontx = min( max(mouseX,width/2-Player.HEADLIGHT_RANGE), width/2+Player.HEADLIGHT_RANGE);
        const fronty = min( max(mouseY,height/2-Player.HEADLIGHT_RANGE), height/2+Player.HEADLIGHT_RANGE);
        if (this.headlightx == null) {
            this.headlightx = frontx;
            this.headlighty = fronty;
        } else {
            this.headlightx = lerp(this.headlightx, frontx, 0.03);
            this.headlighty = lerp(this.headlighty, fronty, 0.03);
        }
        if (curState?.world?.shader) {
            curState.world.shader.addLight(
                this.headlightx,
                this.headlighty,
                200,200,200);
        }
    }

    collectItem(item){
        for(let i in this.playerData.items){
            if(this.playerData.items[i] === undefined){
                this.playerData.items[i] = item;
                return true;
            }
        }
        return false;
    }

    addItem(item){
        let didEquip = this.playerData.addItem(item);
        this.setWeapon();
        return didEquip;
    }

    damage(amt){
        this.playerData.health -= amt;
        return this.playerData.health <= 0;
    }

    switchWeapon(offset){
        if(!offset) offset = 1;
        this.weaponInd = ((this.weaponInd + offset) % PlayerData.WEAPONS + PlayerData.WEAPONS) % PlayerData.WEAPONS;
        this.setWeapon();
    }

    attack(){
        if(this.curWeapon){
            this.curWeapon.attack(this, this.world);
        }
    }

    move(dirx, diry) {
        this.velocity.x += dirx * 0.4;
        this.velocity.y += diry * 0.4;
        this.velocity = this.velocity.limit(8);
    }
}
