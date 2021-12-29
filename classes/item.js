class Item extends Entity{
    world;
    constructor(_x, _y, _width, _height, _world, _canInteract){
        super(_x, _y, _width, _height, [], _canInteract || _canInteract === undefined)
        this.world = _world;
    }

    /**
     * Return the inventoryItem equivalent of this object
     */
    itemOf(){
        throw "Generic Items don't have specific properties for collection - use a subclass";
    }

    /**
     * Removes this object from the world
     */
    destroy(){
        this.world.removeEntity(this);
    }
    onInteract(player) {
        if(player.collectItem(this.itemOf())){
            this.destroy();
        }
    }
}

class Gemstone extends Item{
    tier;
    static WIDTH = 10;
    static HEIGHT = 10;
    constructor(_x, _y, _tier, _world){
        super(_x, _y, Gemstone.WIDTH, Gemstone.HEIGHT, _world);
        this.tier = _tier;
    }
    itemOf(){
        return new Gem(this.tier);
    }
    render(){
        fill(0, 0, 255);
        strokeWeight(0);
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.width, this.height);
    }
}

class Coal extends Item{
    amt;
    static WIDTH=10;
    static HEIGHT=10;
    constructor(_x, _y, _world, _amt){
        super(_x, _y, Coal.WIDTH, Coal.HEIGHT, _world, false);
        this.amt = _amt;
    }
    onTouch(other){
        if(other instanceof Player){
            other.timeLeft += this.amt;
            this.destroy();
        }
    }

    onInteract(player) {}

    render(){
        fill(0);
        strokeWeight(0);
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.width, this.height);
    }
}

class InventoryItem{
    drawIcon(x, y, width, height){

    }
    physicalItem(x, y, world){

    }
}

class Gem extends InventoryItem{
    tier;
    constructor(_tier){
        super();
        this.tier = _tier;
    }
    drawIcon(x, y, width, height){
        fill(66, 239, 245);
        noStroke();
        ellipseMode(CORNER);
        ellipse(x, y, width, height);
        textAlign(CENTER);
        fill(0);
        text(this.tier === 1 ? "I" : this.tier === 2 ? "II" : this.tier === 3 ? "III" : "IV", x, y + height / 2 - 5, width, height);
    }
    physicalItem(x, y, world){
        return new Gemstone(x - Gemstone.WIDTH / 2, y - Gemstone.HEIGHT / 2, this.tier, world);
    }
}
