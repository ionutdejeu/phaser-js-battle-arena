

export default class MainMenuScene extends Phaser.Scene {
	
	backgroundGradient:Phaser.GameObjects.Graphics;
    constructor() {
		super("MainMenuScene"); 
		
	}

    init(): void {
		
	}

	create(): void {
		this.backgroundGradient = this.add.graphics();
		this.backgroundGradient.fillGradientStyle(0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 1);
		this.backgroundGradient.fillRect(0,0,this.scale.width,this.scale.height)
	}

	update(){
		
	}

	 

}