function boxDist(x1, y1, w1, h1, x2, y2, w2, h2){
    let hDist = x1 <= x2 + w2 && x1 + w1 >= x2 ? 0 : min(abs(x2 - (x1 + w1)), abs(x1 - x2 - w2));
    let vDist = y1 <= y2 + h2 && y1 + h1 <= y2 ? 0 : min(abs(y2 - (y1 + h1)), abs(y1 - (y2 + h2)));
    return hDist + vDist;
}
