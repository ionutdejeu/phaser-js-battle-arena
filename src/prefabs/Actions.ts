import type { GameObjects } from "phaser";
import {Observable} from 'rxjs'




export abstract class Action{
    target:Phaser.GameObjects.GameObject
    source?:Phaser.GameObjects.GameObject
    constructor(target:Phaser.GameObjects.GameObject,source?:Phaser.GameObjects.GameObject){
        this.target = target;
        this.source = source;
    }
    
     
}

export class FireProjectileAction implements Action{
    target: GameObjects.GameObject;
    source?:GameObjects.GameObject
    constructor(prjectile,target:Phaser.GameObjects.GameObject,source?:Phaser.GameObjects.GameObject){
    
    }
    do() {
        throw new Error("Method not implemented.");
    }
}

export class FireParabolicProjectileAction{
    target:Phaser.Math.Vector2
    source?:Phaser.Math.Vector2;
    controlPoint:Phaser.Math.Vector2;
    path:Object;
    scene:Phaser.Scene;
    curve:Phaser.Curves.QuadraticBezier
    graphics:Phaser.GameObjects.Graphics;
    
    constructor(scene:Phaser.Scene, updateObservable:Observable<void>,sourcePosition:Phaser.Math.Vector2,targetPosition:Phaser.Math.Vector2){
        this.source = sourcePosition
        this.target = targetPosition
        this.scene = scene
        this.controlPoint = new Phaser.Math.Vector2();
        this.path = { t: 0, vec: new Phaser.Math.Vector2() };
        this.controlPoint.x = (this.source.x - this.target.x)*0.5 + this.source.x + 1;
        this.controlPoint.y = (this.source.y - this.target.y)*0.5 + this.source.y + 1;
        this.curve = new Phaser.Curves.QuadraticBezier(this.source,this.controlPoint,this.target);
        this.graphics = this.scene.add.graphics();
        this.scene.tweens.add({
            targets: this.path,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        updateObservable.subscribe(()=>{
            this.graphics.clear();
            this.graphics.lineStyle(1, 0x00ff00, 1);
            this.curve.draw(this.graphics);
            this.curve.getPoint(this.path['t'], this.path['vec']);
        
            this.graphics.fillStyle(0xff0000, 1);
            this.graphics.fillCircle(this.path['vec']['x'], this.path['vec']['y'], 16);
        })

    }

    

}



export class SearchTargetAction implements Action{
    target: GameObjects.GameObject;
    source: GameObjects.GameObject;
    maxDistanceSq:integer=200**2;
    searc(possibleTargets:GameObjects.GameObject[]): void {
        for(let possibleTarget in possibleTargets){
            
        }
    }

}
export class DamageAction implements Action{

    target: GameObjects.GameObject;
    do() {
        //need to see how i cna implement a damageble component
    } 
}