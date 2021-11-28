


export interface IDamagebaleEntity{ 
    health:integer;
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

export class DamageManager{
    
}