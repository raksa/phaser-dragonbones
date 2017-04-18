Phaser + dragonbones
===

![Capture.png](https://raw.githubusercontent.com/raksa/phaser-dragonbones/master/screenshot/Capture.PNG)

[Phaser](http://phaser.io)

[DragonBones Animator](http://dragonbones.com)

[original repo](https://bitbucket.org/silashatfield/phaserbones)

Installing
===

Make clone
````
Clone without submodules

> git clone https://github.com/raksa/phaser-dragonbones.git

Clone with submodules (will make big size of transfer git repo)

> git clone --recurse-submodules https://github.com/raksa/phaser-dragonbones.git

````

Make compiling
````
> cd phaser-dragonbones

> npm install

> npm run compile

````

Make running
````
> npm run start

test example in  "example" folder

````

Usage
===

Current test version:

* Phaser: 2.6.2

* DragonBones API: 5.0

* DragonBones Data Format: 4.5

#### include

```html
<script src="example/lib/dragonBones.js"></script>
<script src="built/dragonBonesPhaser.min.js"></script>
```

#### include

```javascript
{

    init: function() {

        this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);

    },

    preload: function () {

        this.dragonBonesPlugin.addResourceByNames("key",
            "path/to/skeleton.json", "path/to/texture.json", "path/to/texture.png");

        this.dragonBonesPlugin.loadResources();
    },

    create: function () {

        var x = this.world.width / 2;

        var y = 3 * this.world.height / 4;

        var sprite = this.dragonBonesPlugin.getArmature("key");

        sprite.position.setTo(x, y);

        sprite.scale.setTo(0.6);

        this.world.add(sprite);

        var names = sprite.animation._animationNames;

        sprite.animation.play(names[0]);
    }

}
```