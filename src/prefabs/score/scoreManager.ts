

export const ScoreEvents = {
    UPDATE_SCORE:"UPDATE_SCORE"
}
export interface IScoreValue {
    scoreValueChange:integer;
}

export interface IScoreManager {

}

export class ScoreManager{ 
    
    score:integer =0;
    _scene:Phaser.Scene;
    
    constructor(sc:Phaser.Scene){
        this._scene = sc;
        this._scene.game.events.emit("updateScoreUI",this.score);    
        this._scene.game.events.addListener(ScoreEvents.UPDATE_SCORE,this.onUpdateScoreEventHandler,this);
    }
    
    onUpdateScoreEventHandler(scorePoints:integer){
        this.score += scorePoints;
        console.log('update score');
        this._scene.game.events.emit("updateScoreUI",this.score);    

    }


}