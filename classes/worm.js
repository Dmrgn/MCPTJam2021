// A pathfinding worm to ensure only rendering possibly visible tiles

// update tiles within vision distance to be drawn
const vision = 4;

// the direction, its index, and its opposites index
const dirdata = [
    {x:-1,y:0,i:0,o:2},
    {x:0,y:-1,i:1,o:3},
    {x:1,y:0,i:2,o:0},
    {x:0,y:1,i:3,o:1}
];

// all current worms
let worms = [];

class Worm{
    constructor(x,y,dist) {
        this.x = x;
        this.y = y;
        const thistile = tilesMap?.[this.x]?.[this.y];
        if (dist < vision && thistile != undefined) {
            for (let i = 0 ; i < dirdata.length; i++) {
                let nexttile = tilesMap?.[this.x+dirdata[i].x]?.[this.y+dirdata[i].y];
                if (nexttile != undefined) {
                    if (!(nexttile.walls[dirdata[i].o]) && !(thistile.walls[dirdata[i].i])) { //if the path is clear
                        worms.push(new Worm(nexttile.x,nexttile.y,dist+((dirdata[i].i == 3 || dirdata[i] == 1) ? 1 : 1)));
                    }
                }
            }
        }
    }
}