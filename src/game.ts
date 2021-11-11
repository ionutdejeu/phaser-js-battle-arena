import "phaser";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import TitleScene from "./scenes/TitleScene";
import {UIScene} from "./scenes/UIScene";
import MainMenuScene from "./scenes/MainMenuScene";

const config = {
    type: Phaser.WEBGL,
    // TODO: OnResize
	width:  window.innerWidth * window.devicePixelRatio,
	height: window.innerHeight * window.devicePixelRatio,
	scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        width: '100%',
        height: '100%'
    },
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
	window.addEventListener("resize", resize, true);
	window.addEventListener("orientationchange",resize,true);
};

function resize():void{
	var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.scale.width / game.scale.height;

	console.log('w:',windowWidth,'h:',windowHeight);
	console.log('device ratio:',window.devicePixelRatio,'game ratio',gameRatio,'window ration',windowRatio);

	game.scale.resize(windowWidth/devicePixelRatio,windowHeight/devicePixelRatio);
	canvas.style.width = windowWidth + "px";
    canvas.style.height = windowHeight + "px";
	console.log('h/dpr:',windowWidth/ window.devicePixelRatio,'w/dpr',windowHeight/window.devicePixelRatio);
	game.scale.refresh();
    
}