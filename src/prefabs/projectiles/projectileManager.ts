import { IBoidManager } from "../boids/boidsManager";


export interface IProjectileManager{
    setupCollisionWithEnemeis(boidManager:IBoidManager):void;
    spawn(spawnPosx,spawnPosY,directionX,directionY):void;
}
export interface projectileInfo{
    velocity:number,
    isHoming:boolean
    texture:string
}

interface ProjectileTrajectory{
    color:number;
    lifetime:integer;
    coord:Phaser.Geom.Line;
}
interface ProjectileLandingArea{
    color:number;
    coord:Phaser.Geom.Circle;
    lifetime:integer;
}


export class ProjectileManager implements IProjectileManager{
    _scene:Phaser.Scene;
    _collisionGroup:Phaser.Physics.Arcade.Group;
    _explosionGroup:Phaser.GameObjects.Group;
    _projectilesTrajectoryGraphics:Phaser.GameObjects.Graphics;
    _projectilesTrajectoryObjects:Array<ProjectileTrajectory> = []

        
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._collisionGroup = sc.physics.add.group() as Phaser.Physics.Arcade.Group;
        this._projectilesTrajectoryGraphics = sc.add.graphics();

        const config2 = {
            key: 'explode_projectile',
            frames: 'boom',
            frameRate: 30,
            repeat: 0,
 			duration:100
        };
        this._explosionGroup = this._scene.add.group({
            defaultKey:"explode_projectile",
            classType:Phaser.GameObjects.Sprite,maxSize:-1,
        })
        this._explosionGroup.createMultiple({key:"explode_projectile",quantity:10,visible:false,active:false})
		this._scene.anims.create(config2)
    }

    setupCollisionWithEnemeis(boidManager:IBoidManager){
        this._scene.physics.add.overlap(this._collisionGroup,boidManager.getBoidCollisionGroup(),(obj,obj2)=>{
            // to instantiate an explosion
            boidManager.deactivateBoid(obj2 as Phaser.Physics.Arcade.Sprite)
            let explosion = this._explosionGroup.get(obj2.body.x,obj2.body.y) as Phaser.GameObjects.Sprite;
             
            explosion.setActive(true).setVisible(true).play('explode_projectile')
            .on('animationcomplete', ()=>{
                this._explosionGroup!.killAndHide(explosion);
                explosion.setActive(false).setVisible(false);
            },this);
             obj.destroy();
        });
    }
    
    spawnEnemyProjectiles(){

    }

    spawnAreaEffectProjectile(textue:string,targetx:number,targety:number){

    }
    spawnHomingWithTexture(texture:string,target:Phaser.Physics.Arcade.Sprite){
        
    }
    spawn(spawnPosx,spawnPosY,directionX,directionY){
        let bullet = this._scene.physics.add.sprite(spawnPosx,spawnPosY,'bullet')
        this._collisionGroup.add(bullet);
        bullet.setVelocity(directionX,directionY);
    }

    update(){
        
    }
}
