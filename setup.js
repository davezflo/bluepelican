import {VisualEngine} from "/visualengine";
import {Cube} from "/shapes";

var engine = null;
var cube = null;
var cube2 = null;
var spin = 0;

export function visualSetup(canvas, window)
{
    var ctx = canvas.getContext("2d");
    ctx.canvas.width = window.innerHeight * .9;
    ctx.canvas.height = window.innerHeight  *.9;

    engine = new VisualEngine(ctx);
    
    cube = new Cube(.1, .1, .8);
    engine.addShape(cube.asShape());

    cube2 = new Cube(.3, .3, .3);
    engine.addShape(cube2.asShape());
    cube2.asShape().translateZ(20);

}

export function visualUpdate()
{
    cube2.asShape().translateZ(-spin*.1);
    cube.asShape().rotateX(spin*Math.PI/180);
    cube.asShape().rotateY(-5*spin*Math.PI/180);
    spin++;
    engine.update();
    engine.draw();
}

window.visualSetup = visualSetup;
window.visualUpdate = visualUpdate;



