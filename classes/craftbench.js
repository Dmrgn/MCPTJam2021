/**
 * Anvil object - placed in the world & is used for upgrading gems
 */
class Anvil extends Entity{
    static WIDTH = 50;
    static HEIGHT = 50;
    constructor(_x, _y){
        super(_x, _y, Anvil.WIDTH, Anvil.HEIGHT, ["Foreground"], true);
    }
    onInteract(player) {
        changeState(new CraftState(new GemUpgrade(0, 0, 0, 0), curState));
    }
    render(){
        image(getSprite("anvil"), this.x, this.y, this.width, this.height);
    }
}

class CraftBench extends Entity{
    static WIDTH = 50;
    static HEIGHT = 50;
    constructor(_x, _y){
        super(_x, _y, CraftBench.WIDTH, CraftBench.HEIGHT, ["Foreground"], true);
    }
    onInteract(player){
        changeState(new CraftState(new WeaponUpgrade(0, 0, 0, 0), curState));
    }
    render(){
        image(getSprite("bench"), this.x, this.y, this.width, this.height);
    }
}

class Chest extends Entity {
    static WIDTH = 50;
    static HEIGHT = 50;
    items;
    used;
    world;
    constructor(_x, _y, _items, _world){
        super(_x, _y, Chest.WIDTH, Chest.HEIGHT, ["Foreground"], true);
        this.items = _items;
        this.used = false;
        this.world = _world;
    }
    onInteract(player){
        if(!this.used){
            for(let item of this.items){
                this.world.addEntity(item);
            }
            this.canInteract = false;
            this.used = true;
        }
    }
    render(){
        if(!this.used){
            image(getSprite("chest-open"), this.x, this.y, this.width, this.height);
        } else {
            image(getSprite("chest-closed"), this.x, this.y, this.width, this.height);
        }
    }
}
