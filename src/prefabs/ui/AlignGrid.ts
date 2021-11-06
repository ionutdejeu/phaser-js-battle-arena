import 'phaser';
import { UIBlock } from './UiBlock';

export class AlignGrid {
    cw:number;
    ch:number;
    h:number;
    w:number;
    graphics:Phaser.GameObjects.Graphics;
    scene:Phaser.Scene

    constructor(scene:Phaser.Scene, cols = 3, rows = 3,parent?:UIBlock) {
       
        if(parent){
            this.cw = parent.displayWidth / cols;
            this.ch = parent.displayHeight / rows;
            this.h = parent.displayHeight
            this.w  = parent.displayWidth
            
        }
        else{
            //cw cell width is the parent width divided by the number of columns
            this.cw = scene.scale.width / cols;
        //ch cell height is the parent height divided the number of rows
            this.ch = scene.scale.height / rows;
            this.h = scene.scale.height;
            this.w = scene.scale.width;
        }
        //scene.add.existing();
        this.scene = scene;


    }
    //place an object in relation to the grid
    placeAt(xx, yy, obj) {
        //calculate the center of the cell
        //by adding half of the height and width
        //to the x and y of the coordinates
        var x2 = this.cw * xx + this.cw / 2;
        var y2 = this.ch * yy + this.ch / 2;
        obj.x = x2;
        obj.y = y2;
    }
    
    getCellCenterX(cellx:integer,celly:integer){
        return this.cw * cellx + this.cw / 2;
    }

    getCellCenterY(y){
        return this.ch * y + this.ch / 2;
    }

    getCellTopLeft(y){
        return this.ch * y + this.ch / 2;
    }
    //mostly for planning and debugging this will
    //create a visual representation of the grid
    draw() {
        //this.graphics.clear();
      
        this.graphics = this.scene.add.graphics({
            x:0,
            y:0
        });
        this.graphics.setScrollFactor(0,0);
        this.graphics.lineStyle(1, 0xff0000, 1);
        this.graphics.fillStyle(1, 0xff0000);

        this.graphics.beginPath();
        for (var i = 0; i < this.w; i += this.cw) {
            this.graphics.moveTo(i, 0);
            this.graphics.lineTo(i, this.h);
        }
        for (var i = 0; i < this.h; i += this.ch) {
            this.graphics.moveTo(0, i);
            this.graphics.lineTo(this.w, i);
        }
        this.graphics.strokePath();
    }
}