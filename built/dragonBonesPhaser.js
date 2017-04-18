/**
 * git: https://github.com/raksa/phaser-dragonbones
 */

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Rift;
(function (Rift) {
    Rift.IMAGE = 2;
    Rift.JSON = 11;
    Rift.VERSION = "0.1";
    var DragonBonesPlugin = (function (_super) {
        __extends(DragonBonesPlugin, _super);
        function DragonBonesPlugin(game, parent) {
            var _this = _super.call(this, game, parent) || this;
            _this.Suffix = "DragonBonesPlugin";
            _this.ImageSuffix = '_Image_' + _this.Suffix;
            _this.TextureSuffix = '_TextureMap_' + _this.Suffix;
            _this.BonesSuffix = '_Bones_' + _this.Suffix;
            return _this;
        }
        DragonBonesPlugin.prototype.addResourceByNames = function (key, skeletonJson, textureJson, texturePng) {
            this.addResources(key, new Array(new Resource(ResType.Image, texturePng), new Resource(ResType.TextureMap, textureJson), new Resource(ResType.Bones, skeletonJson)));
        };
        DragonBonesPlugin.prototype.addResources = function (key, resources) {
            for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                var resource = resources_1[_i];
                this.addResource(key, resource);
            }
        };
        DragonBonesPlugin.prototype.addResource = function (key, res) {
            key = key.toLowerCase();
            var updated = false;
            for (var resKey in DragonBonesPlugin.objDictionary) {
                if (resKey == key) {
                    if (DragonBonesPlugin.objDictionary[resKey].resources.filter(function (resource) {
                        return resource.type === res.type;
                    }).length == 0)
                        DragonBonesPlugin.objDictionary[resKey].resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                DragonBonesPlugin.objDictionary[key] = new DragonBonesObject(this.game, new Array());
                DragonBonesPlugin.objDictionary[key].resources.push(res);
            }
        };
        DragonBonesPlugin.prototype.loadResources = function () {
            for (var resKey in DragonBonesPlugin.objDictionary) {
                for (var _i = 0, _a = DragonBonesPlugin.objDictionary[resKey].resources; _i < _a.length; _i++) {
                    var resource = _a[_i];
                    if (resource.loaded)
                        continue;
                    switch (resource.type) {
                        case ResType.Image:
                            this.game.load.image(resKey + this.ImageSuffix, resource.filePath);
                            break;
                        case ResType.TextureMap:
                            this.game.load.json(resKey + this.TextureSuffix, resource.filePath);
                            break;
                        case ResType.Bones:
                            this.game.load.json(resKey + this.BonesSuffix, resource.filePath);
                            break;
                    }
                    resource.loaded = true;
                }
            }
        };
        DragonBonesPlugin.prototype.createFactoryItem = function (key) {
            key = key.toLowerCase();
            for (var resKey in DragonBonesPlugin.objDictionary) {
                if (key && resKey != key)
                    continue;
                var oItem = DragonBonesPlugin.objDictionary[resKey];
                var item = new DragonBonesObject(this.game, oItem.resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.resources.length; i++) {
                    var res = item.resources[i];
                    switch (res.type) {
                        case ResType.Image:
                            image = this.game.cache.getItem(resKey + this.ImageSuffix, Rift.IMAGE).data;
                            break;
                        case ResType.TextureMap:
                            texture = this.game.cache.getItem(resKey + this.TextureSuffix, Rift.JSON).data;
                            break;
                        case ResType.Bones:
                            bones = this.game.cache.getItem(resKey + this.BonesSuffix, Rift.JSON).data;
                            break;
                    }
                }
                item.skeleton = item.factory.parseDragonBonesData(bones);
                item.factory.parseTextureAtlasData(texture, image);
                return item;
            }
            return null;
        };
        DragonBonesPlugin.prototype.getArmature = function (key, armatureName) {
            var item = this.createFactoryItem(key);
            if (armatureName == null)
                armatureName = item.skeleton.armatureNames[0];
            var armature = item.factory.buildArmatureDisplay(armatureName);
            item.armature = armature;
            this.refreshClock();
            return item.armature;
        };
        DragonBonesPlugin.prototype.refreshClock = function () {
            var hasEvent = false;
            var callback = dragonBones.PhaserFactory._clockHandler;
            this.game.time.events.events.forEach(function (event, index, events) {
                if (event.callback == callback) {
                    hasEvent = true;
                    return;
                }
            });
            if (!hasEvent)
                this.game.time.events.loop(20, dragonBones.PhaserFactory._clockHandler, dragonBones.PhaserFactory);
        };
        return DragonBonesPlugin;
    }(Phaser.Plugin));
    DragonBonesPlugin.objDictionary = {};
    Rift.DragonBonesPlugin = DragonBonesPlugin;
    var DragonBonesObject = (function () {
        function DragonBonesObject(game, resources) {
            this.factory = new dragonBones.PhaserFactory(null, game);
            this.resources = resources;
        }
        return DragonBonesObject;
    }());
    var Resource = (function () {
        function Resource(type, filePath) {
            this.loaded = false;
            this.type = type;
            this.filePath = filePath;
        }
        return Resource;
    }());
    Rift.Resource = Resource;
    var ResType;
    (function (ResType) {
        ResType[ResType["Image"] = 0] = "Image";
        ResType[ResType["TextureMap"] = 1] = "TextureMap";
        ResType[ResType["Bones"] = 2] = "Bones";
    })(ResType = Rift.ResType || (Rift.ResType = {}));
})(Rift || (Rift = {}));
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
        var matrixCache = targetCoordinateSpace.worldTransform;
        targetCoordinateSpace.worldTransform = PIXI.identityMatrix;
        for (i = 0; i < targetCoordinateSpace.children.length; i++) {
            targetCoordinateSpace.children[i].updateTransform();
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
        targetCoordinateSpace.worldTransform = matrixCache;
        for (i = 0; i < targetCoordinateSpace.children.length; i++) {
            targetCoordinateSpace.children[i].updateTransform();
        }
    }
    if (!isTargetCoordinateSpaceThisOrParent) {
        var targetCoordinateSpaceBounds = targetCoordinateSpace.getBounds();
        bounds.x -= targetCoordinateSpaceBounds.x;
        bounds.y -= targetCoordinateSpaceBounds.y;
    }
    return bounds;
};
var dragonBones;
(function (dragonBones) {
    var PhaserArmatureDisplay = (function (_super) {
        __extends(PhaserArmatureDisplay, _super);
        function PhaserArmatureDisplay(game) {
            var _this = _super.call(this, game, 0, 0, 0) || this;
            _this.game = null;
            _this.maxX = 0;
            _this.maxY = 0;
            _this.game = game;
            return _this;
        }
        PhaserArmatureDisplay.prototype.SetBounds = function (force) {
            if (force || this.maxX < this.getBounds().width)
                this.maxX = this.getBounds().width;
            if (force || this.maxY < this.getBounds().height)
                this.maxY = this.getBounds().height;
            this.body.setSize(this.maxX / 2, this.maxX / 2, this.maxY, 0);
        };
        PhaserArmatureDisplay.prototype._onClear = function () {
            this._armature = null;
            if (this._debugDrawer) {
                this._debugDrawer.destroy(true);
                this._debugDrawer = null;
            }
            this.destroy(true);
        };
        PhaserArmatureDisplay.prototype._dispatchEvent = function (eventObject) {
            //this.emit(eventObject.type, eventObject);
        };
        PhaserArmatureDisplay.prototype._debugDraw = function (isEnabled) {
            if (!this._debugDrawer) {
                this._debugDrawer = new Phaser.Graphics(this.game);
            }
            if (isEnabled) {
                this.addChild(this._debugDrawer);
                this._debugDrawer.clear();
                var bones = this._armature.getBones();
                for (var i = 0, l = bones.length; i < l; ++i) {
                    var bone = bones[i];
                    var boneLength = Math.max(bone.length, 5);
                    var startX = bone.globalTransformMatrix.tx;
                    var startY = bone.globalTransformMatrix.ty;
                    var endX = startX + bone.globalTransformMatrix.a * boneLength;
                    var endY = startY + bone.globalTransformMatrix.b * boneLength;
                    this._debugDrawer.lineStyle(1, bone.ik ? 0xFF0000 : 0x00FF00, 0.5);
                    this._debugDrawer.moveTo(startX, startY);
                    this._debugDrawer.lineTo(endX, endY);
                }
            }
            else if (this._debugDrawer && this._debugDrawer.parent === this) {
                this.removeChild(this._debugDrawer);
            }
        };
        /**
         * @inheritDoc
         */
        PhaserArmatureDisplay.prototype.hasEvent = function (type) {
            //return <boolean>this.listeners(type, true);
            return false;
        };
        /**
         * @inheritDoc
         */
        PhaserArmatureDisplay.prototype.addEvent = function (type, listener, target) {
            //this.addListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        PhaserArmatureDisplay.prototype.removeEvent = function (type, listener, target) {
            //this.removeListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        PhaserArmatureDisplay.prototype.advanceTimeBySelf = function (on) {
            if (on) {
                dragonBones.PhaserFactory._clock.add(this._armature);
            }
            else {
                dragonBones.PhaserFactory._clock.remove(this._armature);
            }
        };
        /**
         * @inheritDoc
         */
        PhaserArmatureDisplay.prototype.dispose = function () {
            if (this._armature) {
                this.advanceTimeBySelf(false);
                this._armature.dispose();
                this._armature = null;
            }
        };
        Object.defineProperty(PhaserArmatureDisplay.prototype, "armature", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PhaserArmatureDisplay.prototype, "animation", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature.animation;
            },
            enumerable: true,
            configurable: true
        });
        return PhaserArmatureDisplay;
    }(Phaser.Sprite));
    dragonBones.PhaserArmatureDisplay = PhaserArmatureDisplay;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    var PhaserFactory = (function (_super) {
        __extends(PhaserFactory, _super);
        function PhaserFactory(dataParser, game) {
            if (dataParser === void 0) { dataParser = null; }
            var _this = _super.call(this, dataParser) || this;
            _this.game = game;
            if (!PhaserFactory._eventManager) {
                PhaserFactory._eventManager = new dragonBones.PhaserArmatureDisplay(game);
                PhaserFactory._clock = new dragonBones.WorldClock();
            }
            return _this;
        }
        PhaserFactory._clockHandler = function (passedTime) {
            PhaserFactory._clock.advanceTime(-1); // passedTime !?
        };
        Object.defineProperty(PhaserFactory, "factory", {
            get: function (game) {
                if (!PhaserFactory._factory) {
                    PhaserFactory._factory = new PhaserFactory(null, game);
                }
                return PhaserFactory._factory;
            },
            enumerable: true,
            configurable: true
        });
        PhaserFactory.prototype._generateTextureAtlasData = function (textureAtlasData, textureAtlas) {
            if (textureAtlasData) {
                textureAtlasData.texture = textureAtlas;
            }
            else {
                textureAtlasData = dragonBones.BaseObject.borrowObject(dragonBones.PhaserTextureAtlasData);
            }
            return textureAtlasData;
        };
        /**
         * @private
         */
        PhaserFactory.prototype._generateArmature = function (dataPackage) {
            var armature = dragonBones.BaseObject.borrowObject(dragonBones.Armature);
            var armatureDisplayContainer = new dragonBones.PhaserArmatureDisplay(this.game);
            armature._armatureData = dataPackage.armature;
            armature._skinData = dataPackage.skin;
            armature._animation = dragonBones.BaseObject.borrowObject(dragonBones.Animation);
            armature._display = armatureDisplayContainer;
            armature._eventManager = PhaserFactory._eventManager;
            armatureDisplayContainer._armature = armature;
            armature._animation._armature = armature;
            armature.animation.animations = dataPackage.armature.animations;
            return armature;
        };
        /**
         * @private
         */
        PhaserFactory.prototype._generateSlot = function (dataPackage, slotDisplayDataSet) {
            var slot = dragonBones.BaseObject.borrowObject(dragonBones.PhaserSlot);
            var slotData = slotDisplayDataSet.slot;
            var displayList = [];
            slot.game = this.game;
            slot.name = slotData.name;
            slot._rawDisplay = new Phaser.Sprite(this.game, 0, 0);
            slot._meshDisplay = null;
            for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                var displayData = slotDisplayDataSet.displays[i];
                switch (displayData.type) {
                    case 0 /* Image */:
                        if (!displayData.texture) {
                            displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                        }
                        displayList.push(slot._rawDisplay);
                        break;
                    case 2 /* Mesh */:
                        if (!displayData.texture) {
                            displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                        }
                        displayList.push(slot._meshDisplay);
                        break;
                    case 1 /* Armature */:
                        var childArmature = this.buildArmature(displayData.name, dataPackage.dataName);
                        if (childArmature) {
                            if (!slot.inheritAnimation) {
                                var actions = slotData.actions.length > 0 ? slotData.actions : childArmature.armatureData.actions;
                                if (actions.length > 0) {
                                    for (var i_1 = 0, l_1 = actions.length; i_1 < l_1; ++i_1) {
                                        childArmature._bufferAction(actions[i_1]);
                                    }
                                }
                                else {
                                    childArmature.animation.play();
                                }
                            }
                            displayData.armature = childArmature.armatureData; // 
                        }
                        displayList.push(childArmature);
                        break;
                    default:
                        displayList.push(null);
                        break;
                }
            }
            slot._setDisplayList(displayList);
            return slot;
        };
        PhaserFactory.prototype.buildArmatureDisplay = function (armatureName, dragonBonesName, skinName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            var armature = this.buildArmature(armatureName, dragonBonesName, skinName);
            var armatureDisplay = armature ? armature._display : null;
            if (armatureDisplay) {
                armatureDisplay.advanceTimeBySelf(true);
            }
            return armatureDisplay;
        };
        PhaserFactory.prototype.getTextureDisplay = function (textureName, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            var textureData = this._getTextureData(dragonBonesName, textureName);
            if (textureData) {
                if (!textureData.texture) {
                    var textureAtlasTexture = textureData.parent.texture;
                    var originSize = new Phaser.Rectangle(0, 0, textureData.region.width, textureData.region.height);
                    textureData.texture = new PIXI.Texture(textureAtlasTexture, textureData.region, originSize);
                }
                return new Phaser.Sprite(this.game, 0, 0, textureData.texture);
            }
            return null;
        };
        Object.defineProperty(PhaserFactory.prototype, "soundEventManater", {
            get: function () {
                return PhaserFactory._eventManager;
            },
            enumerable: true,
            configurable: true
        });
        return PhaserFactory;
    }(dragonBones.BaseFactory));
    PhaserFactory._factory = null;
    PhaserFactory._eventManager = null;
    PhaserFactory._clock = null;
    dragonBones.PhaserFactory = PhaserFactory;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    var PhaserSlot = (function (_super) {
        __extends(PhaserSlot, _super);
        function PhaserSlot() {
            return _super.call(this) || this;
        }
        PhaserSlot.toString = function () {
            return "[class dragonBones.PhaserSlot]";
        };
        PhaserSlot.prototype.set_game = function () {
        };
        PhaserSlot.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._renderDisplay = null;
        };
        PhaserSlot.prototype._initDisplay = function (value) {
        };
        PhaserSlot.prototype._disposeDisplay = function (value) {
            value.destroy();
        };
        PhaserSlot.prototype._onUpdateDisplay = function () {
            this._renderDisplay = (this._display || this._rawDisplay);
        };
        /**
         * @private
         */
        PhaserSlot.prototype._addDisplay = function () {
            var container = this._armature._display;
            container.addChild(this._renderDisplay);
        };
        /**
         * @private
         */
        PhaserSlot.prototype._replaceDisplay = function (value) {
            var container = this._armature._display;
            var prevDisplay = value;
            container.addChild(this._renderDisplay);
            container.swapChildren(this._renderDisplay, prevDisplay);
            container.removeChild(prevDisplay);
        };
        /**
         * @private
         */
        PhaserSlot.prototype._removeDisplay = function () {
            this._renderDisplay.parent.removeChild(this._renderDisplay);
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateVisible = function () {
            this._renderDisplay.visible = this._parent.visible;
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateBlendMode = function () {
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateColor = function () {
            this._renderDisplay.alpha = this._colorTransform.alphaMultiplier;
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateFilters = function () { };
        /**
         * @private
         */
        PhaserSlot.prototype._updateFrame = function () {
            var frameDisplay = this._renderDisplay;
            if (this._display) {
                var rawDisplayData = this._displayIndex < this._displayDataSet.displays.length ? this._displayDataSet.displays[this._displayIndex] : null;
                var replacedDisplayData = this._displayIndex < this._replacedDisplayDataSet.length ? this._replacedDisplayDataSet[this._displayIndex] : null;
                var currentDisplayData = replacedDisplayData || rawDisplayData;
                var currentTextureData = currentDisplayData.texture;
                if (currentTextureData) {
                    var textureAtlasTexture = currentTextureData.parent.texture;
                    if (!currentTextureData.texture && textureAtlasTexture) {
                        var originSize = new PIXI.Rectangle(0, 0, currentTextureData.region.width, currentTextureData.region.height);
                        currentTextureData.texture = new PIXI.Texture(textureAtlasTexture, currentTextureData.region, // No need to set frame.
                        currentTextureData.region, originSize, currentTextureData.rotated);
                    }
                    var texture = (this._armature._replacedTexture || currentTextureData.texture);
                    this._updatePivot(rawDisplayData, currentDisplayData, currentTextureData);
                    if (texture && texture.frame) {
                        frameDisplay.setTexture(texture);
                        frameDisplay.width = texture.frame.width;
                        frameDisplay.height = texture.frame.height;
                        frameDisplay.texture.baseTexture.skipRender = false;
                    }
                    texture.baseTexture.resolution = 1;
                    texture.baseTexture.source = textureAtlasTexture;
                    this._updateVisible();
                    return;
                }
            }
            this._pivotX = 0;
            this._pivotY = 0;
            frameDisplay.visible = false;
            frameDisplay.texture = null;
            frameDisplay.x = this.origin.x;
            frameDisplay.y = this.origin.y;
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateMesh = function () {
            var meshDisplay = null; //<PIXI.mesh.Mesh>this._meshDisplay;
            var hasFFD = this._ffdVertices.length > 0;
            if (this._meshData.skinned) {
                for (var i = 0, iF = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    var iH = i / 2;
                    var boneIndices = this._meshData.boneIndices[iH];
                    var boneVertices = this._meshData.boneVertices[iH];
                    var weights = this._meshData.weights[iH];
                    var xG = 0, yG = 0;
                    for (var iB = 0, lB = boneIndices.length; iB < lB; ++iB) {
                        var bone = this._meshBones[boneIndices[iB]];
                        var matrix = bone.globalTransformMatrix;
                        var weight = weights[iB];
                        var xL = 0, yL = 0;
                        if (hasFFD) {
                            xL = boneVertices[iB * 2] + this._ffdVertices[iF];
                            yL = boneVertices[iB * 2 + 1] + this._ffdVertices[iF + 1];
                        }
                        else {
                            xL = boneVertices[iB * 2];
                            yL = boneVertices[iB * 2 + 1];
                        }
                        xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
                        yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
                        iF += 2;
                    }
                    meshDisplay.vertices[i] = xG;
                    meshDisplay.vertices[i + 1] = yG;
                }
            }
            else if (hasFFD) {
                var vertices = this._meshData.vertices;
                for (var i = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    var xG = vertices[i] + this._ffdVertices[i];
                    var yG = vertices[i + 1] + this._ffdVertices[i + 1];
                    meshDisplay.vertices[i] = xG;
                    meshDisplay.vertices[i + 1] = yG;
                }
            }
        };
        /**
         * @private
         */
        PhaserSlot.prototype._updateTransform = function () {
            this._renderDisplay.x = this.global.x;
            this._renderDisplay.y = this.global.y;
            this._renderDisplay.rotation = this.global.skewX;
            this._renderDisplay.scale.x = this.global.scaleX;
            this._renderDisplay.scale.y = this.global.scaleY;
            this._renderDisplay.pivot.x = this._pivotX;
            this._renderDisplay.pivot.y = this._pivotY;
        };
        return PhaserSlot;
    }(dragonBones.Slot));
    dragonBones.PhaserSlot = PhaserSlot;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    var PhaserTextureAtlasData = (function (_super) {
        __extends(PhaserTextureAtlasData, _super);
        function PhaserTextureAtlasData() {
            return _super.call(this) || this;
        }
        PhaserTextureAtlasData.toString = function () {
            return "[class dragonBones.PhaserTextureAtlasData]";
        };
        PhaserTextureAtlasData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                this.texture = null;
            }
        };
        /**
         * @private
         */
        PhaserTextureAtlasData.prototype.generateTextureData = function () {
            return dragonBones.BaseObject.borrowObject(PhaserTextureData);
        };
        return PhaserTextureAtlasData;
    }(dragonBones.TextureAtlasData));
    dragonBones.PhaserTextureAtlasData = PhaserTextureAtlasData;
    var PhaserTextureData = (function (_super) {
        __extends(PhaserTextureData, _super);
        function PhaserTextureData() {
            return _super.call(this) || this;
        }
        PhaserTextureData.toString = function () {
            return "[class dragonBones.PhaserTextureData]";
        };
        /**
         * @inheritDoc
         */
        PhaserTextureData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                this.texture.destroy(false);
                this.texture = null;
            }
        };
        return PhaserTextureData;
    }(dragonBones.TextureData));
    dragonBones.PhaserTextureData = PhaserTextureData;
})(dragonBones || (dragonBones = {}));