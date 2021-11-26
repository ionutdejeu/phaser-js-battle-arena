import { GameObjects } from "phaser";

export interface ProjectileSettings{ 
    airTimeInMs:integer;
    explosionDurationInMs:integer;
}
export interface BaseProjectile{
    projectileSprite:Phaser.Physics.Arcade.Sprite;
    explosionSprite:Phaser.Physics.Arcade.Sprite;
    settings:ProjectileSettings
    create(collisionGroup:Phaser.Physics.Arcade.StaticGroup);
    reset();
    disable();
    draw(graphics:Phaser.GameObjects.Graphics);
}

interface Path { 
    t:number,
    vec:Phaser.Math.Vector2
}
export class SimpleBallisticProjectile implements BaseProjectile{
    reset() {
        throw new Error("Method not implemented.");
    }
    disable() {
        throw new Error("Method not implemented.");
    }
    projectileSprite: Phaser.Physics.Arcade.Sprite;
    explosionSprite: Phaser.Physics.Arcade.Sprite;
    settings: ProjectileSettings;
    _scene:Phaser.Scene;
    _tween:Phaser.Tweens.Tween;

    create(
        collisionGroup: Phaser.Physics.Arcade.StaticGroup
        
        ) {
        this._scene = collisionGroup.scene;
        this._tween = this._scene.tweens.add({
            duration:this.settings.airTimeInMs,
        })

    }
    draw(graphics:Phaser.GameObjects.Graphics){

    }

    projectileLunched(){
        
    }
    projectileLanded(){

    }

    explosionStart(){

    }

    explisionEnd(){

    }



} 


