import { IBoidManager } from "../boids/boidsManager";


export interface IProjectileManager{
    setupCollisionWithEnemeis(boidManager:IBoidManager):void;
    spawn(spawnPosx,spawnPosY,directionX,directionY):void;
}

export class ProjectileManager implements IProjectileManager{
    _scene:Phaser.Scene;
    _collisionGroup:Phaser.Physics.Arcade.Group;
    _explosionGroup:Phaser.GameObjects.Group;

    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._collisionGroup = sc.physics.add.group() as Phaser.Physics.Arcade.Group;
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
            console.log(explosion);
            explosion.setActive(true).setVisible(true).play('explode_projectile')
            .on('animationcomplete', ()=>{
                this._explosionGroup!.killAndHide(explosion);
                explosion.setActive(false).setVisible(false);
            },this);
            console.log(this._explosionGroup.children);
            obj.destroy();
        });
    }
    
     
     
    spawn(spawnPosx,spawnPosY,directionX,directionY){
        let bullet = this._scene.physics.add.sprite(spawnPosx,spawnPosY,'bullet')
        this._collisionGroup.add(bullet);
        bullet.setVelocity(directionX,directionY);
    }
}
