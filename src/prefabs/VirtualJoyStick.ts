
import "phaser";

import { Subject } from 'rxjs'
import {uiDevicePixelScaleRation} from './UiManager'

const WHITE = 0xffffff

 
export default class VirtualJoyStick extends Phaser.GameObjects.Container
{
	private clickSubject: Subject<Phaser.Input.Pointer> = new Subject()

    private upTexture: string
	private upTint: number
	private downTexture: string
	private downTint: number
	private overTexture: string
	private overTint: number
	private disabledTexture: string
	private disabledTint: number
	private baseCircle:Phaser.GameObjects.Arc;
	private pointerCircle:Phaser.GameObjects.Arc;
	private tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
    private tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
	private isActivated:boolean = false;
	private direction:Phaser.Math.Vector2;
	private touchStartPos:Phaser.Math.Vector2;
	private currTochPos:Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tint: number = WHITE)
	{  
        super(scene,30*uiDevicePixelScaleRation,110*uiDevicePixelScaleRation);
		//let yc =  window.innerHeight*uiDevicePixelScaleRation-30*uiDevicePixelScaleRation;
		//this.y = scene.cameras.main.worldView.-30*uiDevicePixelScaleRation
		let l= scene.cameras.main.worldView.left - 30*uiDevicePixelScaleRation;
		let b = scene.cameras.main.worldView.bottom - 30*uiDevicePixelScaleRation;
		let woldPos = scene.cameras.main.getWorldPoint(l,b);
		this.x = woldPos.x
		this.y = woldPos.y
		
		this.upTexture = texture
		this.upTint = tint
		this.downTexture = texture
		this.downTint = tint
		this.overTexture = texture
		this.overTint = tint
		this.disabledTexture = texture
		this.disabledTint = tint
		console.log("Created stck");
		this.width = 10*uiDevicePixelScaleRation;
		this.height = 10*uiDevicePixelScaleRation;
		this.baseCircle =  this.scene.add.circle(0,0,20*uiDevicePixelScaleRation,tint,125)
		this.pointerCircle =  this.scene.add.circle(0,0,7*uiDevicePixelScaleRation,0xff0000);
		this.add(this.baseCircle);
		this.add(this.pointerCircle);
		scene.add.existing(this);
		this.pointerCircle.setVisible(false);
		this.setInteractive(new Phaser.Geom.Circle(0,0,100), Phaser.Geom.Circle.Contains)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.handleUp, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.handleOut, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.handleDown, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this.handleOver, this)
			.on(Phaser.Input.Events.DRAG_START,this.handleDragStart,this)
			.on(Phaser.Input.Events.DRAG_END,this.handleDragEnd,this)
			.on(Phaser.Input.Events.DRAG,this.handleDragHander,this)
		this.touchStartPos = new Phaser.Math.Vector2(0,0);
		this.currTochPos = new Phaser.Math.Vector2(0,0);
		this.direction = new Phaser.Math.Vector2(0,0);

		console.log(this.parentContainer,scene.game.scale.width,scene.game.scale.height);


    }

	private handleDragStart(pointer: Phaser.Input.Pointer){
		this.pointerCircle.setVisible(true);
		this.isActivated = true;
		let invPos = this.tempMatrix.applyInverse(pointer.x,pointer.y,);
		this.touchStartPos.set(invPos.x,invPos.y);
	}	

	public getDirection(){
		return this.direction;
	}
	public touchStarted(){
		return this.isActivated;
	}
	public disable(){
		this.disableInteractive();
		this.setVisible(false);
		this.setActive(false);
	}
	private handleDragHander(pointer: Phaser.Input.Pointer){
		this.getWorldTransformMatrix(this.tempMatrix, this.tempParentMatrix);
		var d = this.tempMatrix.decomposeMatrix();
		let invPos = this.tempMatrix.applyInverse(pointer.x,pointer.y);
		var dParent = this.tempParentMatrix.decomposeMatrix();
		this.pointerCircle.setPosition(invPos.x,invPos.y);

		this.currTochPos.set(invPos.x,invPos.y);
		this.direction = this.currTochPos.subtract(this.touchStartPos).normalize();
	}

	private handleDragEnd(pointer: Phaser.Input.Pointer){
		this.direction = new Phaser.Math.Vector2(0,0);
		this.pointerCircle.setVisible(false);
		this.isActivated = false;
	}
	public onClick()
	{
		return this.clickSubject.asObservable()
	}

    private handleUp(pointer: Phaser.Input.Pointer)
	{
		this.handleOver(pointer)
		this.clickSubject.next(pointer)
	}

	private handleOut(pointer: Phaser.Input.Pointer)
	{
	
	}

	private handleDown(pointer: Phaser.Input.Pointer)
	{
	 
	}

	private handleOver(pointer: Phaser.Input.Pointer)
	{
		 
	}

}