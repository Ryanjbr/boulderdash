export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    init(data) {
        this.enemy1;
        this.enemy2;
        this.enemy3;
        this.exitOpenSound;
        this.deathSound;
        this.powerupSound;
        this.dirtSound;
        this.music;
        this.level = data.level;
        this.score = 0;
        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`);
        this.moveTimer = 0;
        this.gameOver = false;
        this.stuckTimer = 0;
        this.movementPossible = false;
        this.blockPositions = [];
        this.cursors = this.input.keyboard.createCursorKeys();
        this.goalPos = 0;
        this.moveType = '';
        this.goalReached = true;
        this.boulders = this.physics.add.group();
        this.powerupsArray;
        this.powerups = this.physics.add.group();
        this.dirt = this.physics.add.group();
        this.markedDirt = this.physics.add.group();
        this.closedExit = this.physics.add.staticGroup();
        this.singleClosedExit;
        this.openExit = this.physics.add.group();
        this.singleOpenExit;
        this.exitOpen = false;
        this.GRID_SIZE = 32

    }

    preload() {
        this.load.spritesheet('guy', 'src/assets/guy.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image("tiles", "src/assets/tileset.png");
        // tilemaps composed using "tiled" software
        if (this.level == 1) {
            console.log('level 1 map')
            this.load.tilemapTiledJSON('tilemap1', 'src/assets/level1tilemap.json')
        }
        else if (this.level == 2) {
            console.log('level 2 map')
            this.load.tilemapTiledJSON('tilemap2', 'src/assets/level2tilemap.json')
        }
        this.load.image("powerup", "src/assets/pointup.png")
        this.load.image("boulder", "src/assets/boulder.png")
        this.load.image("dirt", "src/assets/dirt.png");
        this.load.image("exitopen", "src/assets/exitopen.png");
        this.load.image("exitclosed", "src/assets/exitclosed.png")
        this.load.audio('theme', 'src/assets/music.mp3');
        this.load.audio('exitopensound', 'src/assets/exitopen.wav');
        this.load.audio('powerup', 'src/assets/powerup.wav');
        this.load.audio('death', 'src/assets/death.wav');
        this.load.audio('dirt', 'src/assets/dirt.wav');
        this.load.image("blob_stand1", "src/assets/Blob/blob_stand1.png");
        this.load.image("blob_stand2", "src/assets/Blob/blob_stand2.png");
        this.load.image("blob_stand3", "src/assets/Blob/blob_stand3.png");
        this.load.image("blob_jump1", "src/assets/Blob/blob_jump1.png");
        this.load.image("blob_jump2", "src/assets/Blob/blob_jump2.png");
        this.load.image("blob_jump3", "src/assets/Blob/blob_jump3.png");
        this.load.image("blob_jump4", "src/assets/Blob/blob_jump4.png");
    };
    
    create() {
        this.music = this.sound.add('theme');
        this.music.play();
        this.music.loop = true;

        this.exitOpenSound = this.sound.add('exitopensound');
        this.deathSound = this.sound.add('death');
        this.powerupSound = this.sound.add('powerup');
        this.dirtSound = this.sound.add('dirt')

        if (this.level == 1) {
            var map = this.make.tilemap({ key: 'tilemap1'});
        }
        else if (this.level == 2) {
            var map = this.make.tilemap({ key: 'tilemap2'});
        }
        const tileset = map.addTilesetImage('tileset', 'tiles');
        const boulder = map.addTilesetImage('boulder', 'boulder');
        const dirt = map.addTilesetImage('dirt', 'dirt');
        const powerup = map.addTilesetImage('powerup', 'powerup');
        
        const ground = map.createLayer('ground', tileset);

        // tile layers have to be replaced by sprites for grid physics to work
        const blocks = map.createStaticLayer('blocks', tileset);
        map.setLayer('blocks');
        map.forEachTile((e) => {
            if (e.index == 289) {
                this.blockPositions.push({'x': e.pixelX, 'y': e.pixelY})
            }
        })
        blocks.setCollisionByExclusion([-1]);


        const bouldersLayer = map.createLayer('boulders', boulder);
        map.setLayer('boulder');
        map.forEachTile((e) => {
            if (e.index == '1289') {
                this.boulders.create(e.pixelX,e.pixelY,'boulder').setOrigin(0,0)
            } 
        })
        for (let boulder of this.boulders.getChildren()) {
            boulder.body.pushable = false;
        }
        bouldersLayer.setVisible(false)
        const dirtLayer = map.createLayer('dirt', dirt)
        map.setLayer('dirt');
        map.forEachTile((e) => {
            if (e.index == '1298') {
                this.dirt.create(e.pixelX,e.pixelY,'dirt').setOrigin(0,0)
            } 
        })
        dirtLayer.setVisible(false)
        const exit = map.createLayer('exit', tileset)
        map.setLayer('exit');
        map.forEachTile((e) => {
            if (e.index == '285') {
                this.singleClosedExit = this.closedExit.create(e.pixelX,e.pixelY,'exitclosed').setOrigin(0,0);
            }
        })
        exit.setVisible(false);
        const powerupLayer = map.createLayer('powerup', 'powerup')
        map.setLayer('powerup');
        map.forEachTile((e) => {
            if (e.index == '1290') {
                this.powerups.create(e.pixelX,e.pixelY,'powerup').setOrigin(0,0)
            } 
        })
        powerupLayer.setVisible(false)
        
        

        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`);
        this.add.text(500,10,'Level:' + this.level)

        if (this.level == 1) {
            //horizontal movement
            this.enemy1 = this.physics.add.sprite(384, 32, 'blob_stand1').setOrigin(0,0);
            this.enemy1.setData('movement', 'horizontal');
            //vertical movement
            this.enemy2 = this.physics.add.sprite(448, 288, 'blob_stand1').setOrigin(0,0);
            this.enemy2.setData('movement', 'vertical');
            //horizontal movement
            this.enemy3 = this.physics.add.sprite(32, 448, 'blob_stand1').setOrigin(0,0);
            this.enemy3.setData('movement', 'horizontal');

        }
        else if (this.level == 2) {
            //horizontal movement
            this.enemy1 = this.physics.add.sprite(608, 544, 'blob_stand1').setOrigin(0,0);
            this.enemy1.setData('movement', 'horizontal');
            //vertical movement
            this.enemy2 = this.physics.add.sprite(288, 32, 'blob_stand1').setOrigin(0,0);
            this.enemy2.setData('movement', 'vertical');
            //horizontal movement
            this.enemy3 = this.physics.add.sprite(32, 128, 'blob_stand1').setOrigin(0,0);
            this.enemy3.setData('movement', 'horizontal');
        }


        
        if (this.level == 1) {
            this.player = this.physics.add.sprite(32, 32, 'guy').setOrigin(0, 0);
        }
        else if (this.level == 2) {
            this.player = this.physics.add.sprite(736, 64, 'guy').setOrigin(0, 0);
        }
        this.player.setScale(.5);
        if (this.level == 1 || this.level == 2) {
            this.physics.add.collider(this.enemy1,blocks,this.turnAround)
            this.physics.add.collider(this.enemy2,blocks,this.turnAround)
            this.physics.add.collider(this.enemy3,blocks,this.turnAround)
/*             this.physics.add.overlap(this.enemy1,this.dirt,this.turnAround)
            this.physics.add.overlap(this.enemy2,this.dirt,this.turnAround)
            this.physics.add.overlap(this.enemy3,this.dirt,this.turnAround) */

        }
        this.physics.add.collider(this.player,this.boulders);
        this.physics.add.collider(this.boulders,this.boulders);
        this.physics.add.collider(this.player,this.closedExit);
        this.physics.add.overlap(this.player,this.openExit,this.winGame,this.trueOverlap,this);
        this.physics.add.overlap(this.player,this.powerups,this.collectPowerup,this.trueOverlap,this);
        this.physics.add.collider(this.boulders,blocks);
        this.physics.add.collider(this.player, blocks);

        this.physics.add.overlap(this.player,this.dirt,this.markDirt,this.trueOverlap,this)


        this.moveTimer = 0;
        this.movementPossible = false;
        
    
    
        // creates animations

        const animation = this.anims.create({
            key: "blobmove",
            frames: [
              { key: "blob_stand1" },
              { key: "blob_stand2" },
              { key: "blob_stand3" },
              { key: "blob_jump1" },
              { key: "blob_jump2" },
              { key: "blob_jump3" },
              { key: "blob_jump4" }
            ],
            frameRate: 10,
            repeat: -1
          });
    
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'guy', frame: 27 }],
            frameRate: 20
        }); 
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('guy', {  start: 104, end: 111 }),
            frameRate: 60
        })
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('guy', { start: 117, end: 125}),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('guy', { start: 143, end: 151}),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('guy', { start: 130, end: 138 }),
            frameRate: 60
        })

    };
    
    update(time, delta) {
        if (this.level == 1 || this.level == 2) {
            this.enemy1.setVelocityX(200);
            this.enemy1.anims.play('blobmove', true);
            this.enemy2.setVelocityY(200);
            this.enemy2.anims.play('blobmove', true);
            this.enemy3.setVelocityX(200);
            this.enemy3.anims.play('blobmove', true);
        } 
        var enter = this.input.keyboard.addKey('enter');  // Get key object


        if (this.gameOver = true && enter.isDown) {
            this.music.stop();
            this.scene.start('SceneMain', {level: 1})
        }

        if (this.score == 10 && this.exitOpen == false) {
            this.singleOpenExit = this.openExit.create(this.singleClosedExit.body.x + 16, this.singleClosedExit.body.y + 16, 'exitopen').setOrigin(0,0);
            this.singleClosedExit.disableBody();
            this.exitOpenSound.play();
            this.exitOpen = true;
        }



        // walking over dirt
        for (let dirt of this.dirt.getChildren()) {
            if (dirt.getData('marked') == true) {
                if (this.trueOverlap(dirt, this.player) == false) {
                    const boulderArray = this.boulders.getChildren().filter(boulder => boulder.body.x == dirt.body.x).filter(boulder => boulder.body.y == dirt.body.y - 32);
                    dirt.destroy();
                    this.dirtSound.play();
                    this.checkBoulderCollision(boulderArray);

                }
            }
        }

        // player movement
        if (this.moveType === 'left') {
            this.player.anims.play('left', true);
        }
        else if (this.moveType === 'right') {
            this.player.anims.play('right', true);
        }
        else if (this.moveType === 'up') {
            this.player.anims.play('up', true);
        }
        else if (this.moveType === 'down') {
            this.player.anims.play('down', true);
        }
        else {
            this.player.anims.play('idle', true);
        };
        if (this.moveType === 'left' && this.player.body.x <= this.goalPos || this.moveType === 'right' && this.player.body.x >= this.goalPos) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos;
            this.moveTimer = 0;
            this.movementPossible = false;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'up' && this.player.body.y <= this.goalPos || this.moveType === 'down' && this.player.body.y >= this.goalPos) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos;
            this.moveTimer = 0;
            this.movementPossible = false;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'left' && this.stuckTimer > 300) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'right' && this.stuckTimer > 300) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos - 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'up' && this.stuckTimer > 300) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'down' && this.stuckTimer > 300) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos - 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        
    
        this.moveTimer += delta;
        this.stuckTimer += delta;
        if (this.moveTimer > 100 && this.goalReached === true) {
            this.movementPossible = true;
        }
    
        // moves player 32 px at a time along given tiles
        if (this.cursors.left.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.x - 32;
            this.player.body.setVelocityX(-150)
            this.stuckTimer = 0;
            this.moveType = 'left'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.right.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.x + 32;
            this.player.body.setVelocityX(150)
            this.stuckTimer = 0;
            this.moveType = 'right'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.up.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.y - 32;
            this.player.body.setVelocityY(-150)
            this.stuckTimer = 0;
            this.moveType = 'up'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.down.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.y + 32;
            this.player.body.setVelocityY(150)
            this.stuckTimer = 0;
            this.moveType = 'down'
            this.movementPossible = false;
            this.goalReached = false;
        }
    };

    collectPowerup(player,powerup) {
        powerup.disableBody(true, true);
        this.powerupSound.play();

        //  Add and update the score
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);

    }
    trueOverlap(objectA, objectB) {
        const xDiff = objectA.body.x - objectB.body.x;
        const yDiff = objectA.body.y - objectB.body.y;
        if (xDiff > -5 && xDiff < 5 && yDiff > -5 && yDiff < 5) {
            return true;
        };
        return false;
    }
    markDirt(player,dirt) {
        dirt.setData('marked', true)
    }

    checkObjectUnder(objectA, objectB) {
        if (objectA.body.x === objectB.body.x && objectA.body.y === objectB.body.y - 32) {
            return true;
        }
        return false;
    }
    
    checkBoulderCollision(boulders) {
        for (let boulder of boulders) {
            var objectUnder = false;
            if (this.player.body.x == boulder.body.x && this.player.body.y <= boulder.body.y + 32 && this.player.body.y > boulder.body.y) {
                this.hitBoulder()
                return;
            }
            for (let dirt of this.dirt.getChildren()) {
                if (this.checkObjectUnder(boulder,dirt)) {
                    if (boulder.getData('marked') == true) {
                    }
                    objectUnder = true;
                }
            }
            for (let otherBoulder of boulders) {
                if (this.checkObjectUnder(boulder, otherBoulder)) {
                    if (boulder.getData('marked') == true) {
                    }
                    objectUnder = true;
                }
            }
            for (let position of this.blockPositions) {
                if (boulder.body.x == position['x'] && boulder.body.y == position['y'] -32) {
                    if (boulder.getData('marked') == true) {
                    }                    
                    objectUnder = true;
                }
            }
            if (objectUnder == false) {
                const boulderArray = this.boulders.getChildren().filter(bould => bould.body.x == boulder.body.x);
                boulder.body.y += 32;
                this.checkBoulderCollision(boulderArray);
            }
        }
    }

    turnAround(sprite,otherObject) {
        sprite.body.checkCollision.none = true;
        sprite.body.velocity.x = -sprite.body.velocity.x;
        sprite.body.velocity.y = -sprite.body.velocity.y;
        sprite.body.checkCollision.none = false;


    }

    
    hitBoulder() {
        this.deathSound.play();
        this.physics.pause()
        this.player.setTint(0xff0000);
        this.gameOver = true;
    }

    winGame() {
        this.physics.pause();
        if (this.level == 2) {
            const winText = this.add.text(300,10,'You win!')
        }
        else {
            this.music.stop();
            this.scene.start('SceneMain', {level: this.level + 1})
        }
    }
}
export default SceneMain;