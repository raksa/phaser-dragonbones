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

//PLUGIN
module Rift {
    export class PhaserBones extends Phaser.Plugin {
        private static ObjDictionary: { [key: string]: PhaserBones.Object } = {}
        private Suffix: string = "PhaserBones";        
        public ImageSuffix: string = '_Image_' + this.Suffix;
        public TextureSuffix: string = '_TextureMap_' + this.Suffix;
        public BonesSuffix: string = '_Bones_' + this.Suffix;
        public Cache: PhaserBones.ICache;
        public static IMAGE: number = 2;
        public static JSON: number = 11;
        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);
            this.Cache = this.game.cache;
        }

        AddResourceByName(key:string,path:string): void {
            this.AddResources( key, new Array<Rift.PhaserBones.Resource>(
                    new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.Image, path + 'texture.png')
                    , new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.TextureMap, path + 'texture.json')
                    , new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.Bones, path + 'skeleton.json')
                )
            );
        }

        public GenerateFilesList(key: string, path: string): { [key: string]: { [key: string]: string }[] } {
            this.AddResources(key, new Array<Rift.PhaserBones.Resource>(
                    new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.Image, path + 'texture.png')
                    , new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.TextureMap, path + 'texture.json')
                    , new Rift.PhaserBones.Resource(Rift.PhaserBones.Enums.ResType.Bones, path + 'skeleton.json')
                )
            );
            return {
                [path] : [
                    {
                        "file": "texture",
                        "ext": "png",
                        "key": key + this.ImageSuffix
                    },
                    {
                        "file": "texture",
                        "ext": "json",
                        "key": key + this.TextureSuffix
                    },
                    {
                        "file": "skeleton",
                        "ext": "json",
                        "key": key + this.BonesSuffix
                    }
                ]
            }
        }

        AddResources(key: string, res: PhaserBones.Resource[]): void {
            for (var i = 0; i < res.length; i++) {
                this.AddResource(key, res[i]);
            }
        }

        AddResource(key: string, res: PhaserBones.Resource): void {
            key = key.toLowerCase();
            var updated : boolean = false;
            for (var reskey in PhaserBones.ObjDictionary)
            {
                if (reskey == key)
                {
                    if (PhaserBones.ObjDictionary[reskey].Resources.filter(function (thisres) { return thisres.Type === res.Type }).length == 0) PhaserBones.ObjDictionary[reskey].Resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated)
            {
                PhaserBones.ObjDictionary[key] = new PhaserBones.Object(new Array<PhaserBones.Resource>());
                PhaserBones.ObjDictionary[key].Resources.push(res);
            }
        }

        LoadResources() : void {
            for (var reskey in PhaserBones.ObjDictionary) {
                for (var i = 0; i < PhaserBones.ObjDictionary[reskey].Resources.length; i++) {
                    var item = PhaserBones.ObjDictionary[reskey].Resources[i];
                    if (item.Loaded) continue;
                    switch (item.Type) {
                        case PhaserBones.Enums.ResType.Image:
                            this.game.load.image(reskey + this.ImageSuffix, item.FilePath);
                            break;
                        case PhaserBones.Enums.ResType.TextureMap:
                            this.game.load.json(reskey + this.TextureSuffix, item.FilePath);
                            break;
                        case PhaserBones.Enums.ResType.Bones:
                            this.game.load.json(reskey + this.BonesSuffix, item.FilePath);
                            break;
                    }
                    item.Loaded = true;
                }
            }
        }

        CreateFactoryItem(key: string) {
            key = key.toLowerCase();
            for (var reskey in PhaserBones.ObjDictionary) {
                if (key && reskey != key) continue;
                var oitem = PhaserBones.ObjDictionary[reskey];
                var item = new PhaserBones.Object(oitem.Resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.Resources.length; i++) {
                    var res = item.Resources[i];
                    switch (res.Type) {
                        case PhaserBones.Enums.ResType.Image:
                            image = this.Cache.getItem(reskey + this.ImageSuffix, Rift.PhaserBones.IMAGE).data;
                            break;
                        case PhaserBones.Enums.ResType.TextureMap:
                            texture = this.Cache.getItem(reskey + this.TextureSuffix, Rift.PhaserBones.JSON).data;
                            break;
                        case PhaserBones.Enums.ResType.Bones:
                            bones = this.Cache.getItem(reskey + this.BonesSuffix, Rift.PhaserBones.JSON).data;
                            break;
                    }
                }
                item.Skeleton = item.Factory.parseDragonBonesData(bones);
                item.Factory.parseTextureAtlasData(texture, image);               
                return item;
            }
            return null;
        }
        
        GetArmature(key: string, armatureName?: string): dragonBones.PhaserArmatureDisplay {
            var item = this.CreateFactoryItem(key);
            if (armatureName == null) armatureName = item.Skeleton.armatureNames[0];      
            var armature = item.Factory.buildArmatureDisplay(armatureName);
            item.Armature = armature;            
            this.RefreshClock();
            return item.Armature;
        }     

        RefreshClock() : void {
            var hasEvent: boolean = false;
            var callback = dragonBones.PhaserFactory._clockHandler;
            this.game.time.events.events.forEach(function (event, index, array) {
                if (event.callback == callback) {
                    hasEvent = true;
                    return;
                }
            });
            if (!hasEvent) this.game.time.events.loop(20, dragonBones.PhaserFactory._clockHandler, dragonBones.PhaserFactory);
        }   
    }

    export module PhaserBones {
        export interface ICache {
            getItem(key: string, cache: number, method?: string, property?: string): any;
        }
        export class Object {
            public Resources: PhaserBones.Resource[];
            public Skeleton: dragonBones.DragonBonesData;
            public Factory: dragonBones.PhaserFactory = new dragonBones.PhaserFactory();
            public Armature: dragonBones.PhaserArmatureDisplay;
            constructor(resources: PhaserBones.Resource[]) {
                this.Resources = resources;
            }
        }

        export class Resource {
            public Type: PhaserBones.Enums.ResType;
            public FilePath: string;
            public Loaded: boolean = false; 
            public Cache: any;  
            public CacheKey: string;  
            constructor(type: PhaserBones.Enums.ResType, filepath: string) {
                this.Type = type;
                this.FilePath = filepath;
            }
        }

        export module Enums {
            export enum ResType {
                Image
                , TextureMap
                , Bones
            }
        }
    }    
}

