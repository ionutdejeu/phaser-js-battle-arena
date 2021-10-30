import {Subject} from 'rxjs'
import VirtualJoyStick from "../prefabs/VirtualJoyStick";
import {inputManagerInstance,VirtualJoyStickController} from '../prefabs/InputManager'


let joystick_singleton:VirtualJoyStick = null;

export class UIScene extends Phaser.Scene {
	gameScene: Phaser.Scene;
	scoreText: Phaser.GameObjects.Text;
	coinIcon: Phaser.GameObjects.Image;
	virtualJoyStick:VirtualJoyStick;
    virtualController:VirtualJoyStickController;
    sceneUpdateObservable:Subject<void>;
	constructor() {
		super("UI"); // Name of the scene
	}

	init(): void {
		
		this.gameScene = this.scene.get("Game");
	}

	create(): void {
		this.setupUIElements();
		this.setupEvents();
	}

	update(time){

	}

	setupUIElements(): void {
		this.scoreText = this.add.text(35, 8, "Coins: 0", {
			fontSize: "16px",
			color: "white",
		});

		this.coinIcon = this.add.image(15, 15, "items", 3);
		this.virtualJoyStick = new VirtualJoyStick(this,100,100,'a');
		this.input.setDraggable(this.virtualJoyStick);
		joystick_singleton = this.virtualJoyStick;

		this.sceneUpdateObservable = new Subject();

    this.virtualController = new VirtualJoyStickController(this.sceneUpdateObservable.asObservable(),this.virtualJoyStick);
    inputManagerInstance.add_android_controller(this,this.virtualController);

	}

	setupEvents(): void {
		this.gameScene.events.on("updateScore", (score: number) => {
			this.scoreText.setText(`Coins: ${score}`);
		});
	}
}

export {joystick_singleton}
