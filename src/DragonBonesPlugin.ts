module Rift {
    export class DragonBonesPlugin extends Phaser.Plugin {
        private static ObjDictionary: {
            [key: string]: DragonBonesPlugin.Object
        } = {};
        private Suffix: string = "DragonBonesPlugin";
        public ImageSuffix: string = '_Image_' + this.Suffix;
        public TextureSuffix: string = '_TextureMap_' + this.Suffix;
        public BonesSuffix: string = '_Bones_' + this.Suffix;
        public static IMAGE: number = 2;
        public static JSON: number = 11;
        public static instance: DragonBonesPlugin = null;

        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {

            super(game, parent);

            DragonBonesPlugin.instance = this;
        }

        AddResourceByName(key: string, skeletonJson: string, textureJson: string, texturePng: string): void {
            this.AddResources(key, new Array<Rift.DragonBonesPlugin.Resource>(
                new Rift.DragonBonesPlugin.Resource(Rift.DragonBonesPlugin.ResType.Image, texturePng)
                , new Rift.DragonBonesPlugin.Resource(Rift.DragonBonesPlugin.ResType.TextureMap, textureJson)
                , new Rift.DragonBonesPlugin.Resource(Rift.DragonBonesPlugin.ResType.Bones, skeletonJson)
            )
            );
        }
        AddResources(key: string, res: DragonBonesPlugin.Resource[]): void {
            for (var i = 0; i < res.length; i++) {
                this.AddResource(key, res[i]);
            }
        }

        AddResource(key: string, res: DragonBonesPlugin.Resource): void {
            key = key.toLowerCase();
            var updated: boolean = false;
            for (var resKey in DragonBonesPlugin.ObjDictionary) {
                if (resKey == key) {
                    if (DragonBonesPlugin.ObjDictionary[resKey].Resources.filter(function (resource) {
                        return resource.Type === res.Type;
                    }).length == 0) DragonBonesPlugin.ObjDictionary[resKey].Resources.push(res);
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                DragonBonesPlugin.ObjDictionary[key] = new DragonBonesPlugin.Object(new Array<DragonBonesPlugin.Resource>());
                DragonBonesPlugin.ObjDictionary[key].Resources.push(res);
            }
        }

        LoadResources(): void {
            for (var resKey in DragonBonesPlugin.ObjDictionary) {
                var resources: DragonBonesPlugin.Resource[] = DragonBonesPlugin.ObjDictionary[resKey].Resources;
                for (var i = 0; i < resources.length; i++) {
                    var item = resources[i];
                    if (item.Loaded) continue;
                    switch (item.Type) {
                        case DragonBonesPlugin.ResType.Image:
                            this.game.load.image(resKey + this.ImageSuffix, item.FilePath);
                            break;
                        case DragonBonesPlugin.ResType.TextureMap:
                            this.game.load.json(resKey + this.TextureSuffix, item.FilePath);
                            break;
                        case DragonBonesPlugin.ResType.Bones:
                            this.game.load.json(resKey + this.BonesSuffix, item.FilePath);
                            break;
                    }
                    item.Loaded = true;
                }
            }
        }

        CreateFactoryItem(key: string) {
            key = key.toLowerCase();
            for (var reskey in DragonBonesPlugin.ObjDictionary) {
                if (key && reskey != key) continue;
                var oItem = DragonBonesPlugin.ObjDictionary[reskey];
                var item = new DragonBonesPlugin.Object(oItem.Resources);
                var image = null;
                var texture = null;
                var bones = null;
                for (var i = 0; i < item.Resources.length; i++) {
                    var res = item.Resources[i];
                    switch (res.Type) {
                        case DragonBonesPlugin.ResType.Image:
                            image = this.game.cache.getItem(reskey + this.ImageSuffix, Rift.DragonBonesPlugin.IMAGE).data;
                            break;
                        case DragonBonesPlugin.ResType.TextureMap:
                            texture = this.game.cache.getItem(reskey + this.TextureSuffix, Rift.DragonBonesPlugin.JSON).data;
                            break;
                        case DragonBonesPlugin.ResType.Bones:
                            bones = this.game.cache.getItem(reskey + this.BonesSuffix, Rift.DragonBonesPlugin.JSON).data;
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

    export module DragonBonesPlugin {
        export class Object {
            public Resources: DragonBonesPlugin.Resource[];
            public Skeleton: dragonBones.DragonBonesData;
            public Factory: dragonBones.PhaserFactory = new dragonBones.PhaserFactory(null, DragonBonesPlugin.instance.game);
            public Armature: dragonBones.PhaserArmatureDisplay;
            constructor(resources: DragonBonesPlugin.Resource[]) {
                this.Resources = resources;
            }
        }

        export class Resource {
            public Type: DragonBonesPlugin.ResType;
            public FilePath: string;
            public Loaded: boolean = false;
            public CacheKey: string;
            constructor(type: DragonBonesPlugin.ResType, filepath: string) {
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
