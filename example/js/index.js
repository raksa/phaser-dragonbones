"use strict";

var model = "Swordsman";
var animations = [
    'steady', 'steady2', 'attack1', 'attack1_+1', 'attack2', 'jump', 'walk', 'walk2',
];

var game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '', {
    preload: function () {
        game.PhaserBones = game.plugins.add(Rift.PhaserBones);
        game.PhaserBones.AddResourceByName(model, model + "/");
        game.PhaserBones.LoadResources();
    },
    create: function () {
        game.add.text(game.world.width / 2, 30, "Tap/Click to change animation").anchor.setTo(0.5);

        game.stage.backgroundColor = "#fefefe";

        var group = game.add.group();
        group.game = this;
        group.index = -1;
        group.renewSprite = function(){
            this.removeAll();
            this.index = (this.index + 1) % animations.length;
            this.add(this.game.createSprite(animations[this.index]));
        };
        group.renewSprite();

        game.input.onDown.add(function (event) {
            this.renewSprite();
        }, group);
    },
    createSprite: function (animation) {
        var sprite = game.PhaserBones.GetArmature(model);
        sprite.position.setTo(game.world.width / 2, 3 * game.world.height / 4);
        sprite.animate(animation);
        sprite.scale.setTo(0.6);
        return sprite;
    },
    update: function () {
        // game.PhaserBones.RefreshClock(); // when switching states this needs called
    }
});