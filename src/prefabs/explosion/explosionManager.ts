import { IDamigingEntity } from "../damage/damageManager";

export const ExplosionTypes = {
    GENERIC:"generic_explosion"
}

export const ExplosionEvents = {
    SPAWN_EXPLOSION:"SPAWN_EXPLOSION",
}

export interface IExplosionType{
    durationInMs:number,
    name:string
}

export interface IExplosion {
    type:string,
    x:number,
    y:number,
    callback?:Function
    callbackCtx?:any,
    damage?:IDamigingEntity
}

export interface IExplosionManager { 
    
}


export class ExplosionManager implements IExplosionManager {
    _scene:Phaser.Scene;
    _collsionGroup:Phaser.Physics.Arcade.StaticGroup;
    _explosionTypes:Map<string,IExplosionType> = new Map();
    
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        const config2 = {
            key: ExplosionTypes.GENERIC,
            frames: 'boom',
            frameRate: 30,
            repeat: -1,
 			duration:100
        };
        this._scene.anims.create(config2)
        this._explosionTypes.set(ExplosionTypes.GENERIC,{name:"dwa",durationInMs:5000});

        this._collsionGroup = this._scene.physics.add.staticGroup({});
        this._scene.game.events.addListener(ExplosionEvents.SPAWN_EXPLOSION,(expl)=>{
            let e = expl as IExplosion;
            let type = this._explosionTypes.get(e.type); 
            this.spawnExplosion(type,e);
        });
    }

    spawnExplosion(type:IExplosionType,expl:IExplosion){
        let sprite = this._collsionGroup.create(expl.x,expl.y,type.name) as Phaser.Physics.Arcade.Sprite;
        sprite.setTint(0xFF0000,0xFF0000,0xFF0000,0xFF0000);
        sprite.setScale(1.2,1.2);
        let counter = this._scene.tweens.addCounter({
            duration:type.durationInMs,
            paused:true,
            onUpdate:this.explosionUpdate,
            onUpdateScope:this,
            onComplete:()=>{
                this.explosionComplete(expl,sprite);
                this._scene.tweens.remove(counter);
            }
        });
        counter.play();
        sprite.play(ExplosionTypes.GENERIC)

    }
    explosionUpdate(pram:any){
        
    }

    explosionComplete(e:IExplosion,sprite:Phaser.Physics.Arcade.Sprite){
        if(e.callback !== undefined){
            e.callback.call(e.callbackCtx);
        }
        sprite.stop();
        sprite.destroy();
        console.log('stoped anim')
    }

    convertExplosionToDamage(){

    }

}
