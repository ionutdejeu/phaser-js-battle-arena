import 'phaser'

export const DefaultSliceConfig = {
    topLeft:{
        x:0,
        y:0
    },
    topRight:{
        x:0,
        y:0
    },
    bottomLeft:{
        x:0,
        y:0
    },
    bottomRight:{
        x:0,
        y:0
    },
    textureKey:''
}
export class SliceConfig{
    topLeft:Phaser.Geom.Point;
    topRight:Phaser.Geom.Point;
    bottomLeft:Phaser.Geom.Point;
    bottomRight:Phaser.Geom.Point; 

    constructor(obj:any){
        
    }
    
}

export class NineSlideUiTexture extends Phaser.GameObjects.RenderTexture { 

    sourceTex:Phaser.Textures.Texture;
    sliceConfig:any;
    constructor(scene:Phaser.Scene, _sliceConfig, positionConfig = null) {
        super(scene, 0, 0, 32, 32);
        this.sliceConfig = _sliceConfig;
        const { sourceKey, sourceFrame } = this.sliceConfig
        this.sourceTex = scene.sys.textures.get(this.sliceConfig.sourceKey)
        if (!sourceKey) {
            throw new Error('NineSlice requires a texture sourceKey to be specified.')
        }
        if (!this.sourceTex || this.sourceTex.key === '__MISSING') {
            throw new Error(`Expected source image ${sourceKey} not found.`)
        }
    }

}