/**
 * PlayerData stores the data for the player - this is useful for when we switch between states
 */
class PlayerData{
    speed=2;
    health=100;
}

/**
 * a generic entity - interacts with the world
 */
class Entity{
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
    isTouching(other){
        return this.x <= other.x + other.width && this.x + this.width >= other.x &&
            this.y <= other.y + other.height && this.y + this.height >= other.y;
    }
}

/**
 * The player interacting with the world
 */
class Player{
    playerData;
    x;
    y;
    constructor(_playerData, _x, _y){
        this.playerData = _playerData;
        this.x = _x;
        this.y = _y;
    }
}
