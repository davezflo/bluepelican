import {Matrix4x4, Vector4x1} from "/maths";

export class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vector = new Vector4x1(x, y, z, 1);
        this.drawLevel = 1;
    }

    prepare(engine) {
        engine.points.push(this);
        this.vector = new Vector4x1(this.x, this.y, this.z, 1);
    }

    applyTransform(m) {
        this.vector.multiply(m);
    }

    minus(otherPoint)
    {
        var returnvalue = new Point(this.vector.a1-otherPoint.vector.a1, this.vector.a2-otherPoint.vector.a2, this.z-otherPoint.vector.a3);
        return returnvalue;
    }

    distance(otherPoint)
    {
        return Math.sqrt((this.vector.a1-otherPoint.vector.a1)*(this.vector.a1-otherPoint.vector.a1)+
                        (this.vector.a2-otherPoint.vector.a2)*(this.vector.a2-otherPoint.vector.a2)+
                        (this.vector.a3-otherPoint.vector.a3)*(this.vector.a3-otherPoint.vector.a3));
    }

    cross(otherPoint)
    {
        var x = this.vector.a2*otherPoint.vector.a3-this.vector.a3*otherPoint.vector.a2;
        var y = this.vector.a3*otherPoint.vector.a1-this.vector.a1*otherPoint.vector.a3;
        var z = this.vector.a1*otherPoint.vector.a2-this.vector.a2*otherPoint.vector.a1;
        return new Point(x, y, z);
    }

    dot(otherPoint)
    {
        return this.vector.a1*otherPoint.vector.a1+this.vector.a2*otherPoint.vector.a2+this.vector.a3*otherPoint.vector.a3;
    }

    X(engine)
    { 
        return engine.projection.X(this.vector.a1, this.vector.a2, this.vector.a3) * engine.dim("x");
    }

    Y(engine)
    { 
        return engine.projection.Y(this.vector.a1, this.vector.a2, this.vector.a3) * engine.dim("y");
    }
    Z(engine)
    { 
        return engine.projection.Z(this.vector.a1, this.vector.a2, this.vector.a3);
    }
}

class Shape {
    constructor() { 
        this.verticies = [];
        this.faces = [];
        this.faceColors = [];
        this.faceNormal = [];
        this.faceCenters = [];
        this.shapeCenter = null;
        this.xMatrix = new Matrix4x4
           (1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1);
        this.yMatrix = new Matrix4x4
        (1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1);
        this.zMatrix = new Matrix4x4
        (1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1);
        this.translateMatrix = new Matrix4x4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
    }

    setCenter(center)
    {
        this.shapeCenter = center;
    }

    _computeFaceNormal(index) 
    {
        var a = this.verticies[this.faces[index][0]];
        var b = this.verticies[this.faces[index][1]];
        var c = this.verticies[this.faces[index][2]];
        var aa = b.minus(a);
        var bb = c.minus(a);
        var normal = aa.cross(bb);
        this.faceNormal[index] = normal;
    }

    _computeFaceCenter(index)
    {
        var a = this.verticies[this.faces[index][0]];
        var b = this.verticies[this.faces[index][1]];
        var c = this.verticies[this.faces[index][2]];
        
        var xx = a.vector.a1 + b.vector.a1 + c.vector.a1;
        var yy = a.vector.a2 + b.vector.a2 + c.vector.a2;
        var zz = a.vector.a3 + b.vector.a3 + c.vector.a3;

        this.faceCenters[index] = new Point(xx/3, yy/3, zz/3);
    }

    defineFace(points, color="#000000")
    {
        this.faces.push(points);
        this.faceColors.push(color);
        this.faceNormal.push(new Point(0,0,0));
        this.faceCenters.push(new Point(0,0,0));
    }

    addVerticies(a)
    {
        a.forEach(item => this.verticies.push(item));
    }

    rotateX(theta) {
        this.xMatrix.rotateX(theta);
    }
    rotateY(theta) {
        this.yMatrix.rotateY(theta);
    }
    rotateZ(theta) {
        this.zMatrix.rotateZ(theta);
    }
    translateX(distance) {
        this.translateMatrix.a4 = distance;
    }
    translateY(distance) {
        this.translateMatrix.b4 = distance;
    }
    translateZ(distance) {
        this.translateMatrix.c4 = distance;
    }

