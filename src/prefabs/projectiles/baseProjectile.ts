import { GameObjects } from "phaser";
import { min } from "rxjs";

export interface ProjectileSettings{ 
    airTimeInMs:integer;
    explosionDurationInMs:integer;
}
const projectileVerticalVector = new Phaser.Math.Vector2(-10,0);
export interface BaseProjectile{
    projectileSprite:Phaser.Physics.Arcade.Sprite;
    explosionSprite:Phaser.Physics.Arcade.Sprite;
    settings:ProjectileSettings
    reset(fromX:number,fromY:number,toX:number,toY:number);
    disable();
    draw(graphics:Phaser.GameObjects.Graphics);
    getX();
    getY();
}

interface Path { 
    t:number,
    vec:Phaser.Math.Vector2
}

export class BaseObjectPool<T extends BaseProjectile> { 
    private activeList: Array<T>;
    private reserveList: Array<T>;
    private numberActive: number;
    private numberReserved: number;

    constructor(objects:T[], reserve: number = 5)
    {
        this.activeList = new Array<T>();
        this.reserveList = new Array<T>();

        this.reserveList = objects;
        console.log(this.reserveList);

        this.numberActive = 0;
        this.numberReserved = objects.length;
    }

    public getGameObject(): T
    {
        console.log(this.reserveList);
        if(this.numberReserved>0){
            const gameObject = this.reserveList.pop();
            this.numberReserved--;
    
            this.activeList.push(gameObject);
            this.numberActive++;
            return gameObject;
        }else{
            return this.activeList[this.numberActive-1];
        }

        
        
    }
 
    public returnGameObject(gameObject: T)
    {
        // Get the index of the gameObject in the active list:
        const index = this.activeList.indexOf(gameObject);
        if(index >= 0)
        {
            // Splice the list around the element to remove.
            // Splice can be an expensive operation, which is why
            // I would use a custom collection in a real scenario:
            this.activeList.splice(index, 1);
            this.numberActive--;
 
            // Add it to the reserve:
            this.reserveList.push(gameObject);
            this.numberReserved++;
        }

    }

    drawActiveObjects(graphics:Phaser.GameObjects.Graphics){
        for(let i=0;i<this.numberActive;i++){
            this.activeList[i].draw(graphics);
        }
    }


}
export class SustainedExplosion implements BaseProjectile{
    projectileSprite: Phaser.Physics.Arcade.Sprite;
    explosionSprite: Phaser.Physics.Arcade.Sprite;
    settings: ProjectileSettings;
    _fromVec2:Phaser.Math.Vector2;
    _toVec2:Phaser.Math.Vector2;
    _tween:Phaser.Tweens.Tween;
    _tweenCounter:number
    _scene:Phaser.Scene;
    _collisionGroup:Phaser.Physics.Arcade.StaticGroup;
    _explosionCompleteCallback:Function;

    constructor(collisionGroup: Phaser.Physics.Arcade.StaticGroup,
        onExplosionComplete?:Function){
        
        this._explosionCompleteCallback = onExplosionComplete;
        this._fromVec2 = new Phaser.Math.Vector2();
        this._toVec2 = new Phaser.Math.Vector2();
        this._collisionGroup=collisionGroup;
        
        this.settings = {
            airTimeInMs:5000,
            explosionDurationInMs:5000
        }
        this._scene = collisionGroup.scene;
        this._tween = this._scene.tweens.addCounter({
            duration:this.settings.explosionDurationInMs,
            from:0,
            to:100,
            paused:true,
            onComplete:this.onComplete,
            onCompleteScope:this,
            onStart:this.onStart,
            onStartScope:this
        });
    }
    getX() {
        return this.explosionSprite.body.x;
    }
    getY() {
        return this.explosionSprite.body.x;
    }
    reset(fromX: number, fromY: number, toX: number, toY: number) {
        this._fromVec2.x = fromX
        this._fromVec2.y = fromY
        this._toVec2.x = toX;
        this._toVec2.y = toY;
        this.explosionSprite = this._collisionGroup.get(toX,toY)
        this.explosionSprite
            .setActive(true)
            .setVisible(true)
            .play('explode_projectile',false)
        

    }
    onStart(){
        
    }
    onComplete(){
        this._collisionGroup!.killAndHide(this.explosionSprite);
        this.explosionSprite.setActive(false).setVisible(false);
        this._explosionCompleteCallback(this);
    }
    disable() {
        
    }
    draw(graphics: GameObjects.Graphics) {
        
    }

}
export class SimpleBallisticProjectile implements BaseProjectile{
    
