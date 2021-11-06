import { UIBlock } from "./UiBlock";


class ImageButton extends UIBlock{
    _sprite:Phaser.GameObjects.Sprite;
    _scene:Phaser.Scene;
    _callback:CallableFunction
    constructor(imgKey:string){
        super();
    }
    
    onClick(calback:CallableFunction){
        this._callback= calback
        this._sprite.on('pointerover', (event)=> {
            
        },this);    
        this._sprite.on('pointerout',(event)=>{
            this._callback()
        },this);
    }
}