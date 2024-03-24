import {DistortionlessPerspectiveProjection, PerspectiveProjection} from "/projections";

export var PSNONE = 0;
export var PSFILL = 1;
export var PSSTROKE = 2;
export var PSBOTH = 3;

export class VisualEngine
{
    constructor(ctx)
    {
        this.ctx = ctx;
        this.visiblePoints = true;
        this.pointStroke = "#000000";
        this.pointFill = "#FFFF00";
        this.pointStyle = PSFILL;
        this.paint = true;
        this.pointRadius = .005;
        
        this.wireFrame = false;
        this.wireFrameColor = "#000000";

        this.defaultClear = "#FDFDFD";
        this.defaultFill = "#000000";

        this.saveStroke = "";
        this.saveFill = "";
        this.saveAlpha = 1.0;     
        this.shapes = [];
        this.points = [];
        this.projection = new DistortionlessPerspectiveProjection();
    }

    saveStyles()
    {
        this.saveAlpha = this.ctx.globalAlpha;
        this.saveStroke = this.ctx.strokeStyle;
        this.saveFill = this.ctx.fillStyle;
    }

    restoreStyles()
    {
        this.ctx.globalAlpha = this.saveAlpha;
        this.ctx.strokeStyle = this.saveStroke;
        this.ctx.fillStyle = this.saveFill;
    }

    setProjection(projectionType)
    {
        if(projectionType == "dp")
            this.projection = new DistortionlessPerspectiveProjection();
        else if(projectionType == "p")
            this.projection = new PerspectiveProjection();
    }

    addShape(shape)
    {
        this.shapes.push(shape);
    }

    removeShape(shape)
    {
        this.shapes = this.shapes.filter(s => s != shape);
    }

    dim(axis)
    {
        if(axis == "x") return this.width();
        else if(axis == "y") return this.height();
        else if(axis == "small") {
            if(this.width() < this.height()) return this.width();
            else return this.height();
        }
    }

    width()
    {
        return this.ctx.canvas.width;
    }

    height()
    {
        return this.ctx.canvas.height;
    }

    update()
    {
        this.projection.apply(this);
        this.points = [];
        this.shapes.forEach(x => x.apply(this));
    }

    drawPoints(points)
    {
        points.forEach(p => this.drawPoint(p.X(this), p.Y(this), p.Z(this)));
    }

    drawPoint(x, y, z)
    {
        var style = this.ctx.fillStyle;
        var stStyle = this.ctx.strokeStyle;
        if(this.pointStyle & PSFILL)
            this.ctx.fillStyle = this.pointFill;
        if(this.pointStyle & PSSTROKE)
            this.ctx.strokeStyle = this.pointStroke;

        this.ctx.beginPath();
        this.ctx.arc(x, y, z*this.dim("small")*this.pointRadius, 0, 2 * Math.PI);
        
        if(this.pointStyle & PSFILL)
            this.ctx.fill();
        if(this.pointStyle & PSSTROKE)
            this.ctx.stroke();
        
        this.ctx.fillStyle = style;
        this.ctx.strokeStyle = stStyle;
    }

    draw()
    {
        const drawLayers = 5;
        this.ctx.fillStyle = this.defaultClear;
        this.ctx.fillRect(0,0, this.width(), this.height());
        this.ctx.strokeRect(5,5,this.width()-5, this.height()-5);
        this.ctx.fillStyle = this.defaultFill;
        var drawLevel = 0;
        for(drawLevel=0;drawLevel<drawLayers;drawLevel++) {
            var items = this.shapes.filter(x => x.drawLevel == drawLevel);
            items.forEach(x => x.draw(this));
        }
        
        if(this.visiblePoints) {
            this.drawPoints(this.points);
        }
    }
    
}
