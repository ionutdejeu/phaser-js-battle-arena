import { IPlayer } from "../player/playerGroup";


export interface EnemySettingsStruct{ 
    texture:string;
    velocity:number;
    attackRangeSquared:number;
    attackSpeed:integer
}


export const EnemyStateEnum = {
    follow:"follwing",
    attack:"attacking"
}

export interface EnemyStruct {
    enabled:boolean
    settings:EnemySettingsStruct
    sprite:Phaser.Physics.Arcade.Sprite
    state:string,
    updateStateAfterTimestamp:integer
}


export const genericEnemySettings:EnemySettingsStruct ={
    texture:'random',
    velocity:10,
    attackRangeSquared:100,
    attackSpeed:500
} 

export interface IEnemyManager{
    init(poolSize:integer);
    spawnEnemy(target:IPlayer);
    update();
    spawnAtRandom(target:IPlayer);
    deactivateIndex(index:integer);
    deactivateSprite(sprite:Phaser.Physics.Arcade.Sprite);
    draw(graphics:Phaser.GameObjects.Graphics)
}


export class EnemyManager implements IEnemyManager{
    target:IPlayer;
    _scene:Phaser.Scene;
    _enemyGroups:Phaser.Physics.Arcade.Group;
    _enemyMap:Map<integer,EnemyStruct> = new Map()
    _poolSize:integer=0;

    constructor(sc:Phaser.Scene){
        this._enemyGroups = sc.physics.add.group({
            maxSize:-1,
            classType:Phaser.Physics.Arcade.Sprite,active:false
        })

        sc.anims.create({
			key:"bigBotMove",
			frames: sc.anims.generateFrameNumbers('bigBot',{
				frames:[0,1]
			}),
			frameRate: 3,
            repeat: -1,
            repeatDelay: 0,
			duration:100
		})
        this._scene = sc;

    }

    init(poolSize:integer){
        this._poolSize = poolSize;
        for(let i=0;i<poolSize;i++){
            let sprite =  this._enemyGroups.create(0,0,'bigBot',0,false,false) as Phaser.Physics.Arcade.Sprite;
            sprite.name = i.toString();
            
            let estruct:EnemyStruct  = {
                settings:genericEnemySettings,
                enabled:false,
                sprite:sprite,
                state:EnemyStateEnum.follow,
                updateStateAfterTimestamp:Date.now()
            };
            this._enemyMap.set(i,estruct);
        }
    }
    spawnAtRandom(target:IPlayer){
        var randomX = Phaser.Math.Between(0, 2*window.innerWidth*devicePixelRatio - 1);
        var randomY = Phaser.Math.Between(0, 2*window.innerHeight*devicePixelRatio - 1);
        this.target = target;
        this.spawnAt(randomX,randomY)
        
    }
    spawnEnemy(target: IPlayer,) {
        this.target = target;
    }
    
    update() {
        for(let i =0;i<this._poolSize;i++){
            if(!this._enemyMap.get(i).enabled){
                continue;
            }
            let en = this._enemyMap.get(i);
            
            let dirx = this.target.getX()- en.sprite.body.position.x;
            let diry = this.target.getY()- en.sprite.body.position.y;

            let disSq = Phaser.Math.Distance.Squared(
                this.target.getX(),
                this.target.getY(),
                en.sprite.body.position.x,
                en.sprite.body.position.y)

            en.sprite.setVelocity(dirx,diry);
            
        }
    }
    _drawAimingLines(){

    }
    draw(graphics:Phaser.GameObjects.Graphics){
        graphics.lineStyle(1, 0x00aa00);
        for(let i=0;i<this._poolSize;i++){
            let e = this._enemyMap.get(i);
            
            if(e.enabled){ 
                let l = new Phaser.Geom.Line(
                    this.target.getX(),
                    this.target.getY(),
                    e.sprite.body.x,
                    e.sprite.body.y)
                graphics.strokeLineShape(l);
            }
        }
    }

    spawnAt(x:number,y:number){
        console.log(this._enemyGroups.children);
        console.log(this._enemyMap);
        
        for(let i=0;i<this._poolSize;i++){

            if(!this._enemyMap.get(i).enabled){
                
                let en = this._enemyMap.get(i); 
                en.enabled = true;
                en.sprite.enableBody(true,x,y,true,true);
                en.sprite.body.enable = true;
                en.sprite.body.checkCollision.none = false;
                en.sprite.play('bigBotMove');
                break;
            }
        }
    }

    deactivateIndex(index:integer){
        if(!this._enemyMap.get(index).enabled){
            let en = this._enemyMap.get(index);
            en.enabled = true;
            en.sprite.setVisible(false);
            en.sprite.body.enable = true;
            en.sprite.body.checkCollision.none = false;
            //this._enemyGroups.remove(this._enemyMap.get(index));
        }
    }

    deactivateSprite(sprite:Phaser.Physics.Arcade.Sprite){
        let index = parseInt(sprite.name);
        this.deactivateIndex(index);
    }

    
    
}