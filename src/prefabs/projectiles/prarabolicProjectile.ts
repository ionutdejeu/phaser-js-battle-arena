import { BaseProjectile, Path, ProjectileSettings, ProjectileTarget, projectileVerticalVector } from "./baseProjectile";

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
    _explosionCompleteCallbackCtx:Function;

    constructor(collisionGroup: Phaser.Physics.Arcade.StaticGroup,
        onExplosionComplete?:Function,
        onExplosionCompleteContex?:any){
        
        this._explosionCompleteCallback = onExplosionComplete;
        this._explosionCompleteCallbackCtx = onExplosionCompleteContex;
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
    reset(t:ProjectileTarget) {
        this._toVec2.x = t.originX;
        this._toVec2.y = t.originY;
        this.explosionSprite = this._collisionGroup.get(t.originX,t.originY)
        this.explosionSprite
            .setActive(true)
            .setVisible(true)
            .setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000)
            .play('explode_projectile',true)
    }
    onStart(){
        
    }
    onComplete(){
        console.log('exp complete')
        this._collisionGroup!.killAndHide(this.explosionSprite);
        this.explosionSprite.setActive(false).setVisible(false);
        this._explosionCompleteCallback.call(this._explosionCompleteCallbackCtx,this);
    }
    disable() {
        
    }
    draw(graphics: Phaser.GameObjects.Graphics) {
        
    }

}
export class SimpleBallisticProjectile implements BaseProjectile{
    
    reset(t:ProjectileTarget) {
        this._parabolaPath.destroy();
        this._linearShadowPath.destroy();
        this._parabolaPath = new Phaser.Curves.Path(t.originX,t.originY);
        this._linearShadowPath = new Phaser.Curves.Path(t.absolutePosX,t.absolutePosY);
        this._fromVec2.x = t.originX
        this._fromVec2.y = t.originY
        this._toVec2.x = t.absolutePosX;
        this._toVec2.y = t.absolutePosY;
        let midx = (t.absolutePosX - t.originX);
        let midy = (t.absolutePosY - t.originY);
        this._linearShadowPath.lineTo(t.absolutePosX,t.absolutePosY);
        this._parabolaPath.quadraticBezierTo(t.absolutePosX,t.absolutePosY, projectileVerticalVector.x+midx,projectileVerticalVector.y+midy);
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
        this._onLandProjectileCallback.call(this._onLandProjectileCallbackCtx,this)
    }
     

     
} 
