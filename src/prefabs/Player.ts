export default class Player extends Phaser.Physics.Arcade.Image {
	speed: number;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		key: string,
		frame: number
	) {
		super(scene, x, y, key, frame);
		this.scene = scene;

		this.speed = 160;
		

		// Physics
		this.scene.physics.world.enable(this);
		this.setImmovable(false);
		this.setScale(2);
		this.setCollideWorldBounds(true);
		this.scene.add.existing(this);
	}
	update_virtual(direction){
		this.setVelocity(direction.x*this.speed,direction.y*this.speed);
	}
	 
}
