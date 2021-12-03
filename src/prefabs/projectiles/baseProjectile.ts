
export interface ProjectileSettings{ 
    airTimeInMs:integer;
    explosionDurationInMs:integer;
}

export interface ProjectileTarget{
    followSprite?:Phaser.Physics.Arcade.Sprite
    originX:number,
    originY:number,
    directionX?:number,
    directionY?:number,
    absolutePosX?:number,
    absolutePosY?:number
}

export const projectileVerticalVector = new Phaser.Math.Vector2(1,0);
export interface BaseProjectile{
    projectileSprite:Phaser.Physics.Arcade.Sprite;
    explosionSprite:Phaser.Physics.Arcade.Sprite;
    settings:ProjectileSettings;
    reset(t:ProjectileTarget);
    disable();
    draw(graphics:Phaser.GameObjects.Graphics);
    getX();
    getY();
}

export interface Path { 
    t:number,
    vec:Phaser.Math.Vector2
}


export class BaseObjectPool<T extends BaseProjectile> { 
    private activeList: Array<T>;
    private reserveList: Array<T>;
    private numberActive: number;
    private numberReserved: number;

    constructor(objects:T[], reserve: number = 5)
    {
        this.activeList = new Array<T>();
        this.reserveList = new Array<T>();

        this.reserveList = objects;

        this.numberActive = 0;
        this.numberReserved = objects.length;
    }

    public getGameObject(): T
    {
        if(this.numberReserved>0){
            const gameObject = this.reserveList.pop();
            this.numberReserved--;
    
            this.activeList.push(gameObject);
            this.numberActive++;
            return gameObject;
        }else{
            return this.activeList[0];
        }
        
    }
 
    public returnGameObject(gameObject: T)
    {
        // Get the index of the gameObject in the active list:
        const index = this.activeList.indexOf(gameObject);

        if(index >= 0)
        {
            // Splice the list around the element to remove.
            // Splice can be an expensive operation, which is why
            // I would use a custom collection in a real scenario:
            this.activeList.splice(index, 1);
            this.numberActive--;
 
            // Add it to the reserve:
            this.reserveList.push(gameObject);
            this.numberReserved++;
        }

    }

    drawActiveObjects(graphics:Phaser.GameObjects.Graphics){
        for(let i=0;i<this.numberActive;i++){

            this.activeList[i].draw(graphics);
        }
    }


}



