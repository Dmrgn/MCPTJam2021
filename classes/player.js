/**
 * PlayerData stores the data for the player - this is useful for when we switch between states
 */
class PlayerData {
    health;
    items;
    static ITEMS = 8;

    constructor(_health) {
        this.health = _health;
        this.items = new Array(PlayerData.ITEMS).fill(undefined);
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
}

/**
 * The player interacting with the world
 */
class Player extends Entity {
    playerData;
    static WIDTH = 20;
    static HEIGHT = 40;
    timeLeft;

    constructor(_playerData, _x, _y, startTime) {
        super(_x, _y, Player.WIDTH, Player.HEIGHT, ["Foreground"]);
        this.playerData = _playerData;
        this.timeLeft = startTime;
    }

    render() {
        fill(255);
        rect(this.x, this.y, this.width, this.height);
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

    reduceTimer(amt){
        this.timeLeft -= amt;
        return this.timeLeft <= 0;
    }
}
