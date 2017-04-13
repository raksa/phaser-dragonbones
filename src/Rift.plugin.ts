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

        AddResourceByName(key: string, path: string): void {
            this.AddResources(key, new Array<Rift.PhaserBones.Resource>(
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
                [path]: [
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
            var updated: boolean = false;
            for (var reskey in PhaserBones.ObjDictionary) {
                if (reskey == key) {
                    if (PhaserBones.ObjDictionary[reskey].Resources.filter(function (thisres) { return thisres.Type === res.Type }).length == 0) PhaserBones.ObjDictionary[reskey].Resources.push(res);
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

        GetArmature(key: string, armatureName?: string): PhaserArmatureDisplay {
            var item = this.CreateFactoryItem(key);
            if (armatureName == null) armatureName = item.Skeleton.armatureNames[0];
            var armature = item.Factory.buildArmatureDisplay(armatureName);
            item.Armature = armature;
            this.RefreshClock();
            return item.Armature;
        }

        RefreshClock(): void {
            var hasEvent: boolean = false;
            var callback = PhaserFactory._clockHandler;
            this.game.time.events.events.forEach(function (event, index, array) {
                if (event.callback == callback) {
                    hasEvent = true;
                    return;
                }
            });
            if (!hasEvent) this.game.time.events.loop(20, PhaserFactory._clockHandler, PhaserFactory);
        }
    }

    export module PhaserBones {
        export interface ICache {
            getItem(key: string, cache: number, method?: string, property?: string): any;
        }
        export class Object {
            public Resources: PhaserBones.Resource[];
            public Skeleton: dragonBones.DragonBonesData;
            public Factory: PhaserFactory = new PhaserFactory();
            public Armature: PhaserArmatureDisplay;
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
