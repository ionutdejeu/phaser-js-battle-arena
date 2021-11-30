

export interface IScoreValue {
    scoreValueChange:integer;
}

export interface IScoreManager {

}

export class IScoreManager{ 
    
    score:integer =0;
    _scene:Phaser.Scene;
    
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._scene.game.events.emit("updateScore",this.score);    
    }


}