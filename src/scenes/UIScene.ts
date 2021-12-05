import {Subject} from 'rxjs'
import VirtualJoyStick from "../prefabs/VirtualJoyStick";
import {inputManagerInstance,VirtualJoyStickController} from '../prefabs/InputManager'
import {AlignGrid} from '../prefabs/AlignGrid'
import { UIBlock } from '../prefabs/ui/UiBlock';
import { ItemBar } from '../prefabs/ui/ItemBar';
import { InGameUiManager, IUiManager } from '../prefabs/ui/inGameUiManager';


export class UIScene extends Phaser.Scene {
	gameScene: Phaser.Scene;
	scoreText: Phaser.GameObjects.Text;
	coinIcon: Phaser.GameObjects.Image;
	virtualJoyStick:VirtualJoyStick;
    virtualController:VirtualJoyStickController;
    sceneUpdateObservable:Subject<void>;
	graphics:Phaser.GameObjects.Graphics;
	uiGrid:AlignGrid;
	_itemBar:ItemBar
	_in_game_menut:IUiManager;
	constructor() {
		super("UI"); // Name of the scene
	}


	init(): void {
		
		this.gameScene = this.scene.get("Game");
		this.scene.bringToTop();
		this._itemBar = new ItemBar(this);
		//this._itemBar.init();
		this._in_game_menut = new InGameUiManager(this);
		this._in_game_menut.init();
		this.game.events.addListener("updateScoreUI",(score: number) => {
			console.log('score update');
			this.scoreText.setText(`Parts: ${score}`);
		});
		
	}

	create(): void {
		this.setupUIElements();
		this.setupEvents();
	}

	update(){
		this.sceneUpdateObservable.next();
		
	}

	setupUIElements(): void {
		this.scoreText = this.add.text(35, 8, "Parts: 0", {
			fontSize: "16px",
			color: "white",
		});

		this.coinIcon = this.add.image(15, 15, "items", 3);
		this.virtualJoyStick = new VirtualJoyStick(this,100,100,'a');
		this.input.setDraggable(this.virtualJoyStick);
		this.virtualJoyStick.setScrollFactor(0,0,true);
		
		this.sceneUpdateObservable = new Subject();

		this.virtualController = new VirtualJoyStickController(this.sceneUpdateObservable.asObservable(),this.virtualJoyStick);
		inputManagerInstance.add_android_controller(this,this.virtualController);
		this.uiGrid = new AlignGrid(this,3,4);
		this.uiGrid.placeAt(0,3,this.virtualJoyStick);
		//this.uiGrid.draw();
		
	}
	 
	setupEvents(): void {
		this.gameScene.events.on("updateScore", (score: number) => {
			this.scoreText.setText(`Parts: ${score}`);
		});
	}
}
