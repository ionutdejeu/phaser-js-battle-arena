import "phaser";
import Player from "../prefabs/Player";

import {ControllableGroup} from "../prefabs/boids/Soldier";
import Chest from "../prefabs/Chest";
import {inputManagerInstance,KeyboardInputController} from "../prefabs/InputManager";
import { Subject } from "rxjs";
import { GameObjects } from "phaser";
import { ProjectileManager } from "../prefabs/player/projectileManager";

export default class GameScene extends Phaser.Scene {
	score: number;

	player;
	keys: object;
	keyboardController:KeyboardInputController;
	wall: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	chests: Phaser.Physics.Arcade.Group;
	goldPickupAudio: Phaser.Sound.BaseSound;
	boids:Array<Phaser.Physics.Arcade.Image> = []
	boidsSpeed:Array<Number> = []
	collisionGroup:Phaser.Physics.Arcade.Group
	boidsNum:integer = 50;
	boidData:Float64Array;
	controlGroup:ControllableGroup
	sceneUpdateObservable:Subject<void>;
	graphics:Phaser.GameObjects.Graphics;
	projManager: ProjectileManager;

	constructor() {
		super("Game"); // Name of the scene
		
	}

	init() {
		
		this.score = 0;
		this.scene.launch("UI");
		this.scene.launch("BezierScene");
		let array_size = this.boidsNum**2+this.boidsNum; 
		this.boidData = new Float64Array(array_size);
	}

	create() {
		//this.graphics.strokeRect(0,0,this.scale.width,this.scale.height);
		this.projManager = new ProjectileManager(this);
		
		this.createAudio();
		this.createWalls();
		this.createChests();
		this.createPlayer();
		this.addCollisions();
		this.createInput();
		this.createGroup();
		this.collisionGroup = this.physics.add.group({
			bounceX:0.5,
			bounceY:0.5
		});
	
		for(var i = 0; i < this.boidsNum; i++){
			var randomX = Phaser.Math.Between(0, window.innerWidth - 1);
			var randomY = Phaser.Math.Between(0, window.innerHeight - 1);
			this.boids[i] = this.physics.add.sprite(randomX, randomY, 'items');
			this.boidsSpeed[i] = 0.05;
			this.boids[i].setVelocity(randomX*0.001, randomY*0.001);
			
			this.collisionGroup.add(this.boids[i]);
			// Physics
			this.physics.world.enable(this.boids[i]);
			this.boids[i].setCollideWorldBounds(true);
			this.boids[i].setBounce(0.1,0.1);
		  }
		  
		  
		  this.physics.add.collider(this.collisionGroup,this.collisionGroup);
		  this.physics.add.collider(this.collisionGroup,this.player);
		  this.physics.add.collider(this.collisionGroup,this.controlGroup);
		  this.physics.add.overlap(this.collisionGroup,this.controlGroup.shootRange,(obj1,obj2:GameObjects.GameObject)=>{
			 this.controlGroup.draw_target_line(obj2.body.position.x,obj2.body.position.y,this.sceneUpdateObservable);
		  });

		this.physics.add.collider(this.player,this.controlGroup);
		this.sceneUpdateObservable = new Subject();
		this.keyboardController = new KeyboardInputController(this.sceneUpdateObservable.asObservable(),this);
		inputManagerInstance.add_keyboard_controller(this,this.keyboardController);

		inputManagerInstance.onAxisChangedObservable.subscribe((newValues)=>{
			this.controlGroup.update_virtual(newValues);
			this.player.update_virtual(newValues);
		});
		this.cameras.main.startFollow(this.controlGroup);
		
		//this.graphics.strokePath();

		
		this.projManager.setupCollisionWithEnemeis(this.collisionGroup);
		this.sceneUpdateObservable.next();
	}

