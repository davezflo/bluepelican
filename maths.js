

var tolerance = 0.001;
function compareFloats(a, b) {
    if(Math.abs(a-b) <= tolerance)
        return true;
    else
        return false;
}


class Lerper {
    constructor(v1, v2, time)
    {
        this.v1 = v1;
        this.v2 = v2;
        this.time = time;
        this.at = 0;
        this.ticks = 0;
    }

    adjustTarget(delta)
    {
        this.ticks = 0;
        this.at = 0;
        this.v1.a1 = this.v2.a1;
        this.v1.a2 = this.v2.a2;
        this.v1.a3 = this.v2.a3;
        this.v2.a1 += delta.x;
        this.v2.a2 += delta.y;
        this.v2.a3 += delta.z;
        return this.v2;
    }

    done()
    {
        var done = false;
        done = (this.ticks == this.time ||
        compareFloats(this.v1.a1, this.v2.a1) &&
        compareFloats(this.v1.a2, this.v2.a2) &&
        compareFloats(this.v1.a3, this.v2.a3));

        return done;
    }

    step()
    {
	if(this.done()) return;
        this.at += 1/this.time;
        this.v1.a1 = this.v1.a1 * (1-this.at) + this.v2.a1 * this.at;
        this.v1.a2 = this.v1.a2 * (1-this.at) + this.v2.a2 * this.at;
        this.v1.a3 = this.v1.a3 * (1-this.at) + this.v2.a3 * this.at;
        this.ticks += 1;
        return this.v1;
    }
}

class Vector4x1 {
    constructor(a1, a2, a3, a4)
    {
        this.a1 = a1;
        this.a2 = a2;
        this.a3 = a3;
        this.a4 = a4;
    }

    //acts like this = m*this
    //caching presumes that the same matrix is used for transformations
    multiply(m)
    {
        var x11 = m.a1*this.a1+m.b1*this.a2+m.c1*this.a3+m.d1*this.a4; 
        var x21 = m.a2*this.a1+m.b2*this.a2+m.c2*this.a3+m.d2*this.a4; 
        var x31 = m.a3*this.a1+m.b3*this.a2+m.c3*this.a3+m.d3*this.a4;     
        
        this.a1 = x11+m.a4;
        this.a2 = x21+m.b4;
        this.a3 = x31+m.c4;
    }
}

class Matrix4x4 {
    constructor(a1, b1, c1, d1, 
                a2, b2, c2, d2, 
                a3, b3, c3, d3, 
                a4, b4, c4, d4)
    {
        this.a1 = a1;   this.b1 = b1;   this.c1 = c1;   this.d1 = d1;
        this.a2 = a2;   this.b2 = b2;   this.c2 = c2;   this.d2 = d2;
        this.a3 = a3;   this.b3 = b3;   this.c3 = c3;   this.d3 = d3;
        this.a4 = a4;   this.b4 = b4;   this.c4 = c4;   this.d4 = d4;
        this.xTheta = NaN;
        this.yTheta = NaN;
        this.zTheta = NaN;
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    rotateX(theta)
    {
        if(this.xTheta != theta) {
        
            this.xTheta = theta;
            var c = Math.cos(theta);
            var s = Math.sin(theta);
            this.a1 = 1;   this.b1 = 0;   this.c1 = 0;   this.d1 = 0;
            this.a2 = 0;   this.b2 = c;   this.c2 = -s;   this.d2 = 0;
            this.a3 = 0;   this.b3 = s;   this.c3 = c;   this.d3 = 0;
        }
    }
    rotateY(theta)
    {
        if(this.yTheta != theta) {

            this.yTheta = theta;
            var c = Math.cos(theta);
            var s = Math.sin(theta);
            this.a1 = c;   this.b1 = 0;   this.c1 = s;   this.d1 = 0;
            this.a2 = 0;   this.b2 = 1;   this.c2 = 0;   this.d2 = 0;
            this.a3 = -s;   this.b3 = 0;   this.c3 = c;   this.d3 = 0;
        }
    }
    rotateZ(theta)
    {
        if(this.zTheta != theta) {

            this.zTheta = theta;
            var c = Math.cos(theta);
            var s = Math.sin(theta);
            this.a1 = c;   this.b1 = -s;   this.c1 = 0;   this.d1 = 0;
            this.a2 = s;   this.b2 = c;   this.c2 = 0;   this.d2 = 0;
            this.a3 = 0;   this.b3 = 0;   this.c3 = 1;   this.d3 = 0;
        }
    }
    translateX(x) {
        this.a4 = x;
    }
    translateY(y) {
        this.b4 = y;
    }
    translateZ(z) {
        this.c4 = z;
    }
   
    //acts like this = m*this
    multiply(m)
    {
        var x11 = m.a1*this.a1+m.b1*this.a2+m.c1*this.a3+m.d1*this.a4; 
        var x12 = m.a1*this.b1+m.b1*this.b2+m.c1*this.b3+m.d1*this.b4; 
        var x13 = m.a1*this.c1+m.b1*this.c2+m.c1*this.c3+m.d1*this.c4; 
        var x14 = m.a1*this.d1+m.b1*this.d2+m.c1*this.d3+m.d1*this.d4;
        
        var x21 = m.a2*this.a1+m.b2*this.a2+m.c2*this.a3+m.d2*this.a4; 
        var x22 = m.a2*this.b1+m.b2*this.b2+m.c2*this.b3+m.d2*this.b4; 
        var x23 = m.a2*this.c1+m.b2*this.c2+m.c2*this.c3+m.d2*this.c4; 
        var x24 = m.a2*this.d1+m.b2*this.d2+m.c2*this.d3+m.d2*this.d4;
        
        var x31 = m.a3*this.a1+m.b3*this.a2+m.c3*this.a3+m.d3*this.a4; 
        var x32 = m.a3*this.b1+m.b3*this.b2+m.c3*this.b3+m.d3*this.b4; 
        var x33 = m.a3*this.c1+m.b3*this.c2+m.c3*this.c3+m.d3*this.c4; 
        var x34 = m.a3*this.d1+m.b3*this.d2+m.c3*this.d3+m.d3*this.d4;
        
        var x41 = m.a4*this.a1+m.b4*this.a2+m.c4*this.a3+m.d4*this.a4; 
        var x42 = m.a4*this.b1+m.b4*this.b2+m.c4*this.b3+m.d4*this.b4; 
        var x43 = m.a4*this.c1+m.b4*this.c2+m.c4*this.c3+m.d4*this.c4; 
        var x44 = m.a4*this.d1+m.b4*this.d2+m.c4*this.d3+m.d4*this.d4;
    
        this.a1 = x11;   this.b1 = x12;   this.c1 = x13;   this.d1 = x14;
        this.a2 = x21;   this.b2 = x22;   this.c2 = x23;   this.d2 = x24;
        this.a3 = x31;   this.b3 = x32;   this.c3 = x33;   this.d3 = x34;
        this.a4 = x41;   this.b4 = x42;   this.c4 = x43;   this.d4 = x44;
    }
    
}


export {Vector4x1, Matrix4x4, Lerper}
