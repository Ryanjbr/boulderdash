export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    init() {
        this.moveTimer = 0;
        this.movementPossible = false;
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.spritesheet('guy', 'src/assets/guy.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image("tiles", "src/assets/tileset.png");
        this.load.tilemapTiledJSON('tilemap', 'src/assets/tileset.json')
        
    };
    
    create() {
    //    this.objects.camera = this.cameras.add(0, 0, 400, 300);
    //    this.objects.camera.setBackgroundColor('rgb(0, 0, 0)');
    
        // setOrigin is necessary to render from top-left corner of image, otherwise
        // set to render with coordinates from center by default
    
        const map = this.make.tilemap({ key: 'tilemap'});
        const tileset = map.addTilesetImage('tileset', 'tiles')
        
        map.createLayer('dirt', tileset);
        map.createLayer('blocks', tileset);
        map.createLayer('boulders', tileset);

        this.player = this.physics.add.staticSprite(32, 32, 'guy').setOrigin(0, 0);
        this.player.setScale(.5);

        this.moveTimer = 0;
        this.movementPossible = false;
        //this.cameras.main.centerOn(800, 1300);
    
    
        // creates up/down/left/right inputs
    
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'guy', frame: 27 }],
            frameRate: 20
        }); 
    };
    
    update(time, delta) {
        this.player.anims.play('idle', true)

        
    
        this.moveTimer += delta;
        if (this.moveTimer > 500) {
            this.movementPossible = true;
        }
    
        // moves player 32 px at a time along given tiles
        if (this.cursors.left.isDown && this.movementPossible === true) {
            this.player.x -= 32;
            this.moveTimer = 0;
            this.movementPossible = false;
        }
    
        else if (this.cursors.right.isDown && this.movementPossible === true) {
            this.player.x += 32;
            this.moveTimer = 0;
            this.movementPossible = false;
        }
    
        else if (this.cursors.up.isDown && this.movementPossible === true) {
            this.player.y -= 32;
            this.moveTimer = 0;
            this.movementPossible = false;
        }
    
        else if (this.cursors.down.isDown && this.movementPossible === true) {
            this.player.y += 32;
            this.moveTimer = 0;
            this.movementPossible = false;
        }
    };
}
export default SceneMain;