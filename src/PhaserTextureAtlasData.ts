class PhaserTextureAtlasData extends dragonBones.TextureAtlasData {
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