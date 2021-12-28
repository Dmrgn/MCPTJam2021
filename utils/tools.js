// Tools class
class Tools {
    // stores the images
    images = {};
    constructor() {
        
    }
    // loads
    init() {
        // loads images from the json file
        loadJSON("data/manifest.json", function (manifest) {
            for (let name in manifest) {
                tools.images[name] = loadImage("data/" + manifest[name]);
            }
        });
    }
}

// shorthand for getting an image
function img(id) {
    return tools.images[id];
}

const tools = new Tools();