

// инициализация канваса
var canvas = document.getElementById("canvas"),
	ctx     = canvas.getContext('2d');



// класс определяющий параметры простого прямоугольника и метод для его отрисовки
class SimpleRect{
	constructor(color, x, y, width, height) {
	    this.color = color;
	    this.x = x;
	    this.y = y;
	    this.width = width;
		this.height = height;
		this.draw = function() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
	}
}

// класс определяющий параметры прямоугольника с текстом и метод для его отрисовки
class TextRect extends SimpleRect {
	constructor(color, text_color, x, y, dx, dy, width, height, text='') {
		super(color, x, y, width, height);
	    this.text = text;
	    this.text_color = text_color;
	    this.dx = dx;
	    this.dy = dy;

	    this.draw = function() {
	        ctx.fillStyle = this.color;
	        ctx.fillRect(this.x, this.y, this.width, this.height);

	        ctx.textAlign = "center";
	        ctx.textBaseline = "middle";
	        ctx.fillStyle = this.text_color;
		    ctx.font = "Bold 15pt Arial";
		    ctx.fillText(this.text, this.x+this.width/2, this.y+this.height/2);
	    };
	}
}

var rectangles = []

// проверяем коллизию между двумя прямоугольниками
function collision(rect_A, rect_B){
	if (rect_A.y+rect_A.height > rect_B.y && rect_A.y < rect_B.y+rect_B.height && rect_A.x+rect_A.width > rect_B.x && rect_A.x < rect_B.x+rect_B.width) {
		rect_A.dy *= -1;
		rect_B.dy *= -1;
		rect_A.dx *= -1;
		rect_B.dx *= -1;
	}
}

// проверяем коллизию с границей канваса
function edge_collision(rect){
	if (rect.x < 0){
		rect.dx = Math.abs(rect.dx);
	}
		if (rect.x+rect.width > canvas.width){
		rect.dx = Math.abs(rect.dx) * -1;
	}
	if (rect.y < 0){
		rect.dy = Math.abs(rect.dy);
	}
	if (rect.y+rect.height > canvas.height){
		rect.dy = Math.abs(rect.dy) * -1;
	}
}

function init(){
	background = new SimpleRect("#DDD", 0, 0, 800, 600);
	canvas.width = background.width;
	canvas.height = background.height;

	var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
					  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
					  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
					  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
					  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
					  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
					  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
					  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
					  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
					  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

	for (var i = 1; i <= 8; i++) {
		// pick color
		back_color = colorArray[Math.floor(Math.random() * colorArray.length)];
		text_color = colorArray[Math.floor(Math.random() * colorArray.length)];

		dx = Math.random();
		dy = Math.random();
		sizex = 40 + 20*Math.random();
		sizey = 40 + 20*Math.random();

		rectangles.push(new TextRect(back_color, text_color, 80*i, 275, dx, dy, sizex, sizey, i.toString()));
	}

	setInterval(play, 20);
}

function play(){
	// отрисовываем бэк, чтобы перекрыть предыдущий кадр
	background.draw();

	// проверяем коллизии между прямоугольниками
	for (var i = 0; i <= 7; i++) {
		for (var j = 1+i; j <= 7; j++) {
			collision(rectangles[i], rectangles[j]);
		}
		edge_collision(rectangles[i]);
	}

	// применяем dx и dy и отрисовываем каждый блок
	rectangles.forEach(function(rect) {
		rect.x += rect.dx;
		rect.y += rect.dy;
		rect.draw();
	});
}

init();