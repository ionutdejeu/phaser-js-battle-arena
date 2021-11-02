import "phaser";
import { Cameras } from "phaser";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import TitleScene from "./scenes/TitleScene";
import {UIScene} from "./scenes/UIScene";
 

const config = {
    type: Phaser.WEBGL,
    // TODO: OnResize
	width:  window.innerWidth * window.devicePixelRatio,
	height: window.innerHeight * window.devicePixelRatio,
    physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: true,
		},
	},
    scene: [BootScene, TitleScene, GameScene, UIScene],
};

var game:Phaser.Game = null;
window.onload = (): void => {
	game = new Phaser.Game(config);
	console.log(config);
	// Allow Resize
	resize();
	game.scale.lockOrientation('landscape');
	window.addEventListener("resize", resize, true);
};


function resize(): void {
	const canvas = document.querySelector("canvas");
	var width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = game.scale.width / game.scale.height;

	console.log(wratio);
    if (wratio < ratio) {
        canvas.style.width = width*ratio + "px";
        canvas.style.height = (width) + "px";
		game.scale.setGameSize(width*ratio/window.devicePixelRatio,width /window.devicePixelRatio)

    } else {
		console.log('else');
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
		game.scale.setGameSize(height * ratio/window.devicePixelRatio,height/window.devicePixelRatio)

    }


}