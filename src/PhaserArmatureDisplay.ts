export class PhaserArmatureDisplay extends Phaser.Sprite implements IArmatureDisplay {

    public _armature: Armature;

    public maxX: number = 0;
    public maxY: number = 0;

    private _debugDrawer: Phaser.Graphics;

    public constructor() {
        super(game, 0, 0, 0);
    }

    public SetBounds(force?: boolean) {
        if (force || this.maxX < this.getBounds().width) this.maxX = this.getBounds().width;
        if (force || this.maxY < this.getBounds().height) this.maxY = this.getBounds().height;
        this.body.setSize(this.maxX / 2, this.maxX / 2, this.maxY, 0);
    }

    public _onClear(): void {
        this._armature = null;

        if (this._debugDrawer) {
            this._debugDrawer.destroy(true);
            this._debugDrawer = null;
        }

        this.destroy(true);
    }

    public _dispatchEvent(eventObject: EventObject): void {
        //this.emit(eventObject.type, eventObject);
    }

    public _debugDraw(): void {
        if (!this._debugDrawer) {
            this._debugDrawer = new Phaser.Graphics(game);
        }

        this.addChild(this._debugDrawer);
        this._debugDrawer.clear();

        const bones = this._armature.getBones();
        for (let i = 0, l = bones.length; i < l; ++i) {
            const bone = bones[i];
            const boneLength = Math.max(bone.length, 5);
            const startX = bone.globalTransformMatrix.tx;
            const startY = bone.globalTransformMatrix.ty;
            const endX = startX + bone.globalTransformMatrix.a * boneLength;
            const endY = startY + bone.globalTransformMatrix.b * boneLength;

            this._debugDrawer.lineStyle(1, bone.ik ? 0xFF0000 : 0x00FF00, 0.5);
            this._debugDrawer.moveTo(startX, startY);
            this._debugDrawer.lineTo(endX, endY);
        }
    }
    /**
     * @inheritDoc
     */
    public hasEvent(type: EventStringType): boolean {
        //return <boolean>this.listeners(type, true);
        return false;
    }
    /**
     * @inheritDoc
     */
    public addEvent(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
        //this.addListener(type, listener, target);
    }
    /**
     * @inheritDoc
     */
    public removeEvent(type: EventStringType, listener: (event: EventObject) => void, target: any): void {
        //this.removeListener(type, listener, target);
    }
    /**
     * @inheritDoc
     */
    public advanceTimeBySelf(on: boolean): void {
        if (on) {
            PhaserFactory._clock.add(this._armature);
        }
        else {
            PhaserFactory._clock.remove(this._armature);
        }
    }
    /**
     * @inheritDoc
     */
    public dispose(): void {
        if (this._armature) {
            this.advanceTimeBySelf(false);
            this._armature.dispose();
            this._armature = null;
        }
    }
    /**
     * @inheritDoc
     */
    public get armature(): Armature {
        return this._armature;
    }
    /**
     * @inheritDoc
     */
    public get animation(): Animation {
        return this._armature.animation;
    }

    public animate(key: string): void {

        if (this.animation.lastAnimationName == key) return;

        this.animation.play(key);
        for (var i = this.children.length - 1; i >= 0; i--) {
            var item = this.getChildAt(i);
            if ((<any>item).texture == null) this.removeChildAt(i);
        }

    }
}