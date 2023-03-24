export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    init() {
        this.score = 0;
        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`);
        this.moveTimer = 0;
        this.stuckTimer = 0;
        this.movementPossible = false;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.goalPos = 0;
        this.text = this.add.text(10,10, 'debug');
        this.moveType = '';
        this.goalReached = true;
        this.boulders = this.physics.add.group();
        this.powerupsArray;
        this.powerups = this.physics.add.group();
        this.dirt = this.physics.add.group();
        this.markedDirt = this.physics.add.group();
        this.exit = this.physics.add.group();
/*         this.boulderLocations = [[4,17], [4,16], [8,5], [8,15]]
        this.pointupLocations = [[2,9],[5,2],[9,10],[14,4],[18,8],[23,6],[24,16],[20,17],[16,18],[10,17],[6,14]] */
        this.GRID_SIZE = 32

    }

    preload() {
        this.load.spritesheet('guy', 'src/assets/guy.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image("tiles", "src/assets/tileset.png");
        this.load.tilemapTiledJSON('tilemap', 'src/assets/level1tilemap.json')
        this.load.image("powerup", "src/assets/pointup.png")
        this.load.image("boulder", "src/assets/boulder.png")
        this.load.image("dirt", "src/assets/dirt.png");
    };
    
    create() {
    //    this.objects.camera = this.cameras.add(0, 0, 400, 300);
    //    this.objects.camera.setBackgroundColor('rgb(0, 0, 0)');
    
        // setOrigin is necessary to render from top-left corner of image, otherwise
        // set to render with coordinates from center by default
        


        const map = this.make.tilemap({ key: 'tilemap'});
        const tileset = map.addTilesetImage('tileset', 'tiles');
        const boulder = map.addTilesetImage('boulder', 'boulder');
        const dirt = map.addTilesetImage('dirt', 'dirt');
        const powerup = map.addTilesetImage('powerup', 'powerup');
        
        const ground = map.createLayer('ground', tileset);
        const blocks = map.createLayer('blocks', tileset);
        map.setCollisionBetween(461,462);

        const bouldersLayer = map.createLayer('boulders', boulder);
        map.setLayer('boulder');
        map.forEachTile((e) => {
            if (e.index == '1289') {
                this.boulders.create(e.pixelX,e.pixelY,'boulder').setOrigin(0,0)
            } 
        })
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
        const powerupLayer = map.createLayer('powerup', 'powerup')
        map.setLayer('powerup');
        map.forEachTile((e) => {
            if (e.index == '1290') {
                this.powerups.create(e.pixelX,e.pixelY,'powerup').setOrigin(0,0)
            } 
        })
        powerupLayer.setVisible(false)
/*         this.powerupsArray = map.getTilesWithin(0,0,25,19,null,'powerup')
        for (let powerup of this.powerupsArray) {
            this.powerups.create(powerup.pixelX,powerup.pixelY,'powerup')
        } */
/*         for (let powerup of this.powerups) {
            this.pointups.create(location[0]*this.GRID_SIZE-this.GRID_SIZE,location[1]*this.GRID_SIZE-this.GRID_SIZE, 'pointup').setOrigin(0,0)

        } */

        
        

        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`);

/*         for(let location of this.boulderLocations) {
            this.boulders.create(location[0]*this.GRID_SIZE-this.GRID_SIZE,location[1]*this.GRID_SIZE-this.GRID_SIZE, 'boulder').setOrigin(0,0)
        }

        for (let location of this.pointupLocations) {
            this.pointups.create(location[0]*this.GRID_SIZE-this.GRID_SIZE,location[1]*this.GRID_SIZE-this.GRID_SIZE, 'pointup').setOrigin(0,0)
        }
 */



        
        


        this.player = this.physics.add.sprite(32, 32, 'guy').setOrigin(0, 0);
        this.player.setScale(.5);

/*         this.physics.add.collider(this.player,this.boulders);

        this.physics.add.collider(this.player, blocks) */
        this.physics.add.overlap(this.player,this.powerups,this.collectPowerup,this.trueOverlap,this);

        this.physics.add.overlap(this.player,this.dirt,this.markDirt,this.trueOverlap,this)


        this.moveTimer = 0;
        this.movementPossible = false;
        
    
    
        // creates up/down/left/right inputs
    
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

        for (let dirt of this.dirt.getChildren()) {
            if (dirt.getData('marked') == true) {
                console.log('hi')
                if (this.trueOverlap(dirt, this.player) == false) {
                    console.log('hi2')
                    dirt.disableBody(true, true)
                }
            }
        }
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
        if (this.moveType === 'left' && this.stuckTimer > 500) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'right' && this.stuckTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos - 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'up' && this.stuckTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'down' && this.stuckTimer > 800) {
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
        if (this.moveTimer > 400 && this.goalReached === true) {
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

        //  Add and update the score
        this.score += 10;
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
}
export default SceneMain;