namespace dragonBones {

    declare var game: Phaser.Game;

    export class PhaserFactory extends dragonBones.BaseFactory {
        private static _factory: PhaserFactory = null;

        public static _eventManager: PhaserArmatureDisplay = null;

        public static _clock: WorldClock = null;

        public static _clockHandler(passedTime: number): void {
            PhaserFactory._clock.advanceTime(-1); // passedTime !?
        }

        public static get factory(): PhaserFactory {
            if (!PhaserFactory._factory) {
                PhaserFactory._factory = new PhaserFactory();
            }

            return PhaserFactory._factory;
        }

        public constructor(dataParser: DataParser = null) {
            super(dataParser);

            if (!PhaserFactory._eventManager) {
                PhaserFactory._eventManager = new PhaserArmatureDisplay();
                PhaserFactory._clock = new dragonBones.WorldClock();               
            }
        }

        protected _generateTextureAtlasData(textureAtlasData: PhaserTextureAtlasData, textureAtlas: PIXI.BaseTexture): PhaserTextureAtlasData {
            if (textureAtlasData) {
                textureAtlasData.texture = textureAtlas;
            } else {
                textureAtlasData = dragonBones.BaseObject.borrowObject(PhaserTextureAtlasData);
            }

            return textureAtlasData;
        }
        /**
         * @private
         */
        protected _generateArmature(dataPackage: BuildArmaturePackage): Armature {
            const armature = dragonBones.BaseObject.borrowObject(dragonBones.Armature);
            const armatureDisplayContainer = new PhaserArmatureDisplay();

            armature._armatureData = dataPackage.armature;
            armature._skinData = dataPackage.skin;
            armature._animation = dragonBones.BaseObject.borrowObject(dragonBones.Animation);
            armature._display = armatureDisplayContainer;
            armature._eventManager = PhaserFactory._eventManager;

            armatureDisplayContainer._armature = armature;
            armature._animation._armature = armature;

            armature.animation.animations = dataPackage.armature.animations;

            return armature;
        }
        /**
         * @private
         */
        protected _generateSlot(dataPackage: BuildArmaturePackage, slotDisplayDataSet: SlotDisplayDataSet): dragonBones.Slot {
            const slot = dragonBones.BaseObject.borrowObject(PhaserSlot);
            const slotData = slotDisplayDataSet.slot;
            const displayList = [];

            slot.name = slotData.name;
            slot._rawDisplay = new Phaser.Sprite(game, 0, 0);
            slot._meshDisplay = null;

            for (let i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                const displayData = slotDisplayDataSet.displays[i];
                switch (displayData.type) {
                    case DisplayType.Image:
                        if (!displayData.texture) {
                            displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                        }

                        displayList.push(slot._rawDisplay);
                        break;

                    case DisplayType.Mesh:
                        if (!displayData.texture) {
                            displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                        }

                        displayList.push(slot._meshDisplay);
                        break;

                    case DisplayType.Armature:
                        const childArmature = this.buildArmature(displayData.name, dataPackage.dataName);
                        if (childArmature) {
                            if (!slot.inheritAnimation) {
                                const actions = slotData.actions.length > 0 ? slotData.actions : childArmature.armatureData.actions;
                                if (actions.length > 0) {
                                    for (let i = 0, l = actions.length; i < l; ++i) {
                                        childArmature._bufferAction(actions[i]);
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
        }

        public buildArmatureDisplay(armatureName: string, dragonBonesName: string = null, skinName: string = null): PhaserArmatureDisplay {
            const armature = this.buildArmature(armatureName, dragonBonesName, skinName);
            const armatureDisplay = armature ? <PhaserArmatureDisplay>armature._display : null;
            if (armatureDisplay) {
                armatureDisplay.advanceTimeBySelf(true);
            }
            return armatureDisplay;
        }

        public getTextureDisplay(textureName: string, dragonBonesName: string = null): Phaser.Sprite {
            const textureData = <PhaserTextureData>this._getTextureData(dragonBonesName, textureName);
            if (textureData) {
                if (!textureData.texture) {
                    const textureAtlasTexture = (<PhaserTextureAtlasData>textureData.parent).texture;
                    const originSize = new Phaser.Rectangle(0, 0, textureData.region.width, textureData.region.height);
                    textureData.texture = new PIXI.Texture(
                        textureAtlasTexture,
                        <PIXI.Rectangle><any>textureData.region,
                        <PIXI.Rectangle><any>originSize
                    );
                }

                return new Phaser.Sprite(game, 0, 0, textureData.texture);
            }

            return null;
        }

        public get soundEventManater(): PhaserArmatureDisplay {
            return PhaserFactory._eventManager;
        }
    }
}
namespace dragonBones {
    export class PhaserTextureAtlasData extends dragonBones.TextureAtlasData {
        public static toString(): string {
            return "[class dragonBones.PhaserTextureAtlasData]";
        }
        public texture: PIXI.BaseTexture;
        public constructor() {
            super();
        }
        protected _onClear(): void {
            super._onClear();

            if (this.texture) {
                this.texture = null;
            }
        }
        /**
         * @private
         */
        public generateTextureData(): TextureData {
            return dragonBones.BaseObject.borrowObject(PhaserTextureData);
        }
    }
    /**
     * @private
     */
    export class PhaserTextureData extends dragonBones.TextureData {
        public static toString(): string {
            return "[class dragonBones.PhaserTextureData]";
        }

        public texture: PIXI.Texture;

        public constructor() {
            super();
        }
        /**
         * @inheritDoc
         */
        protected _onClear(): void {
            super._onClear();

            if (this.texture) {
                this.texture.destroy(false);
                this.texture = null;
            }
        }
    }
}
namespace dragonBones {

    declare var game: Phaser.Game;

    export class PhaserSlot extends dragonBones.Slot {
        public static toString(): string {
            return "[class dragonBones.PhaserSlot]";
        }

        private _renderDisplay: Phaser.Sprite;

        public constructor() {
            super();
        }

        public set_game() {

        }

        protected _onClear(): void {
            super._onClear();

            this._renderDisplay = null;
        }

        protected _initDisplay(value: Object): void {
        }

        protected _disposeDisplay(value: Object): void {
            (<any>value).destroy();
        }

        protected _onUpdateDisplay(): void {
            if (!this._rawDisplay) {
                this._rawDisplay = new Phaser.Sprite(game, 0, 0);
            }

            this._renderDisplay = <Phaser.Sprite>(this._display || this._rawDisplay);
        }
        /**
         * @private
         */
        protected _addDisplay(): void {
            const container = <PhaserArmatureDisplay>this._armature._display;
            container.addChild(this._renderDisplay);
        }
        /**
         * @private
         */
        protected _replaceDisplay(value: Object): void {
            const container = <PhaserArmatureDisplay>this._armature._display;
            const prevDisplay = <Phaser.Sprite>value;
            container.addChild(this._renderDisplay);
            container.swapChildren(this._renderDisplay, prevDisplay);
            container.removeChild(prevDisplay);
        }
        /**
         * @private
         */
        protected _removeDisplay(): void {
            this._renderDisplay.parent.removeChild(this._renderDisplay);
        }
        /**
         * @private
         */
        public _updateVisible(): void {
            this._renderDisplay.visible = this._parent.visible;
        }
        /**
         * @private
         */
        protected _updateBlendMode(): void {

        }

        /**
         * @private
         */
        protected _updateColor(): void {
            this._renderDisplay.alpha = this._colorTransform.alphaMultiplier;
        }
        /**
         * @private
         */
        protected _updateFilters(): void { }
        /**
         * @private
         */
        protected _updateFrame(): void {
            const frameDisplay = <Phaser.Sprite>this._renderDisplay;

            if (this._display) {
                const rawDisplayData = this._displayIndex < this._displayDataSet.displays.length ? this._displayDataSet.displays[this._displayIndex] : null;
                const replacedDisplayData = this._displayIndex < this._replacedDisplayDataSet.length ? this._replacedDisplayDataSet[this._displayIndex] : null;
                const currentDisplayData = replacedDisplayData || rawDisplayData;
                const currentTextureData = <PhaserTextureData>currentDisplayData.texture;
                if (currentTextureData) {
                    const textureAtlasTexture = (<PhaserTextureAtlasData>currentTextureData.parent).texture;
                    if (!currentTextureData.texture && textureAtlasTexture) { // Create and cache texture.
                        const originSize = new PIXI.Rectangle(0, 0, currentTextureData.region.width, currentTextureData.region.height);
                        currentTextureData.texture = new PIXI.Texture(
                            textureAtlasTexture,
                            <PIXI.Rectangle><any>currentTextureData.region, // No need to set frame.
                            <PIXI.Rectangle><any>currentTextureData.region,
                            originSize,
                            currentTextureData.rotated
                        );
                    }

                    const texture = <PIXI.Texture>(this._armature._replacedTexture || currentTextureData.texture);
                    this._updatePivot(rawDisplayData, currentDisplayData, currentTextureData);

                    if (texture && texture.frame)
                    {
                        frameDisplay.setTexture(texture);
                        frameDisplay.width = texture.frame.width;
                        frameDisplay.height = texture.frame.height;                         
                        frameDisplay.texture.baseTexture.skipRender = false;                       
                    }      

                    (<any>texture.baseTexture).resolution = 1;
                    (<any>texture.baseTexture).source = textureAtlasTexture;
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
        }
        /**
         * @private
         */
        protected _updateMesh(): void {
            const meshDisplay = null; //<PIXI.mesh.Mesh>this._meshDisplay;
            const hasFFD = this._ffdVertices.length > 0;

            if (this._meshData.skinned) {
                for (let i = 0, iF = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    let iH = i / 2;

                    const boneIndices = this._meshData.boneIndices[iH];
                    const boneVertices = this._meshData.boneVertices[iH];
                    const weights = this._meshData.weights[iH];

                    let xG = 0, yG = 0;

                    for (let iB = 0, lB = boneIndices.length; iB < lB; ++iB) {
                        const bone = this._meshBones[boneIndices[iB]];
                        const matrix = bone.globalTransformMatrix;
                        const weight = weights[iB];

                        let xL = 0, yL = 0;
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
                const vertices = this._meshData.vertices;
                for (let i = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    const xG = vertices[i] + this._ffdVertices[i];
                    const yG = vertices[i + 1] + this._ffdVertices[i + 1];
                    meshDisplay.vertices[i] = xG;
                    meshDisplay.vertices[i + 1] = yG;
                }
            }
        }
        /**
         * @private
         */
        protected _updateTransform(): void {
            this._renderDisplay.x = this.global.x;
            this._renderDisplay.y = this.global.y;
            this._renderDisplay.rotation = this.global.skewX;
            this._renderDisplay.scale.x = this.global.scaleX;
            this._renderDisplay.scale.y = this.global.scaleY;
            this._renderDisplay.pivot.x = this._pivotX;
            this._renderDisplay.pivot.y = this._pivotY;
        }
    }
}
namespace dragonBones {

    declare var game: Phaser.Game;

    export class PhaserArmatureDisplay extends Phaser.Sprite implements IArmatureDisplay {

        public _armature: Armature;

        public maxX: number = 0;
        public maxY: number = 0;

        private _debugDrawer: Phaser.Graphics;         

        public constructor() {
            super(game,0,0,0);
        }

        public SetBounds(force?: boolean) {
            if (force || this.maxX < this.getBounds().width) this.maxX = this.getBounds().width;
            if (force || this.maxY < this.getBounds().height) this.maxY = this.getBounds().height;
            this.body.setSize(this.maxX/2, this.maxX/2, this.maxY, 0);
        }

        public _onClear(): void {
            this._armature = null;

            if (this._debugDrawer) {
                this._debugDrawer.destroy(true);
                this._debugDrawer = null;
            }

            this.destroy(true);
        }

        public _dispatchEvent(eventObject: EventObject): void {
            //this.emit(eventObject.type, eventObject);
        }

        public _debugDraw(): void {
            if (!this._debugDrawer) {
                this._debugDrawer = new Phaser.Graphics(game);
            }

            this.addChild(this._debugDrawer);
            this._debugDrawer.clear();

            const bones = this._armature.getBones();
            for (let i = 0, l = bones.length; i < l; ++i) {
                const bone = bones[i];
                const boneLength = Math.max(bone.length, 5);
                const startX = bone.globalTransformMatrix.tx;
                const startY = bone.globalTransformMatrix.ty;
                const endX = startX + bone.globalTransformMatrix.a * boneLength;
                const endY = startY + bone.globalTransformMatrix.b * boneLength;

                this._debugDrawer.lineStyle(1, bone.ik ? 0xFF0000 : 0x00FF00, 0.5);
                this._debugDrawer.moveTo(startX, startY);
                this._debugDrawer.lineTo(endX, endY);
            }
        }
        /**
         * @inheritDoc
         */
        public hasEvent(type: EventStringType): boolean {
            //return <boolean>this.listeners(type, true);
            return false;
        }
        /**
         * @inheritDoc
         */
        public addEvent(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
            //this.addListener(type, listener, target);
        }
        /**
         * @inheritDoc
         */
        public removeEvent(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
            //this.removeListener(type, listener, target);
        }
        /**
         * @inheritDoc
         */
        public advanceTimeBySelf(on: boolean): void {
            if (on) {
                PhaserFactory._clock.add(this._armature);
            }
            else {
                PhaserFactory._clock.remove(this._armature);
            }
        }
        /**
         * @inheritDoc
         */
        public dispose(): void {
            if (this._armature) {
                this.advanceTimeBySelf(false);
                this._armature.dispose();
                this._armature = null;
            }
        }
        /**
         * @inheritDoc
         */
        public get armature(): Armature {
            return this._armature;
        }
        /**
         * @inheritDoc
         */
        public get animation(): Animation {
            return this._armature.animation;
        }

        public animate(key: string): void {

            if (this.animation.lastAnimationName == key) return;

            this.animation.play(key);
            for (var i = this.children.length - 1; i >= 0; i--) {
                var item = this.getChildAt(i);
                if ((<any>item).texture == null) this.removeChildAt(i);
            }
            
        }
    }    
}
class DisplayType {
    public static Image: number = 0;
    public static Mesh: number = 2;
    public static Armature: number = 1;
}