class Item extends Entity{
    world;
    constructor(_x, _y, _width, _height, _world){
        super(_x, _y, _width, _height, [])
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

    onTouch(other){
        if(other instanceof Player){
            if(other.collectItem(this.itemOf())){
                this.destroy();
            }
        }
    }
}

class Gemstone extends Item{
    tier;
    constructor(_x, _y, _width, _height, _tier, _world){
        super(_x, _y, _width, _height, _world);
        this.tier = _tier;
    }
    itemOf(){
        return new Gem(this.tier);
    }
}

class Coal extends Item{
    amt;
    constructor(_x, _y, _width, _height, _world, _amt){
        super(_x, _y, _width, _height, _world);
        this.amt = _amt;
    }
    onTouch(other){
        if(other instanceof Player){
            other.timeLeft += this.amt;
            this.destroy();
        }
    }
    render(){
        fill(0);
        strokeWeight(0);
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.width, this.height);
    }
}

class InventoryItem{

}

class Gem extends InventoryItem{
    tier;
    constructor(_tier){
        super();
        this.tier = _tier;
    }
}
