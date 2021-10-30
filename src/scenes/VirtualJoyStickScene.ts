import "phaser";
import {Subject} from 'rxjs'
import VirtualJoyStick from "../prefabs/VirtualJoyStick";
import {inputManagerInstance,VirtualJoyStickController} from '../prefabs/InputManager'

 
export const VirtualJoystickSceneKey={
  key:'ScrollContainerDemoScene'
}
export class VirtualJoyStickDemoScene extends Phaser.Scene {
    virtualJoyStick:VirtualJoyStick;
    virtualController:VirtualJoyStickController;
    sceneUpdateObservable:Subject<void>;
    constructor() {
    super(VirtualJoystickSceneKey);
  }
  
  preload():void{
     
  }
  create(): void {
    this.virtualJoyStick = new VirtualJoyStick(this,100,100,"daw",0xFFFFFF);
    this.input.setDraggable(this.virtualJoyStick);
    this.sceneUpdateObservable = new Subject();

    this.virtualController = new VirtualJoyStickController(this.sceneUpdateObservable.asObservable(),this.virtualJoyStick);
    inputManagerInstance.add_android_controller(this,this.virtualController);

  }

}
