import { BaseProjectile } from "../projectiles/baseProjectile";


export class PlayerBodyStats { 
    speed:Number;
    health:Number;
}

export class PlayerDefenceStats{ 
    dmgReduction:Number = 1;
    
}

export class PlayerAttackStats{ 
    damagePerHit:number = 1;
    attackSpeed:number = 200;
    attackProjectileSpeed:number=200;
}