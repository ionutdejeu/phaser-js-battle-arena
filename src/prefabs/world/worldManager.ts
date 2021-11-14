

export interface IWorldManager { 
    create()

}
export class WorldManager{
    _scene:Phaser.Scene;
    _floorTiles:Phaser.GameObjects.TileSprite;
    constructor(sc:Phaser.Scene){
        this._scene = sc
    }
    create(){
        this._floorTiles = this._scene.add.tileSprite(0, 0, 4000, 4000, 'ground_tile');
        this._floorTiles.setDepth(-1000);

    }
}