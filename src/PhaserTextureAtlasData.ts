export class PhaserTextureAtlasData extends dragonBones.TextureAtlasData {
    public static toString(): string {
        return "[class PhaserTextureAtlasData]";
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