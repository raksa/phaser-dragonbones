class PhaserTextureData extends dragonBones.TextureData {
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