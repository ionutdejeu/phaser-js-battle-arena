
import { Vector } from 'matter';
import 'phaser'
import { Scene } from 'phaser';
import { Observable, Subject, Subscription,merge } from 'rxjs';
import VirtualJoyStick from './VirtualJoyStick';


export abstract class AbstractInputController{
    abstract enable()
    abstract disable()
    onValueChange:Subject<Phaser.Math.Vector2>;
}

export class VirtualJoyStickController implements AbstractInputController{
    
   
    joyStick:VirtualJoyStick;
    updateObservable:Observable<void>;
    updateObservalbeSucscription:Subscription;
    onValueChange: Subject<Phaser.Math.Vector2>;
    prevAxisValues:Phaser.Math.Vector2;
    axisValues:Phaser.Math.Vector2;
    
    
    constructor(updateObservalbe:Observable<void>,vJoyStick:VirtualJoyStick){
        this.joyStick = vJoyStick
        this.updateObservable=updateObservalbe;
        this.onValueChange = new Subject<Phaser.Math.Vector2>();
        this.prevAxisValues = new Phaser.Math.Vector2();
        this.axisValues = new Phaser.Math.Vector2();

    }
    supports_os(os: string) {
        
    }

    update(){
        this.axisValues = this.joyStick.getDirection();
        this.onValueChange.next(this.axisValues);
        this.prevAxisValues.x = this.axisValues.x;
        this.prevAxisValues.y = this.axisValues.y;
            
    }
    enable(){
        this.updateObservalbeSucscription = this.updateObservable.subscribe(()=>{
            this.axisValues = this.joyStick.getDirection();
            this.onValueChange.next(this.axisValues);
            this.prevAxisValues.x = this.axisValues.x;
            this.prevAxisValues.y = this.axisValues.y;
            
        });
    }
    
    disable(){
        if(this.updateObservalbeSucscription!== undefined && !this.updateObservalbeSucscription.closed){
            this.updateObservalbeSucscription.unsubscribe();
        }
        this.joyStick.disable();
        
    }
}

export class KeyboardActionKeysController implements AbstractInputController{
    onValueChange: Subject<Phaser.Math.Vector2>;

    enable() {
        throw new Error('Method not implemented.');
    }
    disable() {
        throw new Error('Method not implemented.');
    }

}

export class KeyboardInputController implements AbstractInputController{
    keys: object;
    
    onActionButtonAReleased:Observable<void>;
    updateObservable:Observable<void>;
    updateObservableSubscription:Subscription;
    scene:Phaser.Scene;
    onValueChange: Subject<Phaser.Math.Vector2>;
    prevAxisValues:Phaser.Math.Vector2;
    axisValues:Phaser.Math.Vector2;


    constructor(updateObservable:Observable<void>,scene:Scene){
        this.scene = scene;
        this.updateObservable = updateObservable;
        this.onValueChange = new Subject<Phaser.Math.Vector2>();
        this.prevAxisValues = new Phaser.Math.Vector2();
        this.axisValues = new Phaser.Math.Vector2();
    }
    disable() {
        if(this.updateObservableSubscription !== undefined && !this.updateObservableSubscription.closed){
            this.updateObservableSubscription.unsubscribe();
        }

        this.scene.input.keyboard.removeAllKeys();
    }

    enable() { 
        this.setupDesktopCursorKeys(this.scene);
        this.updateObservableSubscription = this.updateObservable.subscribe(()=>{
            this.updateKeyboardCursors(this.keys);
            this.onValueChange.next(this.axisValues);
            this.prevAxisValues.x = this.axisValues.x;
            this.prevAxisValues.y = this.axisValues.y;
            //if(this.axisValues.x!=this.prevAxisValues.x || this.axisValues.y!=this.prevAxisValues.y){
                
            //}
        });

    }
    setupDesktopCursorKeys(s:Phaser.Scene){
        this.keys = s.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
            ActionA:Phaser.Input.Keyboard.KeyCodes.SPACE
		});
    }

    updateKeyboardCursors(cursors) {
		if (cursors.left.isDown) {
			this.axisValues.x = -1;
		} else if (cursors.right.isDown) {
			this.axisValues.x = 1;
		} else {
			this.axisValues.x = 0;
		}

		if (cursors.up.isDown) {
			this.axisValues.y = -1;
		} else if (cursors.down.isDown) {
			this.axisValues.y = 1;
		} else {
			this.axisValues.y = 0;
		}
        
	}

}

export class InputManager{

    onAxisChangedObservable:Subject<Phaser.Math.Vector2>
    scene:Phaser.Scene;
    subscription:Subscription;
    inputControllers:Array<AbstractInputController> = [];
    ctrlEventSubs:Array<Subscription> = [];

    constructor(){
       this.onAxisChangedObservable = new Subject<Phaser.Math.Vector2>();
    }
    
    add_keyboard_controller(scene:Phaser.Scene, ctrl:AbstractInputController){
        if(scene.game.device.os.windows){
            for(let ct of this.inputControllers){
                ct.disable();
            }
            ctrl.enable();
            console.log('enabled windows');
            this.inputControllers.push(ctrl);
            let sub = ctrl.onValueChange.subscribe((vec:Phaser.Math.Vector2)=>{
                this.onAxisChangedObservable.next(vec);
            })
            this.ctrlEventSubs.push(sub)
        }else{
            ctrl.disable()
            
        }
    }

    add_android_controller(scene:Phaser.Scene, ctrl:AbstractInputController){
        if(scene.game.device.os.android){
            for(let ct in this.inputControllers){
                ctrl.disable();               
            }
            this.inputControllers.push(ctrl);
            ctrl.enable();
            let sub = ctrl.onValueChange.subscribe((vec:Phaser.Math.Vector2)=>{
                this.onAxisChangedObservable.next(vec);
            });
             
            this.ctrlEventSubs.push(sub)
        }else{
            ctrl.disable();
        }
    }
    
}

export const inputManagerInstance:InputManager = new InputManager();

