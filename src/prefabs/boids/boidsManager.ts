import { PlayerGroup } from "../player/playerGroup";

export interface IBoidManager{
    init(maxNurBoids:integer):void;
    get(x:number,y:number);
    deactivateBoid(boid:Phaser.Physics.Arcade.Sprite);
    spawn(posx,posy):Phaser.Physics.Arcade.Sprite;
    spawnAttractor(sprite:Phaser.Physics.Arcade.Sprite):void;
    getClosestBoidTo(gameObj:Phaser.GameObjects.GameObject);
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
    timerEvent:Phaser.Time.TimerEvent;
    animationTimeline:Phaser.Tweens.Timeline;

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

    beginSelfDistruct(callback:Function,callbackCtx:any){
    }

    activate(index:integer){
        this.liveObjects[index] = true;
        this.liveObjectsCount ++;
        this.boidsObjects[index].setActive(true);
        this.boidsObjects[index].setVisible(true);
        this.boidsObjects[index].body.enable = true;
        this.boidsObjects[index].body.checkCollision.none = false;
        this.collisionGroup.add(this.boidsObjects[index]);
    }

    deactivate(index:integer){
        this.liveObjects[index] = false;
        this.liveObjectsCount--;
        this.boidsObjects[index].setVelocity(0,0);
        this.boidsObjects[index].setActive(false);
        this.boidsObjects[index].setVisible(false);
        this.boidsObjects[index].body.enable = false
        this.boidsObjects[index].body.checkCollision.none = true;
        
    }
}
export class BoidManager implements IBoidManager{
    _scene:Phaser.Scene
    _boindPoolSize:integer;
    _attackRateInMs:integer = 500;
    _attackRangeSquared:number = 25;
    _boidsData:BoidPoolCacheData;
    _attractorsCachedData:BoidPoolCacheData;
    _repelersCachedData:BoidPoolCacheData;
    _zeroPoint = new Phaser.Geom.Point(0, 0);
    

