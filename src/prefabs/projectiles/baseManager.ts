import { BaseProjectile } from "./baseProjectile";


export class BaseProjectileManager <T extends BaseProjectile>{
    _scene:Phaser.Scene
    _projectileGroup:Phaser.GameObjects.Group | Phaser.Physics.Arcade.Group
    _explosionGroup:Phaser.GameObjects.Group | Phaser.Physics.Arcade.Group
    _eventEmitter:Phaser.Events.EventEmitter;
    
    constructor(sc:Phaser.Scene){
        this._scene = sc;
    }

    withPhysicsProjectile(projectileKey:string){
        return this;
    }

    withSprieProjectile(spiteKey:string){
        return this;
    }

    withPhysicsExplosion(spriteKey:string){
        return this;
    }

    withSpriteExplosion(spriteKey:string){
        return this;
    }

    withStaticPhysicsExplosion(spriteKey:string){
        return this;
    }

    

}