    reset(fromX:number,fromY:number,toX:number,toY:number) {
        this._parabolaPath.destroy();
        this._linearShadowPath.destroy();
        this._parabolaPath = new Phaser.Curves.Path(fromX,fromY);
        this._linearShadowPath = new Phaser.Curves.Path(fromX,fromY);
        this._fromVec2.x = fromX
        this._fromVec2.y = fromY
        this._toVec2.x = toX;
        this._toVec2.y = toY;
        let midx = (toX - fromX);
        let midy = (toY - fromY);
        this._linearShadowPath.lineTo(toX,toY);
        this._parabolaPath.quadraticBezierTo(toX,toY, projectileVerticalVector.x+midx,projectileVerticalVector.y+midy);
        this._tween.play();
        ///this._parabolaPath.quadraticBezierTo(fromX,fromY, midy,-midx);
    }
 
    disable() {

    }
    
    projectileSprite: Phaser.Physics.Arcade.Sprite;
    explosionSprite: Phaser.Physics.Arcade.Sprite;
    settings: ProjectileSettings;
    _scene:Phaser.Scene;
    _tween:Phaser.Tweens.Tween;
    _parabolaFollower:Path;
    _lineFollower:Path;
    _parabolaPath:Phaser.Curves.Path;
    _linearShadowPath:Phaser.Curves.Path
    _fromVec2:Phaser.Math.Vector2;
    _toVec2:Phaser.Math.Vector2;
    _onLandProjectileCallback:Function;
    _onLandProjectileCallbackCtx:Function;


    constructor(collisionGroup: Phaser.Physics.Arcade.StaticGroup,
        onLandProjectileCallback?:Function,
        onLandProjectileCallbackContext?:any){
        this._fromVec2 = new Phaser.Math.Vector2();
        this._toVec2 = new Phaser.Math.Vector2();
        this._onLandProjectileCallback=onLandProjectileCallback;
        this._onLandProjectileCallbackCtx=onLandProjectileCallbackContext;
        

        this._parabolaFollower = {
            t:0,
            vec:new Phaser.Math.Vector2()
        }
        this._lineFollower = {
            t:0,
            vec:new Phaser.Math.Vector2()
        }

        this._parabolaPath = new Phaser.Curves.Path();
        this._linearShadowPath = new Phaser.Curves.Path();

        this.settings = {
            airTimeInMs:5000,
            explosionDurationInMs:5000
        }
        this._scene = collisionGroup.scene;
        this._tween = this._scene.tweens.add({
            duration:this.settings.airTimeInMs,
            targets:this._parabolaFollower,
            t:1,
            repeat:0,
            onComplete:this.projectileLanded,
            onCompleteScope:this
        });
        this._tween.pause();
    }
    getX() {
        return this._parabolaFollower.vec.x;
    }
    getY() {
        return this._parabolaFollower.vec.y;
    }

    
    draw(graphics:Phaser.GameObjects.Graphics){
        graphics.lineStyle(2, 0xffffff, 1); 
        this._parabolaPath.draw(graphics);
        this._parabolaPath.getPoint(this._parabolaFollower.t, this._parabolaFollower.vec);4
        this._linearShadowPath.getPoint(this._parabolaFollower.t, this._lineFollower.vec);

        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(this._parabolaFollower.vec.x, this._parabolaFollower.vec.y, 12);
        graphics.fillStyle(0x22222, 1);
        graphics.fillCircle(this._lineFollower.vec.x, this._lineFollower.vec.y, 12);

         
    }

    projectileLanded(){
        this._tween.pause();
        console.log(this._onLandProjectileCallbackCtx);
        this._onLandProjectileCallbackCtx.call(this._onLandProjectileCallback,this)
    }
     

     
} 


