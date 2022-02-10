canvas = document.createElement("canvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
document.body.appendChild(canvas);
let shaderScript = document.getElementById("fs").innerHTML;
let gl = canvas.getContext("webgl2");
var shaderProgram = gl.createProgram(); 

var vsScript = 
'attribute vec2 a_Position;\n'+
'void main() {\n' + 
' gl_Position = vec4(a_Position,0.0,1.0);\n'+
' }\n';

function getShader(script, type)
{
    var output = gl.createShader(type);
    gl.shaderSource(output, script);
    gl.compileShader(output);
    
    if(!gl.getShaderParameter(output, gl.COMPILE_STATUS)){
        console.error("Shader error: \n:" + gl.getShaderInfoLog(output));
        return null;
    }
    
    return output;
}

function createRectArray(x, y, w, h)
{
    return new Float32Array([
        x, y,
        x+w, y,
        x, y+h,
        x, y+h,
        x+w, y,
        x+w, y+h
    ]);
}

function initShaders()
{
    let VS = getShader(vsScript, gl.VERTEX_SHADER);
    let FS = getShader(shaderScript, gl.FRAGMENT_SHADER);

    gl.attachShader(shaderProgram,VS);
    gl.attachShader(shaderProgram,FS);	
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}


initShaders();
var a_Position  = gl.getAttribLocation(shaderProgram,'a_Position');
gl.enableVertexAttribArray(a_Position);
var TRIANGLE_VERTEX = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,TRIANGLE_VERTEX);
gl.bufferData(gl.ARRAY_BUFFER,createRectArray(-1,-1,2,2),gl.STATIC_DRAW);
gl.clearColor(0.0,0.0,0.0,0.0);

let u_res = gl.getUniformLocation(shaderProgram, "u_resolution");
let u_time = gl.getUniformLocation(shaderProgram, "u_time");
let u_mouse = gl.getUniformLocation(shaderProgram, "u_mouse");
var u_pressed = gl.getUniformLocation(shaderProgram,'u_pressed');
var u_prev = gl.getUniformLocation(shaderProgram,'u_prev');
gl.uniform1i(u_prev, 0);
var u_item = gl.getUniformLocation(shaderProgram,'u_item');
var u_size = gl.getUniformLocation(shaderProgram,'u_size');
var u_vertical = gl.getUniformLocation(shaderProgram,'u_vertical');
var item = 1;


gl.clear(gl.COLOR_BUFFER_BIT);
gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,8,0);

var prev = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, prev);
const level = 0;
const internalFormat = gl.RGBA;
const border = 0;
const format = gl.RGBA;
const type = gl.UNSIGNED_BYTE;
const data = null;
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

var mpx = 0;
var mpy = 0;
var m_pressed;

canvas.addEventListener('mousemove', (event) => {
	mpx = event.offsetX;
	mpy = canvas.height - event.offsetY;
});

canvas.addEventListener('mousedown', (event) => {
	m_pressed = 1;
    if(event.which == 2)
        item = 0;
    else
        item = selectedItemId;
});

canvas.addEventListener('mouseup', (event) => {
	m_pressed = 0;
});

var ItemSizeBar = document.getElementById("item_size");
var fpsBar = document.getElementById("time_scale");
var vertical = document.getElementById("vertical_speed");

var selectedItemId = 1;
function ChangeItem(newItemId)
{
    document.getElementById("item" + selectedItemId).className = "item";
    document.getElementById("item" + newItemId).className = "selectedItem";
    selectedItemId = newItemId;
}

t = Date.now();

function Draw() 
{
    gl.uniform2f(u_res, canvas.width, canvas.height);
    gl.uniform1f(u_time, (Date.now() - t)/1000.0);
    gl.uniform2f(u_mouse, mpx, mpy);
    gl.uniform1i(u_pressed, m_pressed);
    gl.uniform1i(u_item, item);
    gl.uniform1f(u_size, ItemSizeBar.value);
    gl.uniform1f(u_vertical, vertical.value*0.01);
    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
};

var mainLoop = setInterval(Draw, 1000/fpsBar.value);
fpsBar.addEventListener('change', (event) => {
    clearTimeout(mainLoop);
    mainLoop = setInterval(Draw, 1000/fpsBar.value);
});