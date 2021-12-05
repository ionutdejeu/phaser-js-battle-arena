import { DamageEvents, IDamigingEntity } from "../damage/damageManager";

export const ExplosionTypes = {
    GENERIC:"generic_explosion",
    STANDARD_EXPLOSION:"STANDARD_EXPLOSION"
}

export const ExplosionEvents = {
    SPAWN_EXPLOSION:"SPAWN_EXPLOSION",
}
 

export interface IExplosionType{
    durationInMs:number,
    name:string,
    splashDamage:boolean
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
        this._explosionTypes.set(ExplosionTypes.GENERIC,{name:"dwa",splashDamage:true,durationInMs:5000});

        const config_classic_expl =  {
            key: ExplosionTypes.GENERIC,
            frames: 'boom',
            frameRate: 30,
            repeat: -1,
 			duration:100
        };
        this._explosionTypes.set(ExplosionTypes.STANDARD_EXPLOSION,{name:"dwa",splashDamage:false,durationInMs:100});


        this._collsionGroup = this._scene.physics.add.staticGroup({});
        this._scene.game.events.addListener(ExplosionEvents.SPAWN_EXPLOSION,(expl)=>{
            let e = expl as IExplosion;
            let type = this._explosionTypes.get(e.type); 
            this.spawnExplosion(type,e);
        });
        
    }

    spawnExplosion(type:IExplosionType,expl:IExplosion){
        let sprite = this._collsionGroup.create(expl.x,expl.y,type.name) as Phaser.Physics.Arcade.Sprite;
        if(type.splashDamage){
            this.convertExplosionToDamage(type,expl,sprite);
        }
        sprite.setTint(0xFF0000,0xFF0000,0xFF0000,0xFF0000);
        sprite.setScale(1.2,1.2);
        let counter = this._scene.tweens.addCounter({
            duration:type.durationInMs,
            paused:true,
            onUpdate:this.explosionUpdate,
            onUpdateScope:this,
            onComplete:()=>{
                this.explosionComplete(type,expl,sprite);
                this._scene.tweens.remove(counter);
            }
        });
        
        counter.play();
        sprite.play(ExplosionTypes.GENERIC)
    }
    explosionUpdate(pram:any){

    }

    explosionComplete(t:IExplosionType, e:IExplosion,sprite:Phaser.Physics.Arcade.Sprite){
        if(e.callback !== undefined){
            e.callback.call(e.callbackCtx);
        }
        if(t.splashDamage){
            this._collsionGroup.remove(sprite);
        }
        sprite.stop();
        sprite.destroy();
    }

    convertExplosionToDamage(t:IExplosionType,e:IExplosion,s:Phaser.Physics.Arcade.Sprite){
        // here we are going to tell the explosion manager to apply damage to a specific area of the map 
        // give a set of parameters of area 
        console.log('Damage from explosion');
        this._scene.game.events.emit(DamageEvents.ApplySplashDamage,s.body.x,s.body.y,1,e.damage.damage);
        // check for damage to the player

    }

}
