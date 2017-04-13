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
        public static instance: PhaserBones = null;
        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);
            this.Cache = this.game.cache;
            PhaserBones.instance = this;
        }

        AddResourceByName(key: string, skeletonJson: string, textureJson: string, texturePng: string): void {
            this.AddResources(key, new Array<Rift.PhaserBones.Resource>(
                new Rift.PhaserBones.Resource(Rift.PhaserBones.ResType.Image, texturePng)
                , new Rift.PhaserBones.Resource(Rift.PhaserBones.ResType.TextureMap, textureJson)
                , new Rift.PhaserBones.Resource(Rift.PhaserBones.ResType.Bones, skeletonJson)
            )
            );
        }
        AddResources(key: string, res: PhaserBones.Resource[]): void {
            for (var i = 0; i < res.length; i++) {
                this.AddResource(key, res[i]);
            }
        }

        AddResource(key: string, res: PhaserBones.Resource): void {
            key = key.toLowerCase();
            var updated: boolean = false;
            for (var resKey in PhaserBones.ObjDictionary) {
                if (resKey == key) {
                    if (PhaserBones.ObjDictionary[resKey].Resources.filter(function (resource) {
                        return resource.Type === res.Type;
                    }).length == 0) PhaserBones.ObjDictionary[resKey].Resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                PhaserBones.ObjDictionary[key] = new PhaserBones.Object(new Array<PhaserBones.Resource>());
                PhaserBones.ObjDictionary[key].Resources.push(res);
            }
        }

        LoadResources(): void {
            for (var resKey in PhaserBones.ObjDictionary) {
                var resources: PhaserBones.Resource[] = PhaserBones.ObjDictionary[resKey].Resources;
                for (var i = 0; i < resources.length; i++) {
                    var item = resources[i];
                    if (item.Loaded) continue;
                    switch (item.Type) {
                        case PhaserBones.ResType.Image:
                            this.game.load.image(resKey + this.ImageSuffix, item.FilePath);
                            break;
                        case PhaserBones.ResType.TextureMap:
                            this.game.load.json(resKey + this.TextureSuffix, item.FilePath);
                            break;
                        case PhaserBones.ResType.Bones:
                            this.game.load.json(resKey + this.BonesSuffix, item.FilePath);
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
                var oItem = PhaserBones.ObjDictionary[reskey];
                var item = new PhaserBones.Object(oItem.Resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.Resources.length; i++) {
                    var res = item.Resources[i];
                    switch (res.Type) {
                        case PhaserBones.ResType.Image:
                            image = this.Cache.getItem(reskey + this.ImageSuffix, Rift.PhaserBones.IMAGE).data;
                            break;
                        case PhaserBones.ResType.TextureMap:
                            texture = this.Cache.getItem(reskey + this.TextureSuffix, Rift.PhaserBones.JSON).data;
                            break;
                        case PhaserBones.ResType.Bones:
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

        RefreshClock(): void {
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
            public Factory: dragonBones.PhaserFactory = new dragonBones.PhaserFactory(null, PhaserBones.instance.game);
            public Armature: dragonBones.PhaserArmatureDisplay;
            constructor(resources: PhaserBones.Resource[]) {
                this.Resources = resources;
            }
        }

        export class Resource {
            public Type: PhaserBones.ResType;
            public FilePath: string;
            public Loaded: boolean = false;
            public Cache: any;
            public CacheKey: string;
            constructor(type: PhaserBones.ResType, filepath: string) {
                this.Type = type;
                this.FilePath = filepath;
            }
        }

        export enum ResType {
            Image
            , TextureMap
            , Bones
        }
    }
}
