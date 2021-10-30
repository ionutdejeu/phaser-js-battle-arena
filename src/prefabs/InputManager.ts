
import 'phaser'
import { Scene } from 'phaser';
import { Observable, Subject, Subscription } from 'rxjs';
import VirtualJoyStick from './VirtualJoyStick';


export abstract class AbstractInputController{
    abstract enable()
    abstract disable()
}

export class VirtualJoyStickController implements AbstractInputController{
    horizontalAxis:number
    verticalAxis:number
    joyStick:VirtualJoyStick;
    updateObservable:Observable<void>;
    updateObservalbeSucscription:Subscription;
    
    constructor(updateObservalbe:Observable<void>,vJoyStick:VirtualJoyStick){
        this.joyStick = vJoyStick
        this.updateObservable=updateObservalbe;
    }
    supports_os(os: string) {
        
    }
    enable(){
        this.updateObservalbeSucscription = this.updateObservable.subscribe(()=>{
            this.horizontalAxis = this.joyStick.getDirection().x;
            this.verticalAxis = this.joyStick.getDirection().y;
        });
    }
    
    wireChangeEvents(){
        
    }
    
    disable(){
        this.updateObservalbeSucscription.unsubscribe();
        this.joyStick.disable();
        
    }
}

export class KeyboardActionKeysController implements AbstractInputController{

    enable() {
        throw new Error('Method not implemented.');
    }
    disable() {
        throw new Error('Method not implemented.');
    }

}

export class KeyboardInputController implements AbstractInputController{
    keys: object;
    horizontalAxis: number;
    verticalAxis: number;
    onActionButtonAReleased:Observable<void>;
    updateObservable:Observable<void>;
    updateObserbableSubscription:Subscription;
    scene:Phaser.Scene;

    constructor(updateObservable:Observable<void>,scene:Scene){
        this.scene = scene;
        this.updateObservable = updateObservable;
    }
    disable() {
        this.updateObserbableSubscription.unsubscribe();
        this.scene.input.keyboard.removeAllKeys();
    }

    enable() { 
        this.setupDesktopCursorKeys(this.scene);
        this.updateObserbableSubscription = this.updateObservable.subscribe(()=>{
            this.updateKeyboardCursors(this.keys);
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
			this.horizontalAxis = -1;
		} else if (cursors.right.isDown) {
			this.horizontalAxis = 1;
		} else {
			this.horizontalAxis = 0;
		}

		if (cursors.up.isDown) {
			this.verticalAxis = 1;
		} else if (cursors.down.isDown) {
			this.verticalAxis = -1;
		} else {
			this.verticalAxis = 0;
		}
        console.log(cursors.ActionA.isDown, this.horizontalAxis,this.verticalAxis);
	}

}

export class InputManager{
   

    onActionButtonAReleased:Observable<void>;
    onAxisChangedSubject:Subject<Phaser.Math.Vector2> = new Subject();
    updateObservable:Observable<void>;
    scene:Phaser.Scene;
    inputControllers:Array<AbstractInputController> = [];

    constructor(){
       this.onAxisChangedSubject = new Subject();
    }
    
    add_keyboard_controller(scene:Phaser.Scene, ctrl:AbstractInputController){
        if(scene.game.device.os.windows){
            for(let ct of this.inputControllers){
                ct.disable();
            }
            ctrl.enable();
            this.inputControllers.push(ctrl);
        }else{
            ctrl.disable()
        }
    }

    add_android_controller(scene:Phaser.Scene, ctrl:AbstractInputController){
        console.log(scene.game.device.os.android);
        if(scene.game.device.os.android){
            for(let ct in this.inputControllers){
                ctrl.disable();
               
            }
            this.inputControllers.push(ctrl);
            console.log('enabled');
            ctrl.enable();
        }else{
            console.log('disabled');
            ctrl.disable();
        }
    }
    
}

export const inputManagerInstance:InputManager = new InputManager();

