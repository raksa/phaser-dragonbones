namespace Rift {
    export const IMAGE: number = 2;
    export const JSON: number = 11;
    export const VERSION: string = "0.1";

    export class DragonBonesPlugin extends Phaser.Plugin {
        private static objDictionary: {
            [key: string]: DragonBonesObject
        } = {};
        private readonly Suffix: string = "DragonBonesPlugin";
        private readonly ImageSuffix: string = '_Image_' + this.Suffix;
        private readonly TextureSuffix: string = '_TextureMap_' + this.Suffix;
        private readonly BonesSuffix: string = '_Bones_' + this.Suffix;
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
            for (let resource of resources) {
                this.addResource(key, resource);
            }
        }

        private addResource(key: string, res: Resource): void {
            key = key.toLowerCase();
            let updated: boolean = false;
            for (let resKey in DragonBonesPlugin.objDictionary) {
                if (resKey == key) {
                    if (DragonBonesPlugin.objDictionary[resKey].resources.filter(function (resource) {
                        return resource.type === res.type;
                    }).length == 0) DragonBonesPlugin.objDictionary[resKey].resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                DragonBonesPlugin.objDictionary[key] = new DragonBonesObject(this.game, new Array<Resource>());
                DragonBonesPlugin.objDictionary[key].resources.push(res);
            }
        }

        public loadResources(): void {
            for (let resKey in DragonBonesPlugin.objDictionary) {
                for (let resource of DragonBonesPlugin.objDictionary[resKey].resources) {
                    if (resource.loaded) continue;
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
        }

        private createFactoryItem(key: string) {
            key = key.toLowerCase();
            for (let resKey in DragonBonesPlugin.objDictionary) {
                if (key && resKey != key) continue;
                var oItem = DragonBonesPlugin.objDictionary[resKey];
                var item = new DragonBonesObject(this.game, oItem.resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.resources.length; i++) {
                    var res = item.resources[i];
                    switch (res.type) {
                        case ResType.Image:
                            image = this.game.cache.getItem(resKey + this.ImageSuffix, IMAGE).data;
                            break;
                        case ResType.TextureMap:
                            texture = this.game.cache.getItem(resKey + this.TextureSuffix, JSON).data;
                            break;
                        case ResType.Bones:
                            bones = this.game.cache.getItem(resKey + this.BonesSuffix, JSON).data;
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
            let item = this.createFactoryItem(key);
            if (armatureName == null) armatureName = item.skeleton.armatureNames[0];
            let armature = item.factory.buildArmatureDisplay(armatureName);
            item.armature = armature;
            this.refreshClock();
            return item.armature;
        }

        public refreshClock(): void {
            let hasEvent: boolean = false;
            let callback = dragonBones.PhaserFactory._clockHandler;
            this.game.time.events.events.forEach((event, index, events) => {
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
