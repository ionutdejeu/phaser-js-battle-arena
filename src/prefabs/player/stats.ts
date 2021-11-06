import { BaseProjectile } from "./baseProjectile";


export class PlayerBodyStats { 
    speed:Number;
    health:Number;
}

export class PlayerDefenceStats{ 
    dmgReduction:Number = 1;
    
}

export class PlayerAttackStats{ 
    damagePerHit:number = 1;
    /**
     * Number of miliseconds delay between attacks
     */
    attackSpeed:number =200;
    attackProjectilePrefab:BaseProjectile;
    attackProjectileSpeed:number=200;

}