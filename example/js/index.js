"use strict";

var model = "Swordsman";
var sprite;
var index = -1;

new Phaser.Game("100%", "100%", Phaser.CANVAS, '', {
    preload: function () {
        this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
        this.dragonBonesPlugin.AddResourceByName(model,
            "Swordsman/SwordsMan_ske.json", "Swordsman/SwordsMan_tex.json", "Swordsman/SwordsMan_tex.png");
        this.dragonBonesPlugin.LoadResources();
    },
    create: function () {
        this.add.text(this.world.width / 2, 30, "Tap/Click to change animation").anchor.setTo(0.5);

        this.stage.backgroundColor = "#fefefe";

        sprite = this.dragonBonesPlugin.GetArmature(model);
        sprite.position.setTo(this.world.width / 2, 3 * this.world.height / 4);
        sprite.scale.setTo(0.6);
        this.world.add(sprite);

        this.changeAnimation();

        this.input.onDown.add(this.changeAnimation, this);
    },
    changeAnimation: function (animation) {
        var names = sprite.animation._animationNames;
        index = (index + 1) % names.length;
        sprite.animation.play(names[index]);
    },
    update: function () {
        // this.dragonBonesPlugin.RefreshClock(); // when switching states this needs called
    }
});