    apply(engine) {
        this.verticies.forEach(x => {
            x.prepare(engine);
            x.applyTransform(this.xMatrix);
            x.applyTransform(this.yMatrix);
            x.applyTransform(this.zMatrix);
            x.applyTransform(this.translateMatrix);
        }, engine, this.xMatrix, this.yMatrix, this.zMatrix, this.translateMatrix);
        this.faces.forEach((index, i) => this._computeFaceNormal(i));
        this.faces.forEach((index, i) => this._computeFaceCenter(i));

        if(this.shapeCenter != null) {
            this.shapeCenter.prepare(engine);
            this.shapeCenter.applyTransform(this.xMatrix);
            this.shapeCenter.applyTransform(this.yMatrix);
            this.shapeCenter.applyTransform(this.zMatrix);
            this.shapeCenter.applyTransform(this.translateMatrix);
            engine.projection.setScalingFactor(1/(this.shapeCenter.vector.a3-engine.projection.cameraZ));
        }
    }

    prepare(engine, returnArray) {
        const returnSet = this.faces.map((face, faceIndex) => {
            const center = this.faceCenters[faceIndex];

            var distance = center.distance(engine.projection.eye());
  
            const shape = this;
            return { distance, faceIndex, shape };
        });

        returnSet.forEach((item) => {
            returnArray.push([item.distance, { distance: item.distance, shape: item.shape, faceIndex: item.faceIndex }]);
        });
    }

    drawFace(engine, faceIndex) {
        var face = this.faces[faceIndex];
        engine.ctx.beginPath();
        var start = true;
        face.forEach(async function(index) {
            var x = this.verticies[index].X(engine);
            var y = this.verticies[index].Y(engine);
            if(start) {
                start = false;
                engine.ctx.moveTo(x, y);
            }
            else {
                engine.ctx.lineTo(x, y);
            }
        }, this, engine, start, faceIndex);
        
        engine.ctx.closePath();
        
        if(engine.paint) {
            var center = this.faceCenters[faceIndex];
            var eye = engine.projection.eye();
            var viewVector = center.minus(eye);
            var dot = viewVector.dot(this.faceNormal[faceIndex]);
            if(Math.sign(dot) == -1) {
                engine.ctx.lineWidth = .8;
                engine.ctx.fillStyle = this.faceColors[faceIndex];
                engine.ctx.strokeStyle = this.faceColors[faceIndex];
                engine.ctx.fill();
                engine.ctx.stroke();
            }
        }   

        if(engine.wireFrame) 
        {
            var save = engine.ctx.strokeStyle;
            engine.ctx.lineWidth = 1;
            engine.ctx.strokeStyle = engine.wireFrameColor;
            engine.ctx.stroke();     
            engine.ctx.strokeStyle = save;
        }
    }
}

export class Triangle {
    constructor(a, b, c) {
        this.shape = new Shape();
        this.shape.addVerticies([a,b,c]);
        this.shape.defineFace([0,1,2]);

        var xx = a.vector.a1 + b.vector.a1 + c.vector.a1;
        var yy = a.vector.a2 + b.vector.a2 + c.vector.a2;
        var zz = a.vector.a3 + b.vector.a3 + c.vector.a3;

        this.shape.setCenter(new Point(xx/3, yy/3, zz/3));
        this.drawlevel = 1;
    }
    asShape() {return this.shape;}
}

export class Cube {
    constructor(width, length, height) {
        this.shape = new Shape();
        this.drawlevel = 1;

        var a = new Point(-length / 2, -height / 2,  -width / 2);
        var b = new Point(length / 2, -height / 2,  -width / 2);
        var c = new Point(length / 2, height / 2,  -width / 2);
        var d = new Point(-length / 2, height / 2,  -width / 2);
        
        var e = new Point(-length / 2, height / 2, width / 2);
        var f = new Point(length / 2, height / 2, width / 2);
        var g = new Point(length / 2, -height / 2,  width / 2);
        var h = new Point(-length / 2, -height / 2,  width / 2);

        this.shape.addVerticies([a, b, c, d, e, f, g, h]);
        this.shape.defineFace([0,1,2], "red");
        this.shape.defineFace([2,3,0], "red");
        this.shape.defineFace([3,4,7], "green");
        this.shape.defineFace([7,0,3], "green");
        this.shape.defineFace([4,5,6], "blue");
        this.shape.defineFace([6,7,4], "blue");
        this.shape.defineFace([0,7,6], "orange");  
        this.shape.defineFace([6,1,0], "orange");  
        this.shape.defineFace([1,6,5], "purple");
        this.shape.defineFace([5,2,1], "purple");
        this.shape.defineFace([2,5,4], "black");  
        this.shape.defineFace([4,3,2], "black");  

        this.shape.setCenter(new Point(0, 0, 0));
    }
    asShape() {return this.shape;}
}
