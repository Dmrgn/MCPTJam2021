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

    addWeapon(weapon){
        let firstInd = -1;
        for(let i = 0; i < PlayerData.WEAPONS && firstInd === -1; i++){
            if(!this.weapons[i]){
                firstInd = i;
            }
        }
        if(firstInd === -1) return false;
        this.weapons[firstInd] = weapon;
        return true;
    }
}

/**
 * The player interacting with the world
 */
class Player extends Entity {
    playerData;
    static WIDTH = 20;
    static HEIGHT = 40;
    weaponInd;
    curWeapon;

    constructor(_playerData, _x, _y) {
        super(_x, _y, Player.WIDTH, Player.HEIGHT, ["Foreground"]);
        this.playerData = _playerData;
        this.weaponInd = 0;
        this.setWeapon();
    }

    setWeapon(){
        this.curWeapon = this.playerData.weapons[this.weaponInd] ? this.playerData.weapons[this.weaponInd].weaponOf(this, curState.world) : undefined;
    }

    tick(){
        if(this.curWeapon){
            this.curWeapon.tick();
        }
    }

    render() {
        fill(255);
        rect(this.x, this.y, this.width, this.height);
        if(this.curWeapon){
            this.curWeapon.render();
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

    equipWeapon(weapon){
        let didEquip = this.playerData.addWeapon(weapon);
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
            this.curWeapon.attack(this, curState.world);
        }
    }
}
