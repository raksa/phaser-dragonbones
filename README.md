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

* DragonBones API: 4.5

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

        this.dragonBonesPlugin.AddResourceByName("key",
            "path/to/skeleton.json", "path/to/texture.json", "path/to/texture.png");

        this.dragonBonesPlugin.LoadResources();
    },

    create: function () {

        var x = this.world.width / 2;

        var y = 3 * this.world.height / 4;

        var sprite = this.dragonBonesPlugin.GetArmature("key");

        sprite.position.setTo(x, y);

        sprite.scale.setTo(0.6);

        this.world.add(sprite);

        var names = sprite.animation._animationNames;

        sprite.animation.play(names[0]);
    }

}
```