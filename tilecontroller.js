// all tiles as an unordered array
let tiles = [];
// tiles in range to be rendered as an unordered array
let renderedTiles = [];
// tiles positioned in a two dimentional array with indicies of their x,y coords
let tilesMap = [];
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
    maze;

    // constructor
    constructor(seed) {
        this.maze = new Maze(10, seed);
    };
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
    // display tiles to the screen
    drawTiles() {
        // iterate through each tile cell
        for(let tx = 0; tx * Tile.WIDTH < width; tx++){
            for(let ty = 0; ty * Tile.HEIGHT < height; ty++){
                // draw the tile
                // TODO other Daniel I added the maze generation - could you check the code to make sure there isn't any blatant screwups :blobheart:
                let tile = new Tile(tx, ty, this.tileData.brick, this.maze.getTile(tx, ty));
                tile.draw();
            }
        }
    }
}

// Tile Controller instance
const tileController = new TileController(8732487234);
