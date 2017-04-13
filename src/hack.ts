//HACK TO FIX NULL TEXTURE
PIXI.Sprite.prototype.setTexture = function (texture, destroyBase) {
    if (destroyBase !== undefined) {
        this.texture.baseTexture.destroy();
    }

    //  Over-ridden by loadTexture as needed
    this.texture = texture;
    this.texture.baseTexture.skipRender = false;
    this.texture.valid = true;
    this.cachedTint = -1;
};

//HACK TO MAKE BOUNDRY BOX SCALE TO ANIMATION SIZE (if used)
PIXI.Sprite.prototype.getBounds = function (targetCoordinateSpace) {
    var isTargetCoordinateSpaceDisplayObject = (targetCoordinateSpace && targetCoordinateSpace instanceof PIXI.DisplayObject);
    var isTargetCoordinateSpaceThisOrParent = true;

    if (!isTargetCoordinateSpaceDisplayObject) {
        targetCoordinateSpace = this;
    }
    else if (targetCoordinateSpace instanceof PIXI.DisplayObjectContainer) {
        isTargetCoordinateSpaceThisOrParent = targetCoordinateSpace.contains(this);
    }
    else {
        isTargetCoordinateSpaceThisOrParent = false;
    }

    var i;

    if (isTargetCoordinateSpaceDisplayObject) {
        var matrixCache = (<any>targetCoordinateSpace).worldTransform;

        (<any>targetCoordinateSpace).worldTransform = PIXI.identityMatrix;

        for (i = 0; i < (<any>targetCoordinateSpace).children.length; i++) {
            (<any>targetCoordinateSpace).children[i].updateTransform();
        }
    }

    var minX = Infinity;
    var minY = Infinity;

    var maxX = -Infinity;
    var maxY = -Infinity;

    var childBounds;
    var childMaxX;
    var childMaxY;

    var childVisible = false;

    for (i = 0; i < this.children.length; i++) {
        var child = this.children[i];

        if (!child.visible) {
            continue;
        }

        childVisible = true;

        childBounds = this.children[i].getBounds();

        minX = (minX < childBounds.x) ? minX : childBounds.x;
        minY = (minY < childBounds.y) ? minY : childBounds.y;

        childMaxX = childBounds.width + childBounds.x;
        childMaxY = childBounds.height + childBounds.y;

        maxX = (maxX > childMaxX) ? maxX : childMaxX;
        maxY = (maxY > childMaxY) ? maxY : childMaxY;
    }

    var bounds = this._bounds;

    if (!childVisible) {
        bounds = new PIXI.Rectangle();

        var w0 = bounds.x;
        var w1 = bounds.width + bounds.x;

        var h0 = bounds.y;
        var h1 = bounds.height + bounds.y;

        var worldTransform = this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 = a * w1 + c * h0 + tx;
        var y4 = d * h0 + b * w1 + ty;

        maxX = x1;
        maxY = y1;

        minX = x1;
        minY = y1;

        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
    }

    bounds.x = minX;
    bounds.y = minY;
    bounds.width = maxX - minX;
    bounds.height = maxY - minY;

    if (isTargetCoordinateSpaceDisplayObject) {
        (<any>targetCoordinateSpace).worldTransform = matrixCache;

        for (i = 0; i < (<any>targetCoordinateSpace).children.length; i++) {
            (<any>targetCoordinateSpace).children[i].updateTransform();
        }
    }

    if (!isTargetCoordinateSpaceThisOrParent) {
        var targetCoordinateSpaceBounds = (<any>targetCoordinateSpace).getBounds();

        bounds.x -= targetCoordinateSpaceBounds.x;
        bounds.y -= targetCoordinateSpaceBounds.y;
    }

    return bounds;
};