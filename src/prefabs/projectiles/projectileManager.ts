import { IBoidManager } from "../boids/boidsManager";
import { ExplosionEvents, ExplosionTypes, IExplosion } from "../explosion/explosionManager";
import { BaseObjectPool, BaseProjectile} from "./baseProjectile";
import { SimpleBallisticProjectile, SustainedExplosion } from "./prarabolicProjectile";

export const ProjectileEvents = {
    SPAWN_BULLET:"SPAWN_BULLET",
    SPAWN_PARABOLIC_PROJECTILE:"SPAWN_PARABOLIC_PROJECTILE"
}
export interface IProjectileManager{
    setupCollisionWithEnemeis(boidManager:IBoidManager):void;
    spawn(spawnPosx,spawnPosY,directionX,directionY):void;
}

export class ProjectileManager implements IProjectileManager{
    _scene:Phaser.Scene;
    _collisionGroup:Phaser.Physics.Arcade.Group;
    _explosionGroup:Phaser.GameObjects.Group;
    _sustainedExplosionsCollisionGroup:Phaser.Physics.Arcade.Group;
    _parabolicProjectilePool:BaseObjectPool<BaseProjectile>
    _parabolicProjectileCollisionGroup:Phaser.Physics.Arcade.StaticGroup
    _sustainedExplosionPool:BaseObjectPool<BaseProjectile>;
    _projectilesTrajectoryGraphics:Phaser.GameObjects.Graphics;
    _homingProjectileGroup:Phaser.GameObjects.Group;
        
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._collisionGroup = sc.physics.add.group() as Phaser.Physics.Arcade.Group;
        this._projectilesTrajectoryGraphics = sc.add.graphics();
        

        const config = {
            key: 'explode_projectile',
            frames: 'boom',
            frameRate: 30,
            repeat: 0,
 			duration:100
        };

        const config2 = {
            key: 'sustained_explision_projectile',
            frames: 'boom',
            frameRate: 30,
            repeat: -1,
 			duration:100
        };
        
        this._explosionGroup = this._scene.add.group({
            defaultKey:"explode_projectile",
            classType:Phaser.GameObjects.Sprite,maxSize:-1,
        })
        

        this._homingProjectileGroup = this._scene.physics.add.group({
            defaultKey:"bullet",
            classType:Phaser.GameObjects.Sprite,maxSize:-1,
        })

        this._sustainedExplosionsCollisionGroup = this._scene.physics.add.group({
            defaultKey:"sustained_explision_projectile",
            classType:Phaser.GameObjects.Sprite,maxSize:-1,
        })

        this._parabolicProjectileCollisionGroup = this._scene.physics.add.staticGroup({
            defaultKey:"explode_projectile",
            classType:Phaser.GameObjects.Sprite,maxSize:-1,
        })

        this._explosionGroup.createMultiple({key:"explode_projectile",quantity:10,visible:false,active:false})
        this._parabolicProjectileCollisionGroup.createMultiple({key:"explode_projectile",quantity:10,visible:false,active:false})
		this._scene.anims.create(config)
        this._scene.anims.create(config2)
        
        this._scene.game.events.on(ProjectileEvents.SPAWN_BULLET,(posX:number,posY:number,dirX:number,dirY:number)=>{
            this.spawn(posX,posY,dirX,dirY);
        },this);
        this._scene.game.events.on(ProjectileEvents.SPAWN_PARABOLIC_PROJECTILE,(posX:number,posY:number,targetX:number,targetY:number)=>{
            this.spawnParabolicProjectile(posX,posY,targetX,targetY);
        },this);

        let objects = [],
        sustained_explosion = [];
        
        for(let i=0;i<100;i++){
            sustained_explosion.push(new SustainedExplosion(
                this._parabolicProjectileCollisionGroup,
                this.parabolicExplosionHandler)
            );
            objects.push(new SimpleBallisticProjectile(
                this._parabolicProjectileCollisionGroup,
                this.parabolicProjectileLandedHandle,
                this)
            );
        }
        this._sustainedExplosionPool = new BaseObjectPool<BaseProjectile>(sustained_explosion);
        this._parabolicProjectilePool = new BaseObjectPool<BaseProjectile>(objects);    
    }

    parabolicProjectileLandedHandle(projectile: BaseProjectile){
       //let expl=this._sustainedExplosionPool.getGameObject();
       //expl.reset({originX:projectile.getX(),originY:projectile.getY()});
       this._parabolicProjectilePool.returnGameObject(projectile);
       let explosion: IExplosion = {
           type:ExplosionTypes.GENERIC,
           x:projectile.getX(),
           y:projectile.getY(),damage:{
               damage:100
           },callback:()=>{
                console.log("Explosion completed");
           }
       }
       this._scene.game.events.emit(ExplosionEvents.SPAWN_EXPLOSION,explosion)
    }
    
    parabolicExplosionHandler(exp:BaseProjectile){
        this._sustainedExplosionPool.returnGameObject(exp);
    }

    homingProjectileExplosionHandler(proj:BaseProjectile){

    }
    spawnParabolicProjectile(posX:number,posY:number,targetX:number,targetY:number){
        let parabilicProjectile = this._parabolicProjectilePool.getGameObject();
        parabilicProjectile.reset({originX:posX,
            originY:posY,
            absolutePosX:targetX,
            absolutePosY:targetY});
    }
    setupCollisionWithEnemeis(boidManager:IBoidManager){
        this._scene.physics.add.overlap(this._collisionGroup,boidManager.getBoidCollisionGroup(),(obj,obj2)=>{
            // to instantiate an explosion
            boidManager.deactivateBoid(obj2 as Phaser.Physics.Arcade.Sprite)
             
            let expl:IExplosion = {
                type:ExplosionTypes.STANDARD_EXPLOSION,
                x:obj2.body.x,
                y:obj2.body.y,
                damage:{
                    damage:2
                }
            }
            this._scene.game.events.emit(ExplosionEvents.SPAWN_EXPLOSION,expl);
            obj.destroy();
        });
    }
    
    spawnEnemyProjectiles(){

    }

    spawnAreaEffectProjectile(textue:string,targetx:number,targety:number){
        
    }

    spawnHomingWithTexture(texture:string,target:Phaser.Physics.Arcade.Sprite){
        
    }
    spawn(spawnPosX,spawnPosY,directionX,directionY){
        let bullet = this._scene.physics.add.sprite(spawnPosX,spawnPosY,'bullet')
        this._collisionGroup.add(bullet);
        bullet.setVelocity(directionX,directionY);
        
    }

    update(){
        this._projectilesTrajectoryGraphics.clear();
        this._parabolicProjectilePool.drawActiveObjects(this._projectilesTrajectoryGraphics);
    }
}
