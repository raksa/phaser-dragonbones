"use strict";

var model = "Swordsman";
var animations = [
    'steady', 'steady2', 'attack1', 'attack1_+1', 'attack2', 'jump', 'walk', 'walk2',
];

var game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '', {
    preload: function () {
        this.PhaserBones = this.game.plugins.add(Rift.PhaserBones);
        this.PhaserBones.AddResourceByName(model, model + "/");
        this.PhaserBones.LoadResources();
    },
    create: function () {
        this.add.text(this.world.width / 2, 30, "Tap/Click to change animation").anchor.setTo(0.5);

        this.stage.backgroundColor = "#fefefe";

        var group = this.add.group();
        group.game = this;
        group.index = -1;
        group.renewSprite = function () {
            this.removeAll();
            this.index = (this.index + 1) % animations.length;
            this.add(this.game.createSprite(animations[this.index]));
        };
        group.renewSprite();

        this.input.onDown.add(function (event) {
            this.renewSprite();
        }, group);
    },
    createSprite: function (animation) {
        var sprite = this.PhaserBones.GetArmature(model);
        sprite.position.setTo(this.world.width / 2, 3 * this.world.height / 4);
        sprite.animate(animation);
        sprite.scale.setTo(0.6);
        return sprite;
    },
    update: function () {
        // this.PhaserBones.RefreshClock(); // when switching states this needs called
    }
});