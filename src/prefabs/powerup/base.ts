import { Scene } from "phaser";

export const PowerUpKeys = [
    'SPEED'
]
export class PowerupBase { 
    level:number;
    _scene:Scene;
    constructor(scene:Phaser.Scene){
        this._scene = scene;
    }

    public createVisualEffect():void{};
    public removeVisualEffect():void{};
    public applyStats():void{};
    public removeStas():void{};
    
}