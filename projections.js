import {Matrix4x4, Vector4x1, Lerper} from "/maths";
import {Point} from "/shapes"; 

export class PerspectiveProjection
{
    constructor(engine)
    {
        this.engine = engine;
        this.defaultEyeZ = -4;
        this.adjustCenterX = .5;
        this.adjustCenterY = .5;
        this.orientationX = 0;
        this.orientationY = 0;
        this.orientationZ = 0;
        this.surfaceX = 0;
        this.surfaceY = 0;
        this.surfaceZ = 0;
        this.scalingFactor = 1;
        this.xMatrix = new Matrix4x4(1,0,0,0,
                                    0,1,0,0,
                                    0,0,1,0,
                                    0,0,0,1);
        this.yMatrix = new Matrix4x4(1,0,0,0,
                                    0,1,0,0,
                                    0,0,1,0,
                                    0,0,0,1);
        this.zMatrix = new Matrix4x4(1,0,0,0,
                                    0,1,0,0,
                                    0,0,1,0,
                                    0,0,0,1);
        this.orientX(0);
        this.orientY(0);
        this.orientZ(0);
        this.camera = new Point(0, 0, this.defaultEyeZ);
        this.lerper = null;
    }

    eye()
    {
        return this.camera;
    }

    reset()
    {
        this.lerper = null;
        this.camera = new Point(0, 0, this.defaultEyeZ);
    }

    orientX(x)
    {
        this.orientationx = x;
        this.xMatrix.rotateX(this.orientationx);
    }
    orientY(y)
    {
        this.orientationy = y;
        this.yMatrix.rotateY(this.orientationy);
    }
    orientZ(z)
    {
        this.orientationz = z;
        this.zMatrix.rotateZ(this.orientationz);
    }
    _compute(x, y, z)
    {
        if(this.pcache == null) {
            var vec = new Vector4x1(
                x-this.camera.x,
                y-this.camera.y,
                Math.sqrt(Math.pow(this.camera.z, 2) + Math.pow(z,2)), 1);
            vec.multiply(this.zMatrix, this.engine); 
            vec.multiply(this.yMatrix, this.engine);
            vec.multiply(this.xMatrix, this.engine); 
           
            this.pcache = new Point(this.scalingFactor*vec.a1/Math.abs(vec.a3)+
            this.adjustCenterX, 
            this.scalingFactor*vec.a2/Math.abs(vec.a3)+
            this.adjustCenterY, 
            this.scalingFactor*1/Math.abs(vec.a3));
        }
        return this.pcache;
    }
    setCameraGoalDelta(delta, time, engine) {
        var eye = this.eye();
        eye.prepare(engine);
        if(this.lerper == null) {
            var target = new Point(eye.x+delta.x, eye.y+delta.y, eye.z+delta.z);
            target.prepare(engine);
            this.lerper = new Lerper(eye.vector, target.vector, time);
	}
        else {
            this.lerper.adjustTarget(delta, time);
        }
    }

    setCameraGoal(target, time, engine) {
        var eye = this.eye();
        eye.prepare(engine);
        target.prepare(engine);
        this.lerper = new Lerper(eye.vector, target.vector, time);
    }

    apply(engine) {
        if(this.lerper != null)
        {
            if(this.lerper.done())
                this.lerper = null;
            else
            {
                var vec = this.lerper.step();
                this.camera.x = vec.a1; this.camera.y = vec.a2;
                this.camera.z = vec.a3; 
            }
        }
    }

    setScalingFactor(factor) {
  //      this.scalingFactor = factor;
    }

    getScalingFactor(factor) {
        return this.scalingFactor;
    }

    X(x, y, z)
    {
        this.pcache = null;
        var p = this._compute(x, y, z);
        return p.x;
    }
    Y(x, y, z)
    {
        var p = this._compute(x, y, z);
        return p.y;
    }
    Z(x, y, z)
    {
        var p = this._compute(x, y, z);
        return p.z;
    }
}