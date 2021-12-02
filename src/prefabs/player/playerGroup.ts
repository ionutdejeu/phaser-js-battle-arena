import { IProjectileManager, ProjectileEvents } from '../projectiles/projectileManager'
import { PlayerAttackStats, PlayerBodyStats, PlayerDefenceStats } from './stats'
 
export interface IPlayer{
    getX();
    getY();
}
export class PlayerGroup extends Phaser.GameObjects.Container implements IPlayer{
    
    relative_coordinates:Array<Phaser.Math.Vector2> 
     
    arcadePhysicsBody:Phaser.Physics.Arcade.Body;
    shootingRange:integer=200;
    speed:integer=160;
    shootingAreaBody:Phaser.Physics.Arcade.Body;
    shootZone:Phaser.GameObjects.Zone;
    shootRange:Phaser.Physics.Arcade.Image;
    graphics:Phaser.GameObjects.Graphics;
    graphicsTargetLine:Phaser.Geom.Line;
    private tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
    private tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
    bodyStats: PlayerBodyStats;
    defenceStats: PlayerDefenceStats;
    attackStats:PlayerAttackStats;
    targetX:number
    targetY:number
    shootTimer:Phaser.Time.TimerEvent;
    _projManager:IProjectileManager;
    _playerSprite:Phaser.GameObjects.Sprite;
    _crossHairSprite:Phaser.GameObjects.Sprite;
    
    animation_state:string = 'player_idle'
    _parabolicShootTimer:Phaser.Time.TimerEvent;
    
    
    constructor(scene: Phaser.Scene, x: number, y: number,projManager:IProjectileManager)
	{  
        super(scene,x,y)
        this._projManager = projManager;
        this.relative_coordinates = [];
      
        this.name = 'player';
        this.scene.anims.create({
			key:"player_idle",
			frames: this.scene.anims.generateFrameNumbers('player_sprites',{
				frames:[0,1]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		})
		this.scene.anims.create({
			key:"player_hit",
			frames: this.scene.anims.generateFrameNumbers('player_sprites',{
				frames:[1,2]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		})
		this.scene.anims.create({
			key:"player_walk",
			frames: this.scene.anims.generateFrameNumbers('player_sprites',{
				frames:[3,4]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		})
        this.scene.anims.create({
			key:"cross_hair_anim",
			frames: this.scene.anims.generateFrameNumbers('cross_hair',{
				frames:[0,1]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		})
        this.graphics = scene.add.graphics({
            x:0,
            y:0
        });
        this.graphics.lineStyle(2, 0x00ff00);
        this.add(this.graphics);
        this.graphicsTargetLine = new Phaser.Geom.Line(this.x,this.y,0,0);
         
        scene.physics.world.enable(this);
         
        let shootRangeRadius = 200;
        this.shootRange = scene.physics.add.image(0,0,null);
        
        this.shootRange.setVisible(false);
        scene.physics.world.enable(this.shootRange);
        this.add(this.shootRange);

        this._playerSprite = this.scene.add.sprite(0,0,'player_sprites',0);
        this._playerSprite.setOrigin(0,0);
        this._playerSprite.setScale(5);
        this._playerSprite.play('player_hit');
        this.add(this._playerSprite);
        
        this._crossHairSprite = this.scene.add.sprite(0,0,'player_sprites',0);
        this._crossHairSprite.setVisible(false);
        this._crossHairSprite.setScale(3);
        
        this.add(this._crossHairSprite);
        
        this.arcadePhysicsBody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadePhysicsBody.setCircle(this._playerSprite.displayWidth/2,0,0);
        this.shootRange.setCircle(shootRangeRadius,-shootRangeRadius/2-this._playerSprite.displayWidth/2,-shootRangeRadius/2-this._playerSprite.displayWidth/2);    


        scene.add.existing(this);
        this.getWorldTransformMatrix(this.tempMatrix, this.tempParentMatrix);
        this.initPlayerStats();
        this.startShootingTimers();
        
        
    }
    startShootingTimers(){
        this.shootTimer.paused=false;
        
    }
    initPlayerStats(body?:PlayerBodyStats,attackStats?:PlayerAttackStats){
        if(body !==undefined){
            this.bodyStats = body;
        }else{
            this.bodyStats = {
                health:100,
                speed:20
            }
        }
        if(attackStats !== undefined){
            this.attackStats = attackStats
        }else{
            this.attackStats = new PlayerAttackStats();
            this.attackStats.attackSpeed = 200;
            
        }
        if(this.shootTimer!==undefined){
            this.scene.time.removeEvent(this.shootTimer);
        } 
        this.shootTimer = this.scene.time.addEvent({
            loop:true,
            callback:this.shootProjectile,
            callbackScope:this,
            paused:true,
            delay:this.attackStats.attackSpeed,
        });
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    
    shootProjectile(){
        let dirx = (this.x - this.targetX);
        let diry = (this.y - this.targetY);
        let dir = new Phaser.Math.Vector2(dirx,diry).normalize().scale(-this.attackStats.attackProjectileSpeed);
        console.log('shoot');
        this.scene.game.events.emit(ProjectileEvents.SPAWN_BULLET,this.x,this.y,dir.x,dir.y);
    }
    transition_animation(animation_key:string){
        if(this.animation_state!=animation_key){
            this._playerSprite.play(animation_key)
            this.animation_state = animation_key
        }
    }
    update_collisions(){
        
    }

    
    update_virtual(direction:Phaser.Math.Vector2){
		if (direction.lengthSq()>0){
            
            this.arcadePhysicsBody.setVelocity(direction.x*this.speed,direction.y*this.speed);
            this.transition_animation('player_walk')
            
        }
        else{
            this.arcadePhysicsBody.setVelocity(0,0);
            this.transition_animation('player_idle')
        }
        
        let angle = this.computeAngle(direction)
        
        if (Math.abs(angle) >= 90){
            this._playerSprite.setFlipX(false);
             
        }else{
            this._playerSprite.setFlipX(true);

        }
	}

    computeAngle(velocity) {
		var zeroPoint = new Phaser.Geom.Point(0, 0);
		var angleRad = Phaser.Math.Angle.BetweenPoints(zeroPoint, velocity);
		return Phaser.Math.RadToDeg(angleRad);
	};
    targetObject(gameObj:Phaser.GameObjects.GameObject){
        this.drawTargetLine(gameObj.body.position.x,gameObj.body.position.y);
    }



    drawTargetLine(x,y){
        this.graphics.clear();
        this.targetX = x
        this.targetY = y
        this._crossHairSprite.setVisible(true);
        this._crossHairSprite.x = this.targetX;
        this._crossHairSprite.y = this.targetY;
        
        this._crossHairSprite.play('cross_hair_anim',true);
        
        let invToPos = this.tempMatrix.applyInverse(x,y);
        let invFromPos = this.tempParentMatrix.applyInverse(this.x,this.y);

        this.graphicsTargetLine.setTo(this.x,this.y,invToPos.x,invToPos.y);
        this.graphics.strokeLineShape(this.graphicsTargetLine);
    }

    
}
