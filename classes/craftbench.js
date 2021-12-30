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
        fill(100);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }
}
