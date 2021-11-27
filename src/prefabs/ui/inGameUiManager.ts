import { AlignGrid } from "../AlignGrid";
import UIButton from "../UIButton";
import { UIBlock } from "./UiBlock";



export interface IUiManager { 
    init();
    open();
    close();
    
}

export class InGameUiManager extends UIBlock implements IUiManager {
    _grid:AlignGrid
    _scene:Phaser.Scene;
    _menu_button:UIButton;
    constructor(sc:Phaser.Scene){
        super();
        this._scene = sc
        this._grid = new AlignGrid(sc,4,4)
        
    }
    open() {
        throw new Error("Method not implemented.");
    }
    close() {
        throw new Error("Method not implemented.");
    }
    init(){
        this._menu_button = new UIButton(this._scene,0,0,
            "button1",
        "button2",
        "Start",()=>{
            console.log('open menu');
        })
        this._grid.placeAt(4,0,this._menu_button);
        //this._scene.add.existing(this._menu_button);
        //this._grid.draw();
    }
}