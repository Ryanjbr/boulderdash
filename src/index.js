/*jshint esversion: 6 */
import Phaser from 'phaser';
import {SceneMain} from "../scenes/SceneMain"


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor:0x000000,
    scene: SceneMain,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};



const game = new Phaser.Game(config);
