class Recipe{
    x;
    y;
    width;
    height;

    constructor(_x, _y, _width, _height){
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
    }

    tick(){}

    /**
     * @return {item} a list of items to add to the inventory
     */
    mousePressed(){
       return [];
    }

    /**
     * @return {item} a list of items to be placed back into the inventory
     */
    onExit(){}

    /**
     * @param item the item that wants to be inserted into the crafting bench
     * @return canUse whether or not this item can be inserted
     */
    canUse(item){}

    /**
     * Inserts an item into the crafting bench
     * @param item the item to insert
     */
    insert(item){}

    render(){}
}

class GemUpgrade extends Recipe{
    static numNeeded = [4, 4, 3];
    curCraft;
    items;
    tags;
    constructor(_x, _y, _width, _height){
        super(_x, _y, _width, _height);
        this.curCraft = 2;
        this.items = [];
        this.tags = new Array(GemUpgrade.numNeeded.length);
    }
    setPos(x, y, w, h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    positionTags(){
        let tagHeight = this.height / 5 - 10;
        let longTagHeight = this.height / 5 + 5;
        let tagWidth = min(40, this.width / (GemUpgrade.numNeeded.length + 1) - 5);
        for(let i = 0; i < GemUpgrade.numNeeded.length; i++){
            let curPos = this.x + (i + 1) * this.width / (GemUpgrade.numNeeded.length + 1);
            if(i + 2 === this.curCraft){
                this.tags[i] = [curPos - tagWidth / 2, this.y, tagWidth, longTagHeight];
            } else {
                this.tags[i] = [curPos - tagWidth / 2, this.y, tagWidth, tagHeight];
            }
        }
    }
    canUse(item){
        return item instanceof GemItem && this.items.length < GemUpgrade.numNeeded[this.curCraft - 2];
    }
    insert(item){
        console.assert(this.canUse(item));
        this.items.push(item);
    }
    render(){
        this.positionTags();
        fill(235, 171, 54);
        noStroke();
        rect(this.x, this.y, this.width, this.height, 10);

        for(let i = 0; i < GemUpgrade.numNeeded.length; i++) {
            let [x, y, w, h] = this.tags[i];
            fill(255, 0, 0);
            stroke(0);
            strokeWeight(1);
            rect(x, y, w, h);
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            text("" + (i + 2), x, y + h / 2, w);
        }

        // initialize variables
        let [x, y, w, h] = [this.x, this.y, this.width, this.height];
        let amtNeeded = GemUpgrade.numNeeded[this.curCraft - 2];
        let itemSize = h / 6;
        let botY = y + h - itemSize - 20;
        let margin = 10;

        // draw the gem that results from the previous tiers
        fill(255);
        stroke(0);
        strokeWeight(1);
        rect(x + w / 2 - itemSize / 2, y + h * 2 / 5 - itemSize, itemSize, itemSize);
        if(this.items.length === amtNeeded){
            new GemItem(this.curCraft).drawIcon(x + w / 2 - itemSize / 2 + margin, y + h * 2 / 5 - itemSize + margin,
                itemSize - 2 * margin, itemSize - 2 * margin);
        } else {
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            text("" + this.curCraft, x + w / 2 - itemSize / 2, y + h * 2 / 5 - itemSize / 2, itemSize);
        }

        // draw the individual squares for the previous gem
        for(let i = 0; i < amtNeeded; i++) {
            fill(255);
            stroke(0);
            strokeWeight(1);
            let curPos = x + (i + 1) * w / (amtNeeded + 1);
            rect(curPos - itemSize / 2, botY, itemSize, itemSize);
            if(this.items.length > i){
                let margin = 10;
                this.items[i].drawIcon(curPos - itemSize / 2 + margin, botY + margin, itemSize - margin, itemSize - margin);
            } else {
                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                text("" + (this.curCraft - 1), curPos - itemSize / 2, botY + itemSize / 2, itemSize);
            }
        }

        stroke(0);
        strokeWeight(5);
        for(let i = 0; i < amtNeeded; i++) {
            let curPos = x + (i + 1) * w / (amtNeeded + 1);
            line(curPos, botY, curPos, y + h / 2);
        }
        line(x + w / (amtNeeded + 1), y + h / 2, x + w - w / (amtNeeded + 1), y + h / 2);
        line(x + w / 2, y + h / 2, x + w / 2, y + h * 2 / 5);
    }
}
