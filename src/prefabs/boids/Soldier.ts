import { Observable, Subject } from 'rxjs'
import { IPorjectileManager } from '../projectiles/projectileManager'
import { PlayerAttackStats, PlayerBodyStats, PlayerDefenceStats } from '../player/stats'

const formation = { 
    gridW:4,
    gridH:4,
    distanceBetweenSoldiers:30,
    rotation:60
}

export interface ExecutableBehavior{
    update()
}
export class DamageableBehavior{
    health:Number
    onHealthChanged:Subject<Number> = new Subject()

    constructor(){ 
        
    }
}

export class ControllableGroup extends Phaser.GameObjects.Container{
    
    relative_coordinates:Array<Phaser.Math.Vector2> 
    groupCenter:Phaser.Math.Vector2
    controllableEntities:Array<ControllableEntity>;
    nrOfControllableEntities:integer;
    collisionGroup:Phaser.Physics.Arcade.Group;
    formationContainer:Phaser.GameObjects.Container;
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
    _projManager:IPorjectileManager;


    constructor(scene: Phaser.Scene, x: number, y: number,projManager:IPorjectileManager)
	{  
        super(scene,x,y)
        this._projManager = projManager;
        this.relative_coordinates = [];
        this.controllableEntities = [];
        this.collisionGroup = scene.physics.add.group({
			bounceX:1,
			bounceY:1,collideWorldBounds:true,
		});

        let formH = (formation.gridH-1)*30;
        let formW = (formation.gridW-1)*30;
        this.groupCenter = new Phaser.Math.Vector2(0,0)

      
           
        this.graphics = scene.add.graphics({
            x:0,
            y:0
        });
        this.graphics.lineStyle(2, 0x00ff00);
        this.add(this.graphics);
        this.graphicsTargetLine = new Phaser.Geom.Line(this.x,this.y,0,0);
        this.nrOfControllableEntities = this.controllableEntities.length;
        
        scene.physics.world.enable(this);
         
        let shootRangeRadius = 200;
        this.shootRange = scene.physics.add.image(0,0,null);
        this.shootRange.setVisible(false);
        scene.physics.world.enable(this.shootRange);
        this.add(this.shootRange);
        this.shootRange.setCircle(shootRangeRadius,0,0);    

        const soldier_animated = this.scene.add.sprite(0,0,'player_sprites',0);
        soldier_animated.setOrigin(0,0);
        soldier_animated.setScale(6);
        soldier_animated.play('player_hit');
        this.add(soldier_animated);
    
        this.arcadePhysicsBody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadePhysicsBody.setCircle(formH/2,0,0);

        scene.add.existing(this);
        this.getWorldTransformMatrix(this.tempMatrix, this.tempParentMatrix);
        this.attackStats = new PlayerAttackStats();
        this.attackStats.attackSpeed = 200;
        this.shootTimer = this.scene.time.addEvent({
            loop:true,
            callback:this.shootProjectile,
            callbackScope:this,
            delay:this.attackStats.attackSpeed,
        });
        
        
    }
    
    shootProjectile(){
        let dirx = (this.x - this.targetX);
        let diry = (this.y - this.targetY);
        let dir = new Phaser.Math.Vector2(dirx,diry).normalize().scale(-this.attackStats.attackProjectileSpeed);
        this._projManager.spawn(this.x,this.y,dir.x,dir.y);
    }
    update_virtual(direction:Phaser.Math.Vector2){
		if (direction.lengthSq()>0){
            
            this.arcadePhysicsBody.setVelocity(direction.x*this.speed,direction.y*this.speed);
            
        }
        else{
            this.arcadePhysicsBody.setVelocity(0,0);
        }
        
        let angle = this.computeAngle(direction)
        
        if (Math.abs(angle) >= 90){
            for(let i=0;i<this.nrOfControllableEntities;i++){
                this.controllableEntities[i].setFlipX(true);
            }
        }else{
            for(let i=0;i<this.nrOfControllableEntities;i++){
                this.controllableEntities[i].setFlipX(false);
            }
        }
	}

    computeAngle(velocity) {
		var zeroPoint = new Phaser.Geom.Point(0, 0);
		var angleRad = Phaser.Math.Angle.BetweenPoints(zeroPoint, velocity);
		return Phaser.Math.RadToDeg(angleRad);
	};

    draw_target_line(x,y,updateObservable:Observable<void>){
        this.graphics.clear();
        this.targetX = x
        this.targetY = y
        let invToPos = this.tempMatrix.applyInverse(x,y);
        let invFromPos = this.tempParentMatrix.applyInverse(this.x,this.y);

        this.graphicsTargetLine.setTo(invFromPos.x,invFromPos.y,invToPos.x,invToPos.y);
        this.graphics.strokeLineShape(this.graphicsTargetLine);
        
    }
}
export class ControllableEntity extends Phaser.GameObjects.Sprite{ 

    onGroupDirectionChanged:Subject<Phaser.Math.Vector2> = new Subject();
    speed:number;
    constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		key: string,
		frame: number
	) {
		super(scene, x, y, key, frame);
		this.scene = scene;
		this.speed = 160;		 
    }
    
}