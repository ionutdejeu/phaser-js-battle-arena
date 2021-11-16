import "phaser";
import Player from "../prefabs/Player";

import {ControllableGroup} from "../prefabs/boids/Soldier";
import Chest from "../prefabs/Chest";
import {inputManagerInstance,KeyboardInputController} from "../prefabs/InputManager";
import { Subject } from "rxjs";
import { GameObjects, Physics } from "phaser";
import { ProjectileManager } from "../prefabs/projectiles/projectileManager";
import { BoidManager } from "../prefabs/boids/boidsManager";
import { PlayerGroup } from "../prefabs/player/playerGroup";
import { IWorldManager, WorldManager } from "../prefabs/world/worldManager";

export default class GameScene extends Phaser.Scene {
	score: number;


	keyboardController:KeyboardInputController;
	wall: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	chests: Phaser.Physics.Arcade.Group;
	goldPickupAudio: Phaser.Sound.BaseSound;
 	_playerGroup:PlayerGroup;
	sceneUpdateObservable:Subject<void>;
	graphics:Phaser.GameObjects.Graphics;
	projManager: ProjectileManager;
	boidManager: BoidManager;
	worldManager:IWorldManager;

	constructor() {
		super("Game"); // Name of the scene
		
	}

	init() {
		
		this.score = 0;
		this.scene.launch("UI");
		this.scene.launch("BezierScene");
	 
	}

	create() {
		//this.graphics.strokeRect(0,0,this.scale.width,this.scale.height);
		this.projManager = new ProjectileManager(this);
		this.boidManager = new BoidManager(this);
		this.boidManager.init(500);
	 
		this.boidManager.initAttractors(1,500)
		this.worldManager = new WorldManager(this);
		this.worldManager.create();

		
		this.createAudio();
		this.createWalls();
		this.createChests();

		this.createGroup();
		 
	
	 

		this.sceneUpdateObservable = new Subject();
		this.keyboardController = new KeyboardInputController(this.sceneUpdateObservable.asObservable(),this);
		inputManagerInstance.add_keyboard_controller(this,this.keyboardController);

		inputManagerInstance.onAxisChangedObservable.subscribe((newValues)=>{
			this._playerGroup.update_virtual(newValues);
		});
		
		this.cameras.main.startFollow(this._playerGroup);
		
		//this.graphics.strokePath();

	
		this.physics.add.collider(this.boidManager.getBoidCollisionGroup(),this._playerGroup);
		//this.physics.add.overlap(this.boidManager.getBoidCollisionGroup(),this._playerGroup.shootRange,
		//	(obj1,obj2:GameObjects.GameObject)=>{
		//	this._playerGroup.draw_target_line(obj2.body.position.x,obj2.body.position.y,this.sceneUpdateObservable);
		// });
		this.projManager.setupCollisionWithEnemeis(this.boidManager);
		this.boidManager.followPlayer(this._playerGroup)
		this.sceneUpdateObservable.next();
	}

  

	update() {
		this._playerGroup.targetObject(
			this.boidManager.getClosestBoidTo(this._playerGroup) as Physics.Arcade.Sprite
		);
		this.sceneUpdateObservable.next();
		this.boidManager.update();
		
	 
		 
		
		  
	}

	 

	createGroup(){
 		this._playerGroup = new PlayerGroup(this,0,0,this.projManager);
	}

	 

	createWalls() {
		this.wall = this.physics.add.image(500, 100, "button1");
		this.wall.setCollideWorldBounds(true);
		this.wall.setImmovable();
	}

	 
	createAudio() {
		this.goldPickupAudio = this.sound.add("goldSound");
	}

	createChests() {
		this.chests = this.physics.add.group();
		let maxChests = 3;
		let chestLocations = [
			[300, 300],
			[400, 300],
			[200, 400],
		];
		for (let i = 0; i < maxChests; i++) {
			this.spawnChest(chestLocations[i]);
		}
	}

	spawnChest(location) {
		let chest = this.chests.getFirstDead();
		if (chest) {
			chest.setPosition(location[0], location[1]);
			chest.makeActive();
			this.chests.add(chest);
		} else {
			this.chests.add(
				new Chest(this, location[0], location[1], "items", 0)
			);
		}
	}

	collectChest(player, chest) {
		this.score += chest.coins;
		this.goldPickupAudio.play();
		this.events.emit("updateScore", this.score);
		this.time.delayedCall(
			1000,
			() => {
				this.spawnChest([chest.x, chest.y]);
			},
			[],
			this
		);
		chest.makeInactive();
	}
}
