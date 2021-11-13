export default class BootScene extends Phaser.Scene {
	constructor() {
		super("Boot"); // Name of the scene
	}

	preload(): void {
		this.loadImages();
		this.loadSpriteSheets();
		this.loadAudio();
	}

	create(): void {
		this.scene.start("Game");

        
	}

	// Utility functions:
	// Load Images
	loadImages(): void {
		 
		this.load.spritesheet('boom', 'assets/sheets/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
		this.load.spritesheet('player_sprites', 'assets/sheets/player_sheet.png', { frameWidth: 16, frameHeight: 16 });
		
		//this.load.atlas('player_anim', 'assets/sheets/player_sheet.png', 'assets/sheets/player_sheet.json');
		 // Animation set	
		
		 
		//this.anims.create({
        //    key: 'player_idle',
        //    frames: this.anims.generateFrameNames('player_anim',{prefix:"player_idle_"}),
        //    frameRate: 8,
        //    repeat: -1
        //});
		//
		// // Animation set
		// this.anims.create({
        //    key: 'player_damage',
        //    frames: this.anims.generateFrameNames('player_anim', {prefix:"player_damage_"}),
        //    frameRate: 8,
        //    repeat: -1
        //});
//
		// // Animation set
		//this.anims.create({
        //    key: 'player_walk',
        //    frames: this.anims.generateFrameNames('player_anim', {prefix:"player_walk_"}),
        //    frameRate: 8,
        //    repeat: -1
        //});
		console.log(this.anims);

		this.load.image("button1", "assets/images/ui/blue_button01.png");
		this.load.image("button2", "assets/images/ui/blue_button02.png");
		this.load.image("bullet", "assets/images/Bullet.png");

	}

	// Load SpriteSheets
	loadSpriteSheets(): void {
		this.load.spritesheet("items", "assets/images/items.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.spritesheet("characters", "assets/images/characters.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
	}

	// Load Audio
	loadAudio(): void {
		this.load.audio("goldSound", ["assets/audio/Pickup.wav"]);
	}
}
