
import 'phaser'



export class Align{
    scene:Phaser.Scene
    constructor(scene:Phaser.Scene){
        this.scene = scene;
    }

    positionOnSceneCenter = (obj:Phaser.GameObjects.Sprite)=>{
        obj.x = this.scene.scale.width/2;
        obj.y = this.scene.scale.height/2;
    }

}
const PositionOnSceneCenter = (scene: Phaser.Scene,obj:Phaser.GameObjects.Sprite)=>{
    obj.x = scene.scale.width/2;
    obj.y = scene.scale.height/2;
} 


const PositionSceneToCenter = (scene: Phaser.Scene,obj:Phaser.GameObjects.Sprite)=>{
    obj.x = scene.scale.width/2;
    obj.y = scene.scale.height/2;
} 




