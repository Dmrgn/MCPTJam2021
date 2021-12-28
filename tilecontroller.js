// all tiles as an unordered array
let tiles = [];
// all perimeter tiles as an unordered array in view range
let perimeterTiles = [];
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

// percentage chance a tile will generate without
// putting a wall on any given side
let airation = 90;

// A class that contains functions for
// minipulting and generating tiles 
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
    // random function which returns whether a wall 
    // should be generated based on predefined odds
    // see const airation above
    odds() {
        return floor(random(0, 100)) <= airation ? 0 : 1;
    }
    // generates a static grid of tiles
    // super temporary
    generateMap() {
        tilesMap = [];
        for(let i = 0 ; i*Tile.WIDTH < width; i++) {
            tilesMap.push([]);
            for(let j = 0 ; j*Tile.HEIGHT < height; j++) {
                // FIX
                // currently each tile is hard coded to have type brick
                // in the future, create mechanism of determining which
                // types are availible based on which walls are present
                tilesMap[i].push(new Tile(i,j,this.tileData.brick, [this.odds(),this.odds(),this.odds(),this.odds()]));
                tiles.push(tilesMap[i][j]);
            }
        }
    }
    // Uses the maze generator to generate and push tiles
    // around the passed point in a box with side length
    // k (Controls the logic distance)
    preparePerimeter(r, c, k){
        console.log(perimeterTiles.length);
        perimeterTiles = [];
        for (let i = r-floor(k/2); i < r+floor(k/2)+1; i++) {
            for (let j = c-floor(k/2); j < c+floor(k/2)+1; j++) {
                if (!tilesMap[i]?.[j]) {
                    this.createTile(i,j);
                }
                perimeterTiles.push(tilesMap[i][j]);
            }
        }
    }
    // Creates the tile at r,c and returns it
    // also adds it to tiles and tilemap array
    createTile(r,c){
        let walls = [];
        for (let i = 0 ; i < 4; i++)
            walls.push(maze.hasWall(r,c,i));
        if (!tilesMap[r]?.[c]) tilesMap[r] = [];
        tilesMap[r][c] = new Tile(r,c,this.tileData.brick,walls);
        tiles.push(tilesMap[r][c]);
        return tilesMap[r][c];
    }
    // display tiles to the screen
    drawTiles() {
        perimeterTiles.forEach(tile=>{
            tile.draw();
        });
    }
}

// Tile Controller instance
const tileController = new TileController();