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
    static hMargin=5;
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
    inBox(x, y, w, h){
        return x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h;
    }
    mousePressed(){
        this.updateMouse();
        for(let i in this.weaponSlots){
            let [x, y, w, h] = this.weaponSlots[i];
            if(x <= this.mouseX && this.mouseX <= x + w && y <= this.mouseY && this.mouseY <= y + h && !this.selectedItem){
                this.selectedItem = this.curPlayer.playerData.weapons[i];
                this.curPlayer.playerData.weapons[[i]] = undefined;
                this.curPlayer.setWeapon();
            }
        }
        for(let i in this.slots){
            let [x, y, w, h] = this.slots[i];
            if(x <= this.mouseX && this.mouseX <= x + w && y <= this.mouseY && this.mouseY <= y + h && !this.selectedItem){
                this.selectedItem = this.curPlayer.playerData.items[i];
                this.curPlayer.playerData.items[i] = undefined;
            }
        }
    }
    mouseReleased() {
        if(this.selectedItem && this.selectedItem instanceof WeaponItem){
            for(let i in this.weaponSlots){
                let [x, y, w, h] = this.weaponSlots[i];
                if(this.inBox(x, y, w, h) && this.selectedItem && !this.curPlayer.playerData.weapons[i]){
                    this.curPlayer.playerData.weapons[i] = this.selectedItem;
                    this.curPlayer.setWeapon();
                    this.selectedItem = undefined;
                }
            }
        } else if (this.selectedItem && this.selectedItem instanceof InventoryItem){
            for(let i in this.slots){
                let [x, y, w, h] = this.slots[i];
                if(this.inBox(x, y, w, h) && this.selectedItem && !this.curPlayer.playerData.items[i]){
                    this.curPlayer.playerData.items[i] = this.selectedItem;
                    this.selectedItem = undefined;
                }
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
        fill(72,52,68)
        rect(10, 10, 90, 30, 5);
        fill(255, 0, 0);
        noStroke();
        textAlign(LEFT, CENTER);
        textFont(getFont("pacifico"));
        textSize(20);
        text(Math.floor(this.curPlayer.playerData.health), 15, 17);
        image(getSprite("torch"), 70, 10, 20, 30);

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
        fill(255);
        noStroke();
        beginShape();
        let [x, y, w] = this.weaponSlots[this.curPlayer.weaponInd];
        vertex(x + w / 2, y);
        vertex(x + w / 2 - vm / 2, y - vm);
        vertex(x + w / 2 + vm / 2, y - vm);
        endShape();

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