	bound(boid) {
		var limit = 10;
		if (boid.x < limit) {
		  boid.body.velocity.x = Math.abs(boid.body.velocity.x);
		}
		else if (boid.x > window.innerWidth - limit) {
		  boid.body.velocity.x = -1 * Math.abs(boid.body.velocity.x);
		}
		if (boid.y < limit) {
		  boid.body.velocity.y = Math.abs(boid.body.velocity.y);
		}
		else if (boid.y > window.innerHeight- limit) {
		  boid.body.velocity.y = -1 *Math.abs(boid.body.velocity.y);
		}
	  };

	computeAngle(velocity) {
		var zeroPoint = new Phaser.Geom.Point(0, 0);
		var angleRad = Phaser.Math.Angle.BetweenPoints(zeroPoint, velocity);
		return Phaser.Math.RadToDeg(angleRad);
	};

	cohesion_cached(boid_index) {
		var closeBoids = [];
		var radius = 40**2;
		let boid_i = boid_index*this.boidsNum;
		for (let i = 0;i<this.boidsNum;i++) {
			if (this.boidData[boid_i+i] < radius) {
				closeBoids.push(this.boids[i]);
			}
		}
		if (closeBoids.length == 0) {
			return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(centroid.x - this.boids[boid_index].x, centroid.y - this.boids[boid_index].y)
		return force.normalize()
	};
	cohesion(boid, boids) {
		var closeBoids = [];
		var radius = 40**2;
		for (var otherBoid of boids) {
			var distance = Phaser.Math.Distance.BetweenPointsSquared(otherBoid, boid);
			if (distance < radius) {
				closeBoids.push(otherBoid)
			}
		}
		if (closeBoids.length == 0) {
			return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(centroid.x - boid.x, centroid.y - boid.y)
		return force.normalize()
	};
	
	separation(boid, boids) {
		var tooCloseBoids = []
		var radius = 80**2;
		for (var otherBoid of boids) { // TODO helper to get close boids
		  var distance = Phaser.Math.Distance.BetweenPointsSquared(otherBoid, boid);
		  if (distance < radius && distance != 0) {
			tooCloseBoids.push(otherBoid)
		  }
		}
		if (tooCloseBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(tooCloseBoids);
		var force = new Phaser.Math.Vector2(boid.x - centroid.x, boid.y - centroid.y)
		return force.normalize()
	};
	separation_cached(boid_index) {
		var tooCloseBoids = []
		var radius = 80**2;
		let boid_i = boid_index*this.boidsNum;
		for (let i = 0;i<this.boidsNum;i++) {
			if (this.boidData[boid_i+i] < radius) {
				tooCloseBoids.push(this.boids[i]);
			}
		}
		if (tooCloseBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(tooCloseBoids);
		var force = new Phaser.Math.Vector2(
			this.boids[boid_index].x - centroid.x, 
			this.boids[boid_index].y - centroid.y)
		return force.normalize()
	};

	alignement(boid, boids) {
		var closeBoids = []
		var radius = 90**2;
		for (var otherBoid of boids) {
		  var distance = Phaser.Math.Distance.BetweenPointsSquared(otherBoid, boid);
		  if (distance < radius && distance != 0) {
			closeBoids.push(otherBoid.body.velocity)
		  }
		}
		if (closeBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		//var closeBoidsVelocity = closeBoids.map(function(x) {return x.body.velocity});
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(
			centroid.x - boid.body.velocity.x, 
			centroid.y - boid.body.velocity.y);
		return force.normalize();
	};

	running_away_from_player_cached(boid_index:integer,player:Phaser.Physics.Arcade.Image) {
		var closeBoids = []
		var radius = 30**2;
		let playerSegment = this.boidsNum**2;

		for (let i = 0;i<this.boidsNum;i++) {
			if (this.boidData[playerSegment+i] < radius) {
				
				closeBoids.push(this.boids[i]);
			}
		}
		if (closeBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		//var closeBoidsVelocity = closeBoids.map(function(x) {return x.body.velocity});
		var force = new Phaser.Math.Vector2(
			 this.boids[boid_index].x-player.x , 
			this.boids[boid_index].y-player.y);
		return force.normalize();
	};

	seeek_target(boid_index:integer,targetx:number,targety:number){
		let direction = new Phaser.Math.Vector2(targetx,targety);
		let boid_pos = new Phaser.Math.Vector2(this.boids[boid_index].x,this.boids[boid_index].y);
		direction.subtract(boid_pos);

		return direction.normalize();
	}

	match_velicity(boid_index:integer,leader_velocity:Phaser.Math.Vector2){
		return leader_velocity
	}

	arrive_target(boid_index:integer,targetx:number,targety:number){

	}



	alignement_cached(boid_index) {
		var closeBoids = []
		var radius = 90**2;
		let boid_i = boid_index*this.boidsNum;

		for (let i = 0;i<this.boidsNum;i++) {
			if (this.boidData[boid_i+i] < radius) {
				closeBoids.push(this.boids[i].body.velocity);
			}
		}
		if (closeBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		//var closeBoidsVelocity = closeBoids.map(function(x) {return x.body.velocity});
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(
			centroid.x - this.boids[boid_index].body.velocity.x, 
			centroid.y - this.boids[boid_index].body.velocity.y);
		return force.normalize();
	};

	update() {
		this.sceneUpdateObservable.next();
		
		
		for(let i =0;i<this.boidsNum;i++){
			for(let j=0;j<this.boidsNum;j++){
				this.boidData[i*this.boidsNum+j] = Phaser.Math.Distance.BetweenPointsSquared(this.boids[i], this.boids[j]);
			}
		}
		let playerSegment = this.boidsNum**2;
		for(let j=playerSegment;j<this.boidsNum;j++){
			this.boidData[j] = Phaser.Math.Distance.BetweenPointsSquared(this.player, this.boids[j]);
		}
 
		 
		for(let i = 0;i<this.boidsNum;i++){
			
			let boid = this.boids[i];
			
			//this.bound(boid);
			//compute velocity
			var f1 = this.cohesion_cached(i);
			var f2 = this.separation_cached(i);
			var f3 = this.alignement_cached(i);
			var f4 = this.running_away_from_player_cached(i,this.player);
			var f5 = this.seeek_target(i,this.player.x,this.player.y);
			var f6 = this.match_velicity(i,this.player.body.velocity);
			
			
			//var f11 = this.cohesion(boid,this.boids);
			//var f22 = this.separation(boid,this.boids);
			//var f33 = this.alignement(boid,this.boids);
			
			//if (! f1.equals(f11) || !f2.equals(f22) || !f3.equals(f33))
			//	console.log('f1:',f1,'f11',f11,'f2',f2,'f22',f22,'f3',f3,'f33',f33)

			var coef1 = 0.0;
			var coef2 = 0.0;
			var coef3 = 0.0;
			var coef4 = 0.0;
			var coef5 = 4;
			var coef6 = 0;

		
			var newAcc = new Phaser.Math.Vector2(
				coef1*f1.x + coef2*f2.x + coef3*f3.x + coef4*f4.x + coef5*f5.x + coef6*f6.x,
				 coef1*f1.y + coef2*f2.y + coef3*f3.y + coef4*f4.y + coef5*f5.y + coef6*f6.y);
			newAcc.normalize();
			var newVelocity = new Phaser.Math.Vector2(boid.body.velocity.x + newAcc.x, boid.body.velocity.y + newAcc.y);
			boid.setVelocity(newVelocity.x, newVelocity.y);		
			//turn in the right direction
			boid.setAngle(this.computeAngle(boid.body.velocity));
		  }
		
		  
	}

	createPlayer() {
		this.player = new Player(this, 200, 200, "characters", 0);
	}

	createGroup(){
		this.controlGroup = new ControllableGroup(this,0,0,this.projManager);
	}

	createInput() {
		this.keys = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
		});
	}

	createWalls() {
		this.wall = this.physics.add.image(500, 100, "button1");
		this.wall.setCollideWorldBounds(true);
		this.wall.setImmovable();
	}

	addCollisions() {
		this.physics.add.collider(this.player, this.wall);
		

		this.physics.add.overlap(
			this.player,
			this.chests,
			this.collectChest,
			null,
			this
		);
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
