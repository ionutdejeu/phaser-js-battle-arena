import { Vector } from "matter";

export interface IBoidManager{
    init(maxNurBoids:integer):void;
    get(x:number,y:number);
    deactivateBoid(boid:Phaser.Physics.Arcade.Sprite);
    spawn(posx,posy):Phaser.Physics.Arcade.Sprite;
    spawnAttractor(posx,posy):void;
    deactivateAttractor(attractor:Phaser.Physics.Arcade.Sprite):void
    getBoidCollisionGroup();
    getAttractorsColisionGroup();
    getRepellersCollisionGroup();
}

class BoidPoolCacheData{ 

    poolSize:integer;
    poolSizeSquared:integer;
    cachedDataSize:integer;
    liveObjectsCount:integer; 
    liveObjects:Array<boolean> = []
    collisionGroup:Phaser.Physics.Arcade.Group;
	boidsObjects:Array<Phaser.Physics.Arcade.Sprite> = []
    boidCachedDistances:Float64Array;


    init(poolSize:integer,cachedDataSize:integer,activeCount:integer=0){
        this.poolSize = poolSize;
        this.cachedDataSize = cachedDataSize;
        this.liveObjectsCount = activeCount;
        for(let i=0;i<poolSize;i++){
            if (i < this.liveObjectsCount){
                this.liveObjects.push(true)
            }else{
                this.liveObjects.push(false)
            }
        }
        this.poolSizeSquared = this.poolSize**2;
        this.boidCachedDistances = new Float64Array(cachedDataSize);
    }

    shouldProcesBoidData(){
        return this.liveObjectsCount > 0;
    }

    activate(index:integer){
        this.liveObjects[index] = true;
        this.boidsObjects[index].setActive(true);
        this.boidsObjects[index].setVisible(true);
        this.boidsObjects[index].body.checkCollision.down = true;
        this.boidsObjects[index].body.checkCollision.up = true;
        this.boidsObjects[index].body.checkCollision.left = true;
        this.boidsObjects[index].body.checkCollision.right = true;
    }

    deactivate(index:integer){
        this.liveObjects[index] = false;
        this.boidsObjects[index].setVelocity(0,0);
        this.boidsObjects[index].setActive(false);
        this.boidsObjects[index].setVisible(false);
        this.boidsObjects[index].body.enable = false
        this.boidsObjects[index].body.checkCollision.none = true;
    }
}
export class BoidManager implements IBoidManager{
    _scene:Phaser.Scene
    _boindPoolSize:integer
    _boidsData:BoidPoolCacheData;
    _attractorsCachedData:BoidPoolCacheData;
    _repelersCachedData:BoidPoolCacheData;

    constructor(sc:Phaser.Scene){
        this._scene = sc
        this._boidsData = new BoidPoolCacheData();
        this._attractorsCachedData = new BoidPoolCacheData();
        this._repelersCachedData = new BoidPoolCacheData();

    }
    deactivateBoid(boid: Phaser.Physics.Arcade.Sprite) {
        this.makeInactive(boid)
        this._boidsData.collisionGroup.remove(boid);
    }
    spawn(posx: any, posy: any): Phaser.Physics.Arcade.Sprite {
        throw new Error("Method not implemented.");
    }
    spawnAttractor(posx: any, posy: any): void {
        throw new Error("Method not implemented.");
    }
    deactivateAttractor(attractor: Phaser.Physics.Arcade.Sprite): void {
        throw new Error("Method not implemented.");
    }
    getBoidCollisionGroup() {
        return this._boidsData.collisionGroup
    }
    getAttractorsColisionGroup() {
        return this._attractorsCachedData.collisionGroup
    }
    getRepellersCollisionGroup() {
        return this._repelersCachedData.collisionGroup
    }
     
    setupCollisionWith(group:Phaser.GameObjects.Group){
        this._scene.physics.add.collider(this._boidsData.collisionGroup,group);
    }

