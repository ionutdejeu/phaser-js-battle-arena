

export interface IPorjectileManager{
    setupCollisionWithEnemeis(enemyGroup:Phaser.Physics.Arcade.Group):void;
    spawn(spawnPosx,spawnPosY,directionX,directionY):void;
}

export class ProjectileManager implements IPorjectileManager{
    _scene:Phaser.Scene;
    _collisionGroup:Phaser.Physics.Arcade.Group;

    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._collisionGroup = sc.physics.add.group() as Phaser.Physics.Arcade.Group;
    }

    setupCollisionWithEnemeis(enemyGroup:Phaser.Physics.Arcade.Group){
        this._scene.physics.add.collider(this._collisionGroup,enemyGroup,(obj,obj2)=>{
            console.log(obj,obj2);
        });
    }
    spawn(spawnPosx,spawnPosY,directionX,directionY){
        let bullet = this._scene.physics.add.sprite(spawnPosx,spawnPosY,'bullet')
        this._collisionGroup.add(bullet);
        bullet.setVelocity(directionX,directionY);
    }
}
