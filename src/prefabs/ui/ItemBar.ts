import { UIBlock } from "./UiBlock";
import { AlignGrid } from "./AlignGrid";

import "phaser"

export class ItemBar extends UIBlock{
    _scene:Phaser.Scene
    _backgroundGraphics:Phaser.GameObjects.Graphics;
    _grid: AlignGrid
    _size:Phaser.Structs.Size;
    constructor(scene:Phaser.Scene){
        super();
        this._scene = scene;
        this._displayWidth = scene.scale.width;
        this._displayHeight = 100;
        this.x = 0
        this.y = 0
        this._grid = new AlignGrid(scene,10,1,this);
        this._grid.draw();

    }

    init(){
        this._backgroundGraphics = this._scene.add.graphics();
        for(let i = 0;i<9;i++){
            this._backgroundGraphics.fillStyle(0xffff00, 1);
            //  32px radius on the corners
            let x = this._grid.getCellCenterX(i,0);
            this._backgroundGraphics.fillRoundedRect(x, 32, 300, 200, 32);
        }
    }

}