    update(){
        //compute distances between all boids
        for(let i =0;i<this._boidsData.poolSize;i++){
			for(let j=0;j<this._boidsData.poolSize;j++){
                if(i!=j && this._boidsData.liveObjects[i] == true 
                    && this._boidsData.liveObjects[j]==true){
                        
				    let dist = 
                    Phaser.Math.Distance.BetweenPointsSquared(
                        this._boidsData.boidsObjects[i], 
                        this._boidsData.boidsObjects[j]);
                    
                    this._boidsData.boidCachedDistances[i*this._boidsData.poolSize+j] = dist
                }
			}
		}       
        // compute distance between boids and list of attractors 
        if(this._attractorsCachedData.liveObjectsCount>0){
            for(let i=0;i<this._attractorsCachedData.poolSize;i++){
                for(let j=0;j<this._boidsData.poolSize;j++){
                    this._attractorsCachedData.boidCachedDistances[i*this._boidsData.poolSize+j] = 
                    Phaser.Math.Distance.BetweenPointsSquared(
                        this._attractorsCachedData.boidsObjects[i], 
                        this._boidsData.boidsObjects[j]);
                }
            }
        }
        // compute distance between boids and list of repellers
        if(this._repelersCachedData.liveObjectsCount>0){
            for(let i=0;i<this._repelersCachedData.poolSize;i++){
                for(let j=0;j<this._boidsData.poolSize;j++){
                    this._repelersCachedData.boidCachedDistances[i*this._boidsData.poolSize+j] = 
                    Phaser.Math.Distance.BetweenPointsSquared(
                        this._attractorsCachedData.boidsObjects[i], 
                        this._boidsData.boidsObjects[j]);
                }
            }
        }
        
        for(let i = 0;i<this._boidsData.poolSize;i++){
            
			if(!this._boidsData.liveObjects[i]){
                continue;
            }
			let boid = this._boidsData.boidsObjects[i];
            
			
			//this.bound(boid);
			//compute velocity
			var f1 = this.cohesion(i);
			var f2 = this.separation(i);
			var f3 = this.alignement(i);
			
			
			var coef1 = .5;
			var coef2 = 1.0;
			var coef3 = .75;
            
			var newAcc = new Phaser.Math.Vector2(
				coef1*f1.x + coef2*f2.x + coef3*f3.x, 
				 coef1*f1.y + coef2*f2.y + coef3*f3.y );
			newAcc.normalize();
			var newVelocity = new Phaser.Math.Vector2(boid.body.velocity.x + newAcc.x, boid.body.velocity.y + newAcc.y);
			boid.setVelocity(newVelocity.x, newVelocity.y);		
			//turn in the right direction
			boid.setAngle(this.computeAngle(boid.body.velocity));
		}
    }

    init(maxNurBoids?: integer): void {
        
        this._boidsData.init(maxNurBoids,maxNurBoids**2,maxNurBoids);
        this._boidsData.collisionGroup = this._scene.physics.add.group();
 
        for(var i = 0; i < maxNurBoids; i++){
			var randomX = Phaser.Math.Between(0, window.innerWidth/devicePixelRatio - 1);
			var randomY = Phaser.Math.Between(0, window.innerHeight/devicePixelRatio - 1);
			let boid = this._scene.physics.add.sprite(randomX, randomY, 'items');
			boid.setVelocity(randomX*0.001, randomY*0.001);
			
			this._boidsData.collisionGroup.add(boid);
			// Physics
			this._scene.physics.world.enable(boid);
			boid.setCollideWorldBounds(true);
			boid.setBounce(0.1,0.1);
            this._boidsData.boidsObjects.push(boid);
		}
		  
    }

    initAttractors(maxNrAttractors:integer,boidPoolCount:integer){
        this._attractorsCachedData.init(maxNrAttractors,maxNrAttractors*boidPoolCount,0);
    }
    initRepelers(maxNrRepelers:integer,boidPoolCount:integer){
        this._attractorsCachedData.init(maxNrRepelers,maxNrRepelers*boidPoolCount,0);
    }

    computeAngle(velocity) {
		var zeroPoint = new Phaser.Geom.Point(0, 0);
		var angleRad = Phaser.Math.Angle.BetweenPoints(zeroPoint, velocity);
		return Phaser.Math.RadToDeg(angleRad);
	};

    repel(repeller_index){
        var tooCloseBoids = []
		var radius = 80**2;
		let boid_i = repeller_index*this._repelersCachedData.poolSize;
		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && this._repelersCachedData.boidCachedDistances[boid_i+i] < radius) {
				tooCloseBoids.push(this._boidsData.boidsObjects[i]);
			}
		}
		if (tooCloseBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(tooCloseBoids);
		var force = new Phaser.Math.Vector2(
			this._repelersCachedData.boidsObjects[repeller_index].x - centroid.x, 
			this._repelersCachedData.boidsObjects[repeller_index].y - centroid.y)
		return force.normalize()

    }
	cohesion(boid_index) {
		var closeBoids = [];
		var radius = 80**2;
		let boid_i = boid_index*this._boidsData.poolSize;
		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && 
                this._boidsData.boidCachedDistances[boid_i+i] < radius) {
				closeBoids.push(this._boidsData.boidsObjects[i]);
			}
		}
		if (closeBoids.length == 0) {
			return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(
            centroid.x - this._boidsData.boidsObjects[boid_index].x, 
            centroid.y - this._boidsData.boidsObjects[boid_index].y)
       
		return force.normalize()
	};
	
	
	separation(boid_index) {
		var tooCloseBoids = []
		var radius = 40**2;
		let boid_i = boid_index*this._boidsData.poolSize;
		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && this._boidsData.boidCachedDistances[boid_i+i] < radius) {
				tooCloseBoids.push(this._boidsData.boidsObjects[i]);
			}
		}
		if (tooCloseBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		var centroid = Phaser.Geom.Point.GetCentroid(tooCloseBoids);
		var force = new Phaser.Math.Vector2(
			this._boidsData.boidsObjects[boid_index].x - centroid.x, 
			this._boidsData.boidsObjects[boid_index].y - centroid.y)
		return force.normalize()
	};

    attraction(attractor_index){
        var closeBoids = [],forceX=0,forceY=0;
        const radius = 30**2;
    
        for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._attractorsCachedData.liveObjects[i] 
                && this._attractorsCachedData.boidCachedDistances[attractor_index+i] < radius) {
                closeBoids.push(this._boidsData.boidsObjects[i]);
			}
		}
        if (closeBoids.length == 0) {
            return new Phaser.Math.Vector2(0, 0);
          }
          var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
          var force = new Phaser.Math.Vector2(
              this._attractorsCachedData.boidsObjects[attractor_index].x - centroid.x, 
              this._attractorsCachedData.boidsObjects[attractor_index].y - centroid.y)
          return force.normalize()
    }

	

	seeek_target(boid_index:integer,targetx:number,targety:number){
		let direction = new Phaser.Math.Vector2(targetx,targety);
		let boid_pos = new Phaser.Math.Vector2(
            this._boidsData.boidsObjects[boid_index].x,
            this._boidsData.boidsObjects[boid_index].y);
		direction.subtract(boid_pos);

		return direction.normalize();
	}

    alignement(boid_index) {
		var closeBoids = []
		var radius = 90**2;
		let boid_i = boid_index*this._boidsData.poolSize;

		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && this._boidsData.boidCachedDistances[boid_i+i] < radius) {
				closeBoids.push(this._boidsData.boidsObjects[i].body.velocity);
			}
		}
		if (closeBoids.length == 0) {
		  return new Phaser.Math.Vector2(0, 0);
		}
		//var closeBoidsVelocity = closeBoids.map(function(x) {return x.body.velocity});
		var centroid = Phaser.Geom.Point.GetCentroid(closeBoids);
		var force = new Phaser.Math.Vector2(
			centroid.x - this._boidsData.boidsObjects[boid_index].body.velocity.x, 
			centroid.y - this._boidsData.boidsObjects[boid_index].body.velocity.y);
		return force.normalize();
	};

    makeInactive(boid:Phaser.Physics.Arcade.Sprite) {
        for(let i=0;i<this._boidsData.boidsObjects.length;i++){
            if(boid == this._boidsData.boidsObjects[i]){
                this._boidsData.deactivate(i);
               
            }
        }
	}


    get(x: number, y: number) {
        this._boidsData.collisionGroup.get(x,y);
    }

}