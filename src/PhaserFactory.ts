namespace dragonBones {

    export class PhaserFactory extends BaseFactory {

        public game: Phaser.Game;

        private static _factory: PhaserFactory = null;

        public static _eventManager: PhaserArmatureDisplay = null;

        public static _clock: WorldClock = null;

        public static _clockHandler(passedTime: number): void {
            PhaserFactory._clock.advanceTime(-1); // passedTime !?
        }

        public static get factory(game: Phaser.Game): PhaserFactory {
            if (!PhaserFactory._factory) {
                PhaserFactory._factory = new PhaserFactory(null, game);
            }

            return PhaserFactory._factory;
        }

        public constructor(dataParser: DataParser = null, game: Phaser.Game) {
            super(dataParser);

            this.game = game;

            if (!PhaserFactory._eventManager) {
                PhaserFactory._eventManager = new PhaserArmatureDisplay(game);
                PhaserFactory._clock = new WorldClock();
            }
        }

        protected _generateTextureAtlasData(textureAtlasData: PhaserTextureAtlasData, textureAtlas: PIXI.BaseTexture): PhaserTextureAtlasData {
            if (textureAtlasData) {
                textureAtlasData.texture = textureAtlas;
            } else {
                textureAtlasData = BaseObject.borrowObject(PhaserTextureAtlasData);
            }

            return textureAtlasData;
        }
        /**
         * @private
         */
        protected _generateArmature(dataPackage: BuildArmaturePackage): Armature {
            const armature = BaseObject.borrowObject(Armature);
            const armatureDisplayContainer = new PhaserArmatureDisplay(this.game);

            armature._armatureData = dataPackage.armature;
            armature._skinData = dataPackage.skin;
            armature._animation = BaseObject.borrowObject(Animation);
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
        protected _generateSlot(dataPackage: BuildArmaturePackage,
            slotDisplayDataSet: SlotDisplayDataSet): Slot {

            const slot = BaseObject.borrowObject(PhaserSlot);
            const slotData = slotDisplayDataSet.slot;
            const displayList = [];

            slot.game = this.game;
            slot.name = slotData.name;
            slot._rawDisplay = new Phaser.Sprite(this.game, 0, 0);
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

                return new Phaser.Sprite(this.game, 0, 0, textureData.texture);
            }

            return null;
        }

        public get soundEventManater(): PhaserArmatureDisplay {
            return PhaserFactory._eventManager;
        }
    }

}