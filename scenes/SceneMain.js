export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    init() {
        this.score = 0;
        this.scoreText;
        this.moveTimer = 0;
        this.movementPossible = false;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.goalPos = 0;
        this.text = this.add.text(10,10, 'debug');
        this.moveType = '';
        this.goalReached = true;
        this.boulders = this.physics.add.group();
        this.pointups = this.physics.add.group();
        this.boulderLocations = [[4,17], [4,16], [8,5], [8,15]]
        this.pointupLocations = [[2,9],[5,2],[9,10],[14,4],[18,8],[23,6],[24,16],[20,17],[16,18],[10,17],[6,14]]
        this.GRID_SIZE = 32
    }

    preload() {
        this.load.spritesheet('guy', 'src/assets/guy.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image("tiles", "src/assets/tileset.png");
        this.load.tilemapTiledJSON('tilemap', 'src/assets/tileset.json')
        this.load.image("pointup", "src/assets/pointup.png")
        this.load.image("boulder", "src/assets/boulder.png")
    };
    
    create() {
    //    this.objects.camera = this.cameras.add(0, 0, 400, 300);
    //    this.objects.camera.setBackgroundColor('rgb(0, 0, 0)');
    
        // setOrigin is necessary to render from top-left corner of image, otherwise
        // set to render with coordinates from center by default
    
        const map = this.make.tilemap({ key: 'tilemap'});
        const tileset = map.addTilesetImage('tileset', 'tiles')
        
        const dirt = map.createLayer('dirt', tileset);
        const blocks = map.createLayer('blocks', tileset);
        map.setCollisionBetween(461,461);

        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`);

        for(let location of this.boulderLocations) {
            this.boulders.create(location[0]*this.GRID_SIZE-this.GRID_SIZE,location[1]*this.GRID_SIZE-this.GRID_SIZE, 'boulder').setOrigin(0,0)
        }

        for (let location of this.pointupLocations) {
            this.pointups.create(location[0]*this.GRID_SIZE-this.GRID_SIZE,location[1]*this.GRID_SIZE-this.GRID_SIZE, 'pointup').setOrigin(0,0)
        }




        
        


        this.player = this.physics.add.sprite(32, 32, 'guy').setOrigin(0, 0);
        this.player.setScale(.5);
        this.physics.add.collider(this.player,this.boulders);

        this.physics.add.collider(this.player, blocks)
        this.physics.add.overlap(this.player, this.pointups, this.collectPointup, this.trueOverlap, this)


        this.moveTimer = 0;
        this.movementPossible = false;
        
    
    
        // creates up/down/left/right inputs
    
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'guy', frame: 27 }],
            frameRate: 20
        }); 

    };
    
    update(time, delta) {
/*         this.text.destroy();
        this.text = this.add.text(10, 10, `
            x: ${this.player.body.x},
            y: ${this.player.body.y},
            velocity: ${this.player.body.velocity},
            lastPlayerX: ${this.lastPlayerX},
        `); */

        this.player.anims.play('idle', true)
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
        if (this.moveType === 'left' && this.moveTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'right' && this.moveTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.x = this.goalPos - 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'up' && this.moveTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos + 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        if (this.moveType === 'down' && this.moveTimer > 800) {
            this.player.body.setVelocity(0);
            this.player.body.y = this.goalPos - 32;
            this.movementPossible = true;
            this.moveTimer = 0;
            this.moveType = '';
            this.goalPos = 0;
            this.goalReached = true;
        }
        
    
        this.moveTimer += delta;
        if (this.moveTimer > 400 && this.goalReached === true) {
            this.movementPossible = true;
        }
    
        // moves player 32 px at a time along given tiles
        if (this.cursors.left.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.x - 32;
            this.player.body.setVelocityX(-300)
            this.moveType = 'left'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.right.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.x + 32;
            this.player.body.setVelocityX(300)
            this.moveType = 'right'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.up.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.y - 32;
            this.player.body.setVelocityY(-300)
            this.moveType = 'up'
            this.movementPossible = false;
            this.goalReached = false;
        }
    
        else if (this.cursors.down.isDown && this.movementPossible === true) {
            this.goalPos = this.player.body.y + 32;
            this.player.body.setVelocityY(300)
            this.moveType = 'down'
            this.movementPossible = false;
            this.goalReached = false;
        }
    };

    collectPointup(player,pointup) {
        pointup.disableBody(true, true);

        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
    trueOverlap(objectA,objectB) {
        const xDiff = objectA.body.x - objectB.body.x;
        const yDiff = objectA.body.y - objectB.body.y;
        if (xDiff > -5 && xDiff < 5 && yDiff > -5 && yDiff < 5) {
            return true;
        };
        return false;
    }
}
export default SceneMain;