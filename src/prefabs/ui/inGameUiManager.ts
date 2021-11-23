import { AlignGrid } from "../AlignGrid";



export interface IUiManager { 
    
}

export class InGameUiManager implements IUiManager {
    _grid:AlignGrid
    _scene:Phaser.Scene;
    constructor(sc:Phaser.Scene){
        this._scene = sc
        this._grid = new AlignGrid(sc,0)
    }
}