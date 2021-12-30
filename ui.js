class UIState{
    tick(){}
    render(){}
    enterState(){}
    exitState(){}
    keyPressed(){}
    keyReleased(){}
    mousePressed(){}
    mouseReleased(){}
}

class Default extends UIState{
    curPlayer;
    world;
    selectedItem;
    slots;
    weaponSlots;
    static hMargin=5;sd
    static vMargin = 6;
    mouseX;
    mouseY;
    constructor(_world){
        super();
        this.world = _world;
        this.curPlayer = this.world.curPlayer;
        this.selectedItem = undefined;
        this.updateSlots();
        this.mouseX = 0;
        this.mouseY = 0;
    }
    updateMouse(){
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }
    updateSlots(){
        let [hm, vm] = [Default.hMargin, Default.vMargin];
        this.slots = new Array(PlayerData.ITEMS);
        this.weaponSlots = new Array(PlayerData.WEAPONS);
        let itemWidth = width / 2 / PlayerData.ITEMS;
        for(let i = 0; i < PlayerData.ITEMS; i++){
            let slotWidth = itemWidth - 2 * hm;
            this.slots[i] = [width / 2 + i * itemWidth + hm, height - slotWidth - vm, slotWidth, slotWidth];
        }

        for(let i = 0; i < PlayerData.WEAPONS; i++){
            let slotWidth = itemWidth - 2 * hm;
            this.weaponSlots[i] = [i * itemWidth + hm, height - slotWidth - vm, slotWidth, slotWidth];
        }
    }
    mousePressed(){
        this.updateMouse();
        for(let i in this.slots){
            let [x, y, w, h] = this.slots[i];
            if(x <= this.mouseX && this.mouseX <= x + w && y <= this.mouseY && this.mouseY <= y + h && !this.selectedItem){
                this.selectedItem = this.curPlayer.playerData.items[i];
                this.curPlayer.playerData.items[i] = undefined;
            }
        }
    }
    mouseReleased() {
        for(let i in this.slots){
            let [x, y, w, h] = this.slots[i];
            if(x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h && this.selectedItem && !this.curPlayer.playerData.items[i]){
                this.curPlayer.playerData.items[i] = this.selectedItem;
                this.selectedItem = undefined;
            }
        }
        if(this.selectedItem){
            this.world.addEntity(this.selectedItem.physicalItem(this.curPlayer.x + this.curPlayer.width / 2, this.curPlayer.y + this.curPlayer.height / 2, this.world));
            this.selectedItem = undefined;
        }
    }
    tick(){
        this.updateMouse();
    }
    render(){
        this.updateSlots();
        fill(255);
        rect(10, 10, 40, 20, 5);
        fill(255, 0, 0);
        noStroke();
        textAlign(LEFT, TOP);
        text(Math.floor(this.curPlayer.timeLeft), 15, 15);

        let itemWidth = width / 2 / PlayerData.ITEMS;
        let innerMargin = 6;
        fill(235, 171, 54);
        noStroke();
        let [hm, vm] = [Default.hMargin, Default.vMargin];
        let slotWidth = itemWidth - 2 * hm;
        rect(0, height - slotWidth - 2 * vm, width, slotWidth + 2 * vm);
        for(let [i, el] of this.curPlayer.playerData.items.entries()){
            fill(255);
            stroke(0);
            strokeWeight(2);
            let [x, y, w, h] = this.slots[i];
            rect(x, y, w, h, 5);
            if(el){
                el.drawIcon(x + innerMargin, y + innerMargin, slotWidth - 2 * innerMargin, slotWidth - 2 * innerMargin);
            }
        }
        for(let [i, el] of this.curPlayer.playerData.weapons.entries()){
            fill(255);
            stroke(0);
            strokeWeight(2);
            let [x, y, w, h] = this.weaponSlots[i];
            rect(x, y, w, h, 5);
            if(el){
                el.drawIcon(x + innerMargin, y + innerMargin, slotWidth - 2 * innerMargin, slotWidth - 2 * innerMargin);
            }
        }

        if(this.selectedItem){
            this.selectedItem.drawIcon(this.mouseX - 10, this.mouseY - 10, 20, 20);
        }
    }
    exitState(){
        for(let i in this.curPlayer.playerData.items){
            if(this.selectedItem && !this.curPlayer.playerData.items[i]){
                this.curPlayer.playerData.items[i] = this.selectedItem;
                this.selectedItem = undefined;
            }
        }
    }
}
