export class PhaserSlot extends dragonBones.Slot {
    public static toString(): string {
        return "[class PhaserSlot]";
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

                if (texture && texture.frame) {
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