import {VisualEngine} from "/visualengine";
import {Cube} from "/shapes";

var engine = null;
var cube = null;
var spin = 0;

export function visualSetup(canvas, window)
{
    var ctx = canvas.getContext("2d");
    ctx.canvas.width = window.innerHeight * .9;
    ctx.canvas.height = window.innerHeight  *.9;

    engine = new VisualEngine(ctx);
    engine.setProjection("p");

    cube = new Cube(.5, .5, .5);
    engine.addShape(cube.asShape());
}

export function visualUpdate()
{
    cube.asShape().rotateX(spin*Math.PI/180);
    cube.asShape().rotateY(-5*spin*Math.PI/180);
    spin++;
    engine.update();
    engine.draw();
}

window.visualSetup = visualSetup;
window.visualUpdate = visualUpdate;



