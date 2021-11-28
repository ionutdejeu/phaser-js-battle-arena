import { BaseProjectile, ProjectileSettings, ProjectileTarget } from "./baseProjectile";


/**
 * Explodes after a specific time 
 * Causes AOE damage 
 */
export class HomingProjectile implements BaseProjectile{
    _physicsCollisionGroup:Phaser.Physics.Arcade.Group;
    projectileSprite: Phaser.Physics.Arcade.Sprite;
    explosionSprite: Phaser.Physics.Arcade.Sprite;
    settings: ProjectileSettings;

    constructor(physicsGroup:Phaser.Physics.Arcade.Group){
        
        
    }

    reset(t: ProjectileTarget) {



    }
    disable() {
         
    }
    draw(graphics: Phaser.GameObjects.Graphics) {
        
    }
    getX() {
        
    }
    getY() {
        
    }
    
}