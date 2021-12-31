function boxDist(x1, y1, w1, h1, x2, y2, w2, h2){
    let hDist = x1 <= x2 + w2 && x1 + w1 >= x2 ? 0 : min(abs(x2 - (x1 + w1)), abs(x1 - (x2 + w2)));
    let vDist = y1 <= y2 + h2 && y1 + h1 >= y2 ? 0 : min(abs(y2 - (y1 + h1)), abs(y1 - (y2 + h2)));
    return hDist + vDist;
}

let images = new Map();
let videos = new Map();
let fonts = new Map();

function loadSprites(){
    loadJSON("data/manifest.json", (manifest) => {
        for(let type in manifest){
            let things = manifest[type]
            for(let name in things){
                let path = things[name]
                if(type === "image"){
                    images.set(name, loadImage("data/" + path));
                } else if (type === "video"){
                    videos.set(name, createVideo("data/" + path));
                    getSprite(name).hide();
                } else if (type === "font"){
                    fonts.set(name, loadFont("data/" + path));
                }
            }
        }
    })
}

function getSprite(name){
    if(images.has(name)) return images.get(name);
    if(videos.has(name)) return videos.get(name);
    throw "Couldn't find " + name + " sprite!";
}

function getFont(name){
    if(fonts.has(name)) return fonts.get(name);
    throw "Couldn't find " + name + " font!";
}
