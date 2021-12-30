/**
 * a generic entity - interacts with the world
 */
class Entity {
    x;
    y;
    width;
    height;
    canInteract;

    // the layers this entity is a part of - entities in the same layer cannot overlap
    layers;

    constructor(_x, _y, _width, _height, _layers, _canInteract) {
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
        this.layers = _layers;
        this.canInteract = _canInteract;
    }

    shouldFix(other) {
        let hDiff = min([other.x + other.width - this.x, other.x - (this.x + this.width)].map(abs));
        let vDiff = min([other.y + other.height - this.y, other.y - (this.y + this.height)].map(abs));
        return [hDiff < 2 || hDiff <= vDiff, vDiff < 2 || vDiff <= hDiff];
    }

    valid(other) {
        let mix = -Infinity, maX = Infinity, miy=-Infinity, may=Infinity;
        if (other.y <= this.y + this.height && other.y + other.height >= this.y) {
            if (this.x + this.width >= other.x + other.width) mix = other.x + other.width - this.x + 0.5;
            else maX = other.x - (this.x + this.width) - 0.5;
        }
        if(other.x <= this.x + this.width && other.x + other.width >= this.x){
            if(this.y + this.height >= other.y + other.height) miy = other.y + other.height - this.y + 0.5;
            else may = other.y - (this.y + this.height) - 0.5;
        }
        if(this.isTouching(other)){
            let [hFix, vFix] = this.shouldFix(other);
            if(!hFix) [mix, maX] = [-Infinity, Infinity];
            if(!vFix) [miy, may] = [-Infinity, Infinity];
        }
        return [mix, maX, miy, may];
    }

    isTouching(other) {
        return this.x <= other.x + other.width && this.x + this.width >= other.x &&
            this.y <= other.y + other.height && this.y + this.height >= other.y;
    }

    /**
     * whether or not this entity will hit the other if this entity moves by (x, y)
     * @param other the entity to check for collision
     * @param x the direction to move in
     * @param y the y direction to move in
     * @return {boolean} whether or not, if this entity moves by (x, y), this entity will hit [other]
     */
    willHit(other, x, y){
        let [nx, ny] = [this.x + x, this.y + y];
        return nx <= other.x + other.width && other.x <= nx + this.width && ny <= other.y + other.height && other.y <= ny + this.height;
    }

    onInteract(player){}

    tick(){}

    render(){}

    onTouch(other){}
}
