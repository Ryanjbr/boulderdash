import {SceneMain} from './SceneMain.js'

export class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene");
    }

    create() {
        this.scene.start('SceneMain', {level: 1});
        console.log('started')
    }
}