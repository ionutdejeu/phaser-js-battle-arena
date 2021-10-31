import "phaser";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import TitleScene from "./scenes/TitleScene";
import {UIScene} from "./scenes/UIScene";
 

const config = {
    type: Phaser.WEBGL,
    backgroundColor: '#125555',
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

 
window.onload = (): void => {
	const game = new Phaser.Game(config);
	console.log(config);
	// Allow Resize
	resize();
	window.addEventListener("resize", resize, true);
};

function resize(): void {
	const canvas = document.querySelector("canvas");
	var width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}