    constructor(sc:Phaser.Scene){
        this._scene = sc
        this._scene.anims.create({
			key:"bot_move",
			frames: this._scene.anims.generateFrameNumbers('bot',{
				frames:[0,1]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		});
        this._boidsData = new BoidPoolCacheData();
        this._attractorsCachedData = new BoidPoolCacheData();
        this._repelersCachedData = new BoidPoolCacheData();
        

    }
    followSprite(s:Phaser.Physics.Arcade.Sprite){
        this.spawnAttractor(s);
    }
    followPlayer(p:Phaser.GameObjects.Container){
        this.spawnAttractor(p);
    }
    
    spawnAttractor(sprite):void{
        
        let firstInactiveIndex = 0;
        for(let i = 0;i<this._attractorsCachedData.liveObjects.length;i++){
            if(this._attractorsCachedData.liveObjects[i]==false){
                firstInactiveIndex = i;
                break;
            }
        }
        this._attractorsCachedData.boidsObjects.splice(firstInactiveIndex, 0,sprite);
        this._attractorsCachedData.liveObjects[firstInactiveIndex] = true;
        this._attractorsCachedData.liveObjectsCount++;
      
    }

    beginDeactivateBoid(boid: Phaser.Physics.Arcade.Sprite){

    }
    
    deactivateBoid(boid: Phaser.Physics.Arcade.Sprite) {
        this.makeInactive(boid)
        this._boidsData.collisionGroup.remove(boid);
    }
    spawnAtRandom(){
        for(let i = 0;i<10;i++){
            var randomX = Phaser.Math.Between(0, 2*window.innerWidth*devicePixelRatio - 1);
		    var randomY = Phaser.Math.Between(0, 2*window.innerHeight*devicePixelRatio - 1);
            this.spawn(randomX,randomY)
        }
    }
    spawn(posx: any, posy: any): Phaser.Physics.Arcade.Sprite {
        if(this._boidsData.liveObjectsCount == this._boidsData.poolSize){
            return;
        }
        let firstInactiveIndex = 0;
        for(let i = 0;i<this._boidsData.liveObjectsCount;i++){
            if(this._boidsData.liveObjects[i]==false){
                firstInactiveIndex = i;
                break;
            }
        }
        this._boidsData.boidsObjects[firstInactiveIndex].x = posx
        this._boidsData.boidsObjects[firstInactiveIndex].y = posy
        this._boidsData.activate(firstInactiveIndex)
        return this._boidsData.boidsObjects[firstInactiveIndex];
      
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
    
    beginSelfDistruct(boid:Phaser.Physics.Arcade.Sprite){
        
        boid.setVelocity(0,0)
        boid.setMaxVelocity(0,0);
        
        let timeline = this._scene.tweens.createTimeline();
        timeline.add({
            targets: boid,
            tint: 0xFFFFFF,
            ease: 'Power1',
            duration: 500,
            onUpdate:()=>{   
            }
        });
        timeline.play();

    }
    selfDistructCompleted(){
        
    }

    setupCollisionWith(targetGroup:PlayerGroup){
        this._scene.physics.add.collider(this._boidsData.collisionGroup,targetGroup,(player,boid)=>{

            this.beginSelfDistruct(boid as Phaser.Physics.Arcade.Sprite);
        });
    }
    getClosestBoidTo(playerObject:Phaser.GameObjects.GameObject){
        return this._scene.physics.closest(playerObject,this._boidsData.collisionGroup.getChildren());
    }
    update(){
        //compute distances between all boids
        this._boidsData.collisionGroup.off
        for(let i =0;i<this._boidsData.poolSize;i++){
			for(let j=0;j<i;j++){
                if(this._boidsData.liveObjects[i] == true 
                    && this._boidsData.liveObjects[j]==true){
				    let dist = 
                    Phaser.Math.Distance.BetweenPointsSquared(
                        this._boidsData.boidsObjects[i], 
                        this._boidsData.boidsObjects[j]);
                    
                    this._boidsData.boidCachedDistances[i*this._boidsData.poolSize+j] = dist
                    this._boidsData.boidCachedDistances[j*this._boidsData.poolSize+i] = dist
                }
			}
		}
             
        // compute distance between boids and list of attractors 
        if(this._attractorsCachedData.shouldProcesBoidData()){
            for(let i=0;i<this._attractorsCachedData.poolSize;i++){
                if (this._attractorsCachedData.liveObjects[i]){
                    for(let j=0;j<this._boidsData.poolSize;j++){
                        this._attractorsCachedData.boidCachedDistances[i*this._boidsData.poolSize+j] = 
                        Phaser.Math.Distance.BetweenPointsSquared(
                            this._attractorsCachedData.boidsObjects[i], 
                            this._boidsData.boidsObjects[j]);
                    }
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
            
			var [f1x,f1y] = this.cohesion_f(i);
			var [f2x,f2y] = this.separation_f(i);
			var [f3x,f3y] = this.alignement_f(i);            
			var [f4x,f4y] = this.seek_targets_f(i);
            

			var coef1 = 1;
			var coef2 = 1;
			var coef3 = 1;
            var coef4 = 10;
           
            
			var newAcc = new Phaser.Math.Vector2(
				coef1*f1x + coef2*f2x + coef3*f3x + coef4*f4x, 
				 coef1*f1y + coef2*f2y + coef3*f3y +coef4*f4y);
			newAcc.normalize();
			var newVelocity = new Phaser.Math.Vector2(boid.body.velocity.x + newAcc.x, boid.body.velocity.y + newAcc.y);
			boid.setVelocity(newVelocity.x, newVelocity.y);		
			//turn in the right direction
            let angle = this.computeAngle(newVelocity)
        
            if (Math.abs(angle) >= 90){
                boid.setFlipX(false);
                
            }else{
                boid.setFlipX(true);
            }
		}
    }
    
    init(maxNurBoids?: integer): void {
        
        this._boidsData.init(maxNurBoids,maxNurBoids**2,maxNurBoids);
        this._boidsData.collisionGroup = this._scene.physics.add.group();
 
        for(var i = 0; i < maxNurBoids; i++){
			var randomX = Phaser.Math.Between(0, window.innerWidth*devicePixelRatio - 1);
			var randomY = Phaser.Math.Between(0, window.innerHeight*devicePixelRatio - 1);
			let boid = this._scene.physics.add.sprite(randomX, randomY, 'bot');
            boid.setScale(1+1/devicePixelRatio);
            boid.name = i.toString();
			boid.setVelocity(randomX*0.001, randomY*0.001);
			boid.play('bot_move');
			this._boidsData.collisionGroup.add(boid);
			// Physics
			this._scene.physics.world.enable(boid);
            boid.setMaxVelocity(50,50);
			boid.setBounce(0.1,0.1);
            this._boidsData.boidsObjects.push(boid);
		}
		this._scene.physics.add.collider(this._boidsData.collisionGroup,this._boidsData.collisionGroup);  
        this._boidsData.timerEvent = this._scene.time.addEvent({
          delay:1000,
          loop:true,
          callback:this.spawnAtRandom,
          callbackScope:this  
        })
    }   

    initAttractors(maxNrAttractors:integer,boidPoolCount:integer){
        this._attractorsCachedData.init(maxNrAttractors,maxNrAttractors*boidPoolCount,0);
    }
    initRepelers(maxNrRepelers:integer,boidPoolCount:integer){
        this._attractorsCachedData.init(maxNrRepelers,maxNrRepelers*boidPoolCount,0);
    }

    computeAngle(velocity) {
		var angleRad = Phaser.Math.Angle.BetweenPoints(this._zeroPoint, velocity);
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
	 
	cohesion_f(boid_index) {
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
			return [0,0];
		}
        var force = Phaser.Geom.Point.GetCentroid(closeBoids);
        force.x=force.x-this._boidsData.boidsObjects[boid_index].x;
        force.y=force.y-this._boidsData.boidsObjects[boid_index].y;
        
        let len = Math.hypot(force.x,force.y);
        if (len == 0) return [0,0];
        return [force.x/len,force.y/len];
	};

	separation_f(boid_index) {
		var tooCloseBoids = []
		var radius = 40**2;
		let boid_i = boid_index*this._boidsData.poolSize;
		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && this._boidsData.boidCachedDistances[boid_i+i] < radius) {
				tooCloseBoids.push(this._boidsData.boidsObjects[i]);
			}
		}
		if (tooCloseBoids.length == 0) {
            return [0,0];
        }
        var force = Phaser.Geom.Point.GetCentroid(tooCloseBoids);
        force.x=this._boidsData.boidsObjects[boid_index].x-force.x;
        force.y=this._boidsData.boidsObjects[boid_index].y-force.y;
        let len = Math.hypot(force.x,force.y);
        if (len == 0) return [0,0];
        return [force.x/len,force.y/len];
	};
	 

    seek_targets_f(boid_index){
        var close_targets = []
        const radius = 3000**2;
        
        for (let i = 0;i<this._attractorsCachedData.poolSize;i++) {
			if (this._attractorsCachedData.liveObjects[i] 
                && this._attractorsCachedData.boidCachedDistances[i*this._boidsData.poolSize+ boid_index] < radius) {
                    close_targets.push(this._attractorsCachedData.boidsObjects[i]);
			}
		}
        if (close_targets.length == 0) {
            return [0,0];
        }
        var force = Phaser.Geom.Point.GetCentroid(close_targets);
        force.x=force.x-this._boidsData.boidsObjects[boid_index].x;
        force.y=force.y-this._boidsData.boidsObjects[boid_index].y;
        let len = Math.hypot(force.x,force.y);
        return [force.x/len,force.y/len];
    }

    seek_targets(boid_index){
        var close_targets = []
        const radius = 3000**2;
        
        for (let i = 0;i<this._attractorsCachedData.poolSize;i++) {
			if (this._attractorsCachedData.liveObjects[i] 
                && this._attractorsCachedData.boidCachedDistances[i*this._boidsData.poolSize+ boid_index] < radius) {
                    close_targets.push(this._attractorsCachedData.boidsObjects[i]);
			}
		}
        if (close_targets.length == 0) {
            return new Phaser.Math.Vector2(0, 0);
        }
        var targets_centroid = Phaser.Geom.Point.GetCentroid(close_targets);
        var force = new Phaser.Math.Vector2(
              this._boidsData.boidsObjects[boid_index].x - targets_centroid.x, 
              this._boidsData.boidsObjects[boid_index].y - targets_centroid.y)
         
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

     

    alignement_f(boid_index) {
		var closeBoids = []
		var radius = 90**2;
		let boid_i = boid_index*this._boidsData.poolSize;

		for (let i = 0;i<this._boidsData.poolSize;i++) {
			if (this._boidsData.liveObjects[i] && this._boidsData.boidCachedDistances[boid_i+i] < radius) {
				closeBoids.push(this._boidsData.boidsObjects[i].body.velocity);
			}
		}
		var force = Phaser.Geom.Point.GetCentroid(closeBoids);
        force.x=force.x-this._boidsData.boidsObjects[boid_index].x;
        force.y=force.y-this._boidsData.boidsObjects[boid_index].y;
        let len = Math.hypot(force.x,force.y);
        return [force.x/len,force.y/len];
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