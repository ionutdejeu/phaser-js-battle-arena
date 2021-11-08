import { PowerupBase } from "./base";


export class PowerupManager{
    _scene:Phaser.Scene;
    _internalMap:WeakMap<String,Array<PowerupBase>>;
    constructor(scene:Phaser.Scene){
        this._scene = scene;
        this._internalMap = new Map();
    }

    addToPLayer(type:string,pw:PowerupBase){

    }

    createEffect(pw:PowerupBase){
        
    }
}