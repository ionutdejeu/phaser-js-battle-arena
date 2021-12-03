import { map } from "rxjs";
import { IPlayer } from "../player/playerGroup";



export interface IDamagebaleEntity{ 
    health:integer;
    sprite?:Phaser.Physics.Arcade.Sprite
}

export interface IDamigingEntity{
    damage:integer;
}

export interface IDamanageManager {
    eventEmiter:Phaser.Events.EventEmitter;
    entityDamageMap:Map<string,IDamagebaleEntity>;
    applyDamage(from:IDamigingEntity,to:IDamagebaleEntity);
    registerEntity(entityID:string,e:IDamagebaleEntity);
    unregisterEntity(entityId:string);
    timeoutEntity(entityId:string);
    killEntity(entityId:string);
}

export const DamageEvents = { 
    ApplyDamageFromTo:"APPLY_DAMAGE_FROM_TO",
    ApplySplashDamage:"APPLY_SPLASH_DAMAGE"
}
export class DamageManager{
    
    entities:Map<string,IDamagebaleEntity>= new Map()
    playerDamagebaleEntity:IDamagebaleEntity;
    allCollctionOfEntemies:Phaser.Physics.Arcade.Group;
    player:IPlayer
    _scene:Phaser.Scene;
    
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._scene.game.events.addListener(DamageEvents.ApplyDamageFromTo,this.applyDamageTo,this);
        this._scene.game.events.addListener(DamageEvents.ApplySplashDamage,this.applyDamageToArea,this);
    }
    setEnemyGroup(g:Phaser.Physics.Arcade.Group){
        this.allCollctionOfEntemies = g
    }
    
    setPlayer(p:IPlayer){
        this.player = p
    }
    
    registerDamagebleEntityForObject(obj:Phaser.Physics.Arcade.Sprite){
        if(!this.entities.has(obj.name)){
            
            this.entities.set(obj.name,{
                health:10,
                sprite:obj
            })
        }   
    }

    registerDamagebleEntitiesForObjects(objs:Phaser.Physics.Arcade.Sprite[]){
        for(let i=0;i<objs.length;i++){
            this.registerDamagebleEntityForObject(objs[i])
        }
        console.log(this.entities);
    }


    createPlayerDamabableEntity(s:IPlayer){
        this.playerDamagebaleEntity = {
            health:100
        } 
    }
    recoverDamagableEntity(entityName:string){
        if(this.entities.has(entityName)){
            let de = this.entities.get(entityName)
            de.health = 100
        }
    }
    applyDamageTo(damageableEntity:IDamagebaleEntity,damage:number){
        damageableEntity.health -=damage;
        //handle events for entity distruction   
        console.log(damageableEntity.health); 
    }

    applyDamageToArea(posX:number,posY:number,radius:number,damage:number){
        let overlappingObjects = this._scene.physics.overlapCirc(posX,posY,radius,true,false);
        console.log('damage to objects',overlappingObjects);
        for(let i = 0;i<overlappingObjects.length;i++){
            console.log(overlappingObjects[i].gameObject.name);
            if(this.entities.has(overlappingObjects[i].gameObject.name)){
                this.applyDamageTo(this.entities.get(overlappingObjects[i].gameObject.name),damage);
            }    
        }
        
    }   

}