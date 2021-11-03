import "phaser";
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
	// Allow Resize
	resize();
	game.scale.lockOrientation('landscape');
	window.addEventListener("resize", resize, true);
};


function resize(): void {
	const canvas = document.querySelector("canvas");
	var width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height;


	console.log('w:',width,'h:',height);
	console.log('wration:',wratio);
	console.log('device ratio:',window.devicePixelRatio);

    if (wratio >1) {
		var width = window.innerWidth / window.devicePixelRatio;
		var height = window.innerHeight / window.devicePixelRatio 
		game.scale.setGameSize(width,height)

        
    } else {
		console.log('should be:');
        var width = window.innerWidth / devicePixelRatio/wratio;
		var height = window.innerHeight / devicePixelRatio/wratio; 
		game.scale.setGameSize(width,height)

    }


}