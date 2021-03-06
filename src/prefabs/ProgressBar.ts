import "phaser";

export class ProgressBar {
    bar:Phaser.GameObjects.Graphics;
    x:number;
    y:number;
    value:number;
    p:number;
    constructor (scene:Phaser.Scene, x:number, y:number,
        private rectangle:Phaser.Geom.Rectangle)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        
        this.x = x;
        this.y = y;
        this.value = 100;
        
        this.p = this.rectangle.width / 100;
  
        this.draw();
  
        scene.add.existing(this.bar);
    }
  
    decrease (amount:number)
    {
        this.value -= amount;
  
        if (this.value < 0)
        {
            this.value = 0;
        }
  
        this.draw();
  
        return (this.value === 0);
    }
    setValue(amount:number){
      this.value = amount;
      this.p = this.rectangle.width / this.value;
      this.draw();
      return (this.value === 0);

    }
  
    draw ()
    {
        this.bar.clear();
  
        //  BG
        this.bar.fillStyle(0x62C2CC);
        this.bar.fillRect(this.x, this.y, this.rectangle.width, this.rectangle.height+2);
  
        //  Health
  
        // this.bar.fillStyle(0xF17022);
        // this.bar.fillRect(this.x + 2, this.y + 2, this.rectangle.height-2, this.rectangle.height-2);
  
        
        if (this.value < 30)
        {
            this.bar.fillStyle(0xF17022);
        }
        else
        {
            this.bar.fillStyle(0xFDB813);
        }
  
        let d = Math.floor(this.p * this.value);
  
        this.bar.fillRect(this.x + 2, this.y + 2, d, this.rectangle.height-2);
    }
  
  }
  