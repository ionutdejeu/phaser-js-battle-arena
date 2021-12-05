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
import { EnemyManager, IEnemyManager } from "../prefabs/boids/enemyManager";
import { ExplosionManager, IExplosionManager } from "../prefabs/explosion/explosionManager";
import { DamageManager } from "../prefabs/damage/damageManager";
import { ScoreManager } from "../prefabs/score/scoreManager";

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
	enemyManager:IEnemyManager;
	explosionManager:IExplosionManager;
	damageManager:DamageManager;
	scoreManager:ScoreManager;

	constructor() {
		super("Game"); // Name of the scene
		
	}

	init() {
		
		this.score = 0;
		this.scene.launch("UI");
		this.scene.launch("BezierScene");
		this.graphics = this.add.graphics();
	 
	}

	create() {
		//this.graphics.strokeRect(0,0,this.scale.width,this.scale.height);
		this.projManager = new ProjectileManager(this);
		this.boidManager = new BoidManager(this);
		this.boidManager.init(500);
		this.damageManager = new DamageManager(this);
		this.damageManager.createPlayerDamabableEntity(this._playerGroup)
		this.damageManager.registerDamagebleEntitiesForObjects(this.boidManager._boidsData.boidsObjects)
		
		
	 
		this.boidManager.initAttractors(2,500)
		this.worldManager = new WorldManager(this);
		this.worldManager.create();
		this.enemyManager = new EnemyManager(this);
		this.enemyManager.init(10);
		this.explosionManager = new ExplosionManager(this);
		
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

	
		//this.physics.add.collider(this.boidManager.getBoidCollisionGroup(),this._playerGroup);
		this.boidManager.setupCollisionWith(this._playerGroup);
		this.projManager.setupCollisionWithEnemeis(this.boidManager);
		this.boidManager.followPlayer(this._playerGroup)
		this.sceneUpdateObservable.next();
		this.enemyManager.spawnAtRandom(this._playerGroup);
		this.scoreManager = new ScoreManager(this);
		//this.boidManager.spawnAttractor
	}


	update() {
		this._playerGroup.targetObject(
			this.boidManager.getClosestBoidTo(this._playerGroup) as Physics.Arcade.Sprite
		);
		this.sceneUpdateObservable.next();
		this.boidManager.update();
		this.enemyManager.update()
		this.projManager.update();
		this.graphics.clear()
		this.enemyManager.draw(this.graphics);
	 
		
		
		  
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
