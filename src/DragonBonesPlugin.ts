namespace Rift {
    export const IMAGE: number = 2;
    export const JSON: number = 11;
    export const VERSION: string = "0.1";
    
    export class DragonBonesPlugin extends Phaser.Plugin {
        private static ObjDictionary: {
            [key: string]: DragonBonesObject
        } = {};
        private Suffix: string = "DragonBonesPlugin";
        public ImageSuffix: string = '_Image_' + this.Suffix;
        public TextureSuffix: string = '_TextureMap_' + this.Suffix;
        public BonesSuffix: string = '_Bones_' + this.Suffix;
        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);
        }

        public addResourceByNames(key: string, skeletonJson: string, textureJson: string, texturePng: string): void {
            this.addResources(key, new Array<Resource>(
                new Resource(ResType.Image, texturePng)
                , new Resource(ResType.TextureMap, textureJson)
                , new Resource(ResType.Bones, skeletonJson)
            )
            );
        }
        public addResources(key: string, resources: Resource[]): void {
            for (var i = 0; i < resources.length; i++) {
                this.addResource(key, resources[i]);
            }
        }

        private addResource(key: string, res: Resource): void {
            key = key.toLowerCase();
            var updated: boolean = false;
            for (var resKey in DragonBonesPlugin.ObjDictionary) {
                if (resKey == key) {
                    if (DragonBonesPlugin.ObjDictionary[resKey].resources.filter(function (resource) {
                        return resource.type === res.type;
                    }).length == 0) DragonBonesPlugin.ObjDictionary[resKey].resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                DragonBonesPlugin.ObjDictionary[key] = new DragonBonesObject(this.game, new Array<Resource>());
                DragonBonesPlugin.ObjDictionary[key].resources.push(res);
            }
        }

        public loadResources(): void {
            for (var resKey in DragonBonesPlugin.ObjDictionary) {
                var resources: Resource[] = DragonBonesPlugin.ObjDictionary[resKey].resources;
                for (var i = 0; i < resources.length; i++) {
                    var item = resources[i];
                    if (item.loaded) continue;
                    switch (item.type) {
                        case ResType.Image:
                            this.game.load.image(resKey + this.ImageSuffix, item.filePath);
                            break;
                        case ResType.TextureMap:
                            this.game.load.json(resKey + this.TextureSuffix, item.filePath);
                            break;
                        case ResType.Bones:
                            this.game.load.json(resKey + this.BonesSuffix, item.filePath);
                            break;
                    }
                    item.loaded = true;
                }
            }
        }

        private createFactoryItem(key: string) {
            key = key.toLowerCase();
            for (var reskey in DragonBonesPlugin.ObjDictionary) {
                if (key && reskey != key) continue;
                var oItem = DragonBonesPlugin.ObjDictionary[reskey];
                var item = new DragonBonesObject(this.game, oItem.resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.resources.length; i++) {
                    var res = item.resources[i];
                    switch (res.type) {
                        case ResType.Image:
                            image = this.game.cache.getItem(reskey + this.ImageSuffix, IMAGE).data;
                            break;
                        case ResType.TextureMap:
                            texture = this.game.cache.getItem(reskey + this.TextureSuffix, JSON).data;
                            break;
                        case ResType.Bones:
                            bones = this.game.cache.getItem(reskey + this.BonesSuffix, JSON).data;
                            break;
                    }
                }
                item.skeleton = item.factory.parseDragonBonesData(bones);
                item.factory.parseTextureAtlasData(texture, image);
                return item;
            }
            return null;
        }

        getArmature(key: string, armatureName?: string): dragonBones.PhaserArmatureDisplay {
            var item = this.createFactoryItem(key);
            if (armatureName == null) armatureName = item.skeleton.armatureNames[0];
            var armature = item.factory.buildArmatureDisplay(armatureName);
            item.armature = armature;
            this.refreshClock();
            return item.armature;
        }

        public refreshClock(): void {
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

    class DragonBonesObject {
        public resources: Resource[];
        public skeleton: dragonBones.DragonBonesData;
        public factory: dragonBones.PhaserFactory;
        public armature: dragonBones.PhaserArmatureDisplay;
        constructor(game: Phaser.Game, resources: Resource[]) {
            this.factory = new dragonBones.PhaserFactory(null, game);
            this.resources = resources;
        }
    }
    export class Resource {
        public type: ResType;
        public filePath: string;
        public loaded: boolean = false;
        public cacheKey: string;
        constructor(type: ResType, filePath: string) {
            this.type = type;
            this.filePath = filePath;
        }
    }
    export enum ResType {
        Image
        , TextureMap
        , Bones
    }
}
