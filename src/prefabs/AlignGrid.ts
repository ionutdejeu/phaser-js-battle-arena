import 'phaser';
import { scan } from 'rxjs';

export class AlignGrid {
    cw:number;
    ch:number;
    graphics:Phaser.GameObjects.Graphics;
    scene:Phaser.Scene
    constructor(scene:Phaser.Scene, cols = 3, rows = 3) {
       
        //cw cell width is the parent width divided by the number of columns
        this.cw = scene.scale.width / cols;
        //ch cell height is the parent height divided the number of rows
        this.ch = scene.scale.height / rows;
        //scene.add.existing();
        this.scene = scene;
        this.graphics = this.scene.add.graphics({
            x:0,
            y:0
        });
        this.graphics.setDepth(100);
        this.graphics.setScrollFactor(0,0);
        this.graphics.lineStyle(10, 0xff0000, 1);
        this.graphics.fillStyle(10, 0xff0000);

    }
    //place an object in relation to the grid
    placeAt(xx, yy, obj) {
        //calculate the center of the cell
        //by adding half of the height and width
        //to the x and y of the coordinates
        var x2 = this.cw * xx + this.cw / 2;
        var y2 = this.ch * yy + this.ch / 2;
        console.log('h',obj.displayHeight,'w',obj.displayWidth);
        obj.x = x2 -obj.displayHeight/2;
        obj.y = y2 -obj.displayWidth/2;
        //Phaser.Display.Align.In.Center(obj,this.scene,x2,y2)
        console.log(obj.x,obj.y);
    
        
    }
    //mostly for planning and debugging this will
    //create a visual representation of the grid
    draw() {
        //this.graphics.clear();
      
        
        this.graphics.beginPath();
        for (var i = 0; i < this.scene.scale.width; i += this.cw) {
            this.graphics.moveTo(i, 0);
            this.graphics.lineTo(i, this.scene.scale.height);
        }
        for (var i = 0; i < this.scene.scale.height; i += this.ch) {
            this.graphics.moveTo(0, i);
            this.graphics.lineTo(this.scene.scale.width, i);
        }
        this.graphics.closePath();
        this.graphics.strokePath();
    }
}