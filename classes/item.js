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

class Gem extends Item{
    tier;
    static WIDTH = 10;
    static HEIGHT = 10;
    constructor(_x, _y, _tier, _world){
        super(_x, _y, Gem.WIDTH, Gem.HEIGHT, _world);
        this.tier = _tier;
    }
    itemOf(){
        return new GemItem(this.tier);
    }
    render(){
        fill(0, 0, 255);
        strokeWeight(0);
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.width, this.height);
    }
}

class Stone extends Item{
    static WIDTH = 10;
    static HEIGHT = 10;
    amt;
    constructor(_x, _y, _amt, _world){
        super(_x, _y, Stone.WIDTH, Stone.HEIGHT, _world);
        this.amt = _amt;
    }
    itemOf(){
        return new StoneItem(this.amt);
    }
    render(){
        fill(100, 100, 100);
        strokeWeight(0);
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.width, this.height);
    }
}

class Feather extends Item{
    static WIDTH = 10;
    static HEIGHT = 10;
    amt;
    constructor(_x, _y, _amt, _world){
        super(_x, _y, Feather.WIDTH, Feather.HEIGHT, _world);
        this.amt = _amt;
    }
    itemOf(){
        return new FeatherItem(this.amt);
    }
    render(){
        stroke(255);
        strokeWeight(5);
        line(this.x, this.y, this.x + this.width, this.y + this.height);
    }
}

class Stick extends Item{
    static WIDTH = 10;
    static HEIGHT = 10;
    amt;
    constructor(_x, _y, _amt, _world){
        super(_x, _y, Stick.WIDTH, Stick.HEIGHT, _world);
        this.amt = _amt;
    }
    itemOf(){
        return new StickItem(this.amt);
    }
    render(){
        stroke(148, 74, 0);
        strokeWeight(5);
        line(this.x, this.y, this.x + this.width, this.y + this.height);
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
            other.playerData.health += this.amt;
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

class SwordDrop extends Item {
    static WIDTH = 20;
    static HEIGHT = 20;
    tier;
    enhance;
    constructor(_x, _y, _world, _tier, _enhance){
        super(_x, _y, SwordDrop.WIDTH, SwordDrop.HEIGHT, _world);
        this.tier = _tier;
        this.enhance = _enhance;
    }

    onInteract(player) {
        if(player.addItem(new SwordItem(this.tier, this.enhance))){
            this.destroy();
        }
    }

    render(){
        let [x, y, w, h] = [this.x, this.y, this.width, this.height];
        fill(100);
        stroke(0);
        strokeWeight(1);
        beginShape();
        vertex(x + w / 2, y);
        vertex(x + w, y + h);
        vertex(x, y + h);
        endShape();
    }
}

class InventoryItem{
    drawIcon(x, y, width, height){

    }
    physicalItem(x, y, world){

    }
}

class GemItem extends InventoryItem{
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
        textAlign(CENTER, CENTER);
        fill(0);
        text(this.tier === 1 ? "I" : this.tier === 2 ? "II" : this.tier === 3 ? "III" : "IV", x, y + height / 2, width);
    }
    physicalItem(x, y, world){
        return new Gem(x - Gem.WIDTH / 2, y - Gem.HEIGHT / 2, this.tier, world);
    }
}
class StoneItem extends InventoryItem {
    amt;
    constructor(_amt){
        super();
        this.amt = _amt;
    }
    drawIcon(x, y, width, height){
        fill(100, 100, 100);
        noStroke();
        ellipseMode(CORNER);
        ellipse(x, y, width, height);
    }
    physicalItem(x, y, world){
        return new Stone(x, y, this.amt, world);
    }
}
class FeatherItem extends InventoryItem {
    amt;
    constructor(_amt){
        super();
        this.amt = _amt;
    }
    drawIcon(x, y, width, height){
        stroke(0);
        strokeWeight(5);
        line(x, y, x + width, y + height);
    }
    physicalItem(x, y, world){
        return new Feather(x, y, this.amt, world);
    }
}
class StickItem extends InventoryItem {
    amt;
    constructor(_amt){
        super();
        this.amt = _amt;
    }
    drawIcon(x, y, width, height){
        stroke(148, 74, 0);
        strokeWeight(5);
        line(x, y, x + width, y + height);
    }
    physicalItem(x, y, world){
        return new Stick(x, y, this.amt, world);
    }
}
