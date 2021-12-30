// all perimeter tiles as an unordered array in view range
let perimeterTiles = [];
// tiles in range to be rendered as an unordered array
let renderedTiles = [];
// Map 0-4 to a corresponding wall side
const wallMap = {
    0: "1000", //left wall
    1: "0100", //top wall
    2: "0010", //right wall
    3: "0001", //bottom wall
    4: "0000", //floor
};

// A class that contains functions for
// manipulating and generating tiles
class TileController {
    // contains the stats of all tile types
    tileData = {};
    /* e.g
    tileData = {
        "brick":{
            "name":"brick",
            "varients":[
                // left top right bottom and floor textures are present respectively
                1,1,1,1,1
                // a 0 would mean that texture is not present
            ],
            "textures":{
                "1000":PImage{"brick1000.png"}, // left wall texture
                "0100":PImage{"brick0100.png"}, // top wall texture
                "0010":PImage{"brick0010.png"}, // right wall texture
                "0001":PImage{"brick0001.png"}  // bottom wall texture
                "0000":PImage{"brick0000.png"}, // floor texture
            }
        }
    }
    */

    // constructor
    constructor() {};
    setWorld(_world){
        this.world = _world;
    }
    // load tile data from Json
    init() {
        // load manifest
        loadJSON("data/tiles/manifest.json", (manifest) => {
            // for each tile type
            manifest.forEach(tile => {
                this.tileData[tile.name] = {
                    name: tile.name,
                    varients: tile.varients,
                    textures: {}
                };
                // load tile type textures
                for (let x in tile.varients) {
                    if (tile.varients[x]) {
                        const side = wallMap[x];
                        this.tileData[tile.name].textures[side] = loadImage(`data/tiles/sprites/${tile.name}/${tile.name}${side}.png`);
                    }
                }
            });
        });
    }
    // Gets all perimeter tiles that should be visible from a
    // given point and adds them to the renderedTiles array
    prepareRendered(x, y) {
        renderedTiles = [];
        for(let i = floor(this.world.curPlayer.x/Tile.WIDTH - 2);  i < floor(this.world.curPlayer.x/Tile.WIDTH + 3); i++) {
            for(let c = floor(this.world.curPlayer.y/Tile.HEIGHT - 2);  c < floor(this.world.curPlayer.y/Tile.HEIGHT + 3); c++) {
                renderedTiles.push(this.world.getTile(i, c));
            }
        }
    }
    // display tiles to the screen
    drawTiles() {
            
        // blendMode(MULTIPLY);
        renderedTiles.forEach((tile, index)=>{
            tile.draw();
        })
        // blendMode(BLEND);
    }
}

// Tile Controller instance
const tileController = new TileController();
