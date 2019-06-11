// функция паузы
function toggle_pause_play(){
	if(typeof window.playing == "undefined"){
		window.playing = setInterval(play, 20);
	} else {
		clearInterval(playing);
		delete playing;
	}
}


// инициализация канваса
var canvas = document.getElementById("canvas"),
	ctx     = canvas.getContext('2d');


// обработка кликов по канвасу
canvas.addEventListener('click', function(e) {
	rectangles.forEach(function(rect){
		// проверяем для каждого прямоугольника был ли совершён по нему клик
		if (is_point_in_rectangle([e.offsetX, e.offsetY], rect.vertexes)){

			// меняем некоторые параметры прямоугольника: его цвет, цыет текста, импульс и направление вращения
			rect.color = colorArray[Math.floor(Math.random() * colorArray.length)];
			rect.text_color = colorArray[Math.floor(Math.random() * colorArray.length)];
			rect.dx = 3 * (0.5-Math.random());
			rect.dy = 3 * (0.5-Math.random());
			rect.dangle = (0.5 - Math.random()) * 5;
		}
	});
}, false);



// класс определяющий параметры простого прямоугольника и метод для его отрисовки
class SimpleRect{
	constructor(color, x, y, width, height) {
	    this.color = color;
	    this.x = x;
	    this.y = y;
	    this.width = width;
		this.height = height;
		this.render = function() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};
	}
}

// класс определяющий параметры прямоугольника с текстом и метод для его отрисовки
class TextRect extends SimpleRect {
	constructor(color, text_color, x, y, dx, dy, width, height, angle=0, dangle=0, text='') {
		super(color, x, y, width, height);
	    this.text = text;
	    this.text_color = text_color;
	    this.dx = dx;
	    this.dy = dy;
	    this.angle = angle;
	    this.dangle = dangle;
	    this.vertexes = [];
	    this.render = function() {
	    	// поворот для отрисовки с углом
	    	ctx.setTransform(1, 0, 0, 1, this.x, this.y);
			ctx.rotate(this.angle * Math.PI / 180);

			// отрисовка прямоугольника
	        ctx.fillStyle = this.color;
	        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

	        // отрисовка текста в центре прямоугольника
	        ctx.textAlign = "center";
	        ctx.textBaseline = "middle";
	        ctx.fillStyle = this.text_color;
		    ctx.font = "15pt Orbitron";
		    ctx.fillText(this.text, 0, 0);

		    // создать тени для красоты
			ctx.shadowColor = "rgba(0,0,0,0.3";
			ctx.shadowBlur = 5;

		    // возвращение в обратный "нормальный" вид
		    ctx.setTransform(1, 0, 0, 1, 0, 0);

		    // обработка координат углов, которые учитываются при коллизии
		    // она происходит здесь, чтобы для каждого прямоугольника обрабатывать только 1 раз за кадр а не 8
		    //   0-----------1		
		    //   |           |		при angle = 0, id координат вершин располагаются так
		    //   |     x     |		vertexes[1][0] - x-координата вершины с id = 1
		    //   |           |		vertexes[1][1] - y-координата вершины с id = 1
		    //   3-----------2		
		    //
			this.vertexes = [
				[	this.x + (-this.width/2)*Math.cos(this.angle*Math.PI/180) + ( this.height/2)*Math.sin(this.angle*Math.PI/180), 
					this.y + (-this.width/2)*Math.sin(this.angle*Math.PI/180) - ( this.height/2)*Math.cos(this.angle*Math.PI/180)],
				[	this.x + ( this.width/2)*Math.cos(this.angle*Math.PI/180) + ( this.height/2)*Math.sin(this.angle*Math.PI/180), 
					this.y + ( this.width/2)*Math.sin(this.angle*Math.PI/180) - ( this.height/2)*Math.cos(this.angle*Math.PI/180)],
				[	this.x + ( this.width/2)*Math.cos(this.angle*Math.PI/180) + (-this.height/2)*Math.sin(this.angle*Math.PI/180), 
					this.y + ( this.width/2)*Math.sin(this.angle*Math.PI/180) - (-this.height/2)*Math.cos(this.angle*Math.PI/180)],
				[	this.x + (-this.width/2)*Math.cos(this.angle*Math.PI/180) + (-this.height/2)*Math.sin(this.angle*Math.PI/180), 
					this.y + (-this.width/2)*Math.sin(this.angle*Math.PI/180) - (-this.height/2)*Math.cos(this.angle*Math.PI/180)],
			];
	    };
	}
}

// массив из N количества прямоугольников
// в задаче их 8 шт, но создавать каждый отдельно, давая ему имя, не имеет смысла
var rectangles = []

// заготовка из цветов в которые будут окрашены прямоугольники
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

// проверяет находится ли точка внутри прямоугольника
function is_point_in_rectangle(point, zone){

	// разбиваем прямоугольник на два треугольника и для каждого проверяем не лежит ли точка внутри
	// Написал код ниже с первого раза. Сам в шоке.
	// логика проверки описана здесь: http://www.cyberforum.ru/algorithms/thread144722.html
	// проверяем треугольник из точек: 0, 1, 2
	a = (zone[0][0] - point[0]) * (zone[1][1] - zone[0][1]) - (zone[1][0] - zone[0][0]) * (zone[0][1] - point[1]);
	b = (zone[1][0] - point[0]) * (zone[2][1] - zone[1][1]) - (zone[2][0] - zone[1][0]) * (zone[1][1] - point[1]);
	c = (zone[2][0] - point[0]) * (zone[0][1] - zone[2][1]) - (zone[0][0] - zone[2][0]) * (zone[2][1] - point[1]);
	if ((a<0 && b<0 && c<0)||(a>0 && b>0 && c>0)||(a==0 || b==0 || c==0)){
		return true;
	}

	// проверяем треугольник из точек: 0, 3, 2
	a = (zone[0][0] - point[0]) * (zone[3][1] - zone[0][1]) - (zone[3][0] - zone[0][0]) * (zone[0][1] - point[1]);
	b = (zone[3][0] - point[0]) * (zone[2][1] - zone[3][1]) - (zone[2][0] - zone[3][0]) * (zone[3][1] - point[1]);
	c = (zone[2][0] - point[0]) * (zone[0][1] - zone[2][1]) - (zone[0][0] - zone[2][0]) * (zone[2][1] - point[1]);
	if ((a<0 && b<0 && c<0)||(a>0 && b>0 && c>0)||(a==0 || b==0 || c==0)){
		return true;
	}

	// если до этого не ретёрнули значит не судьба)
	return false;
}

// проверяет коллизию между двумя прямоугольниками
function collision(rect_A, rect_B){
	is_collide = false;
	// для каждого из двух прямоугольников проверяем не лежит ли его точка внутри другого прямоугольника.
	rect_A.vertexes.forEach(function(vertex){
		if (is_point_in_rectangle(vertex, rect_B.vertexes)){
			is_collide = true;
		}
	});
	rect_B.vertexes.forEach(function(vertex){
		if (is_point_in_rectangle(vertex, rect_A.vertexes)){
			is_collide = true;
		}
	});

	// если коллизия была - хотя бы одна точка одного прямоугольника лежит внутри другого
	if (is_collide) {
		// свапаем "импульс" прямоугольников - симулируем передачу энергии
		[rect_A.dx, rect_B.dx] = [rect_B.dx, rect_A.dx];
		[rect_A.dy, rect_B.dy] = [rect_B.dy, rect_A.dy];
	}
}

// проверяем коллизию с границей канваса
function edge_collision(rect){
	// перебираем углы прямоугольника и выбираем самые крайние значения для x и y координат
	minx = Infinity;
	maxx = -Infinity;
	miny = Infinity;
	maxy = -Infinity;
	rect.vertexes.forEach(function(corner){
		minx = Math.min(minx, corner[0]);
		miny = Math.min(miny, corner[1]);
		maxx = Math.max(maxx, corner[0]);
		maxy = Math.max(maxy, corner[1]);
	});

	// проверяем эти крайние значения за каждой из сторон канваса, перенаправляем прямоугольник внутрь канваса - он не должен вылететь наружу
	if (minx < 0){
		rect.dx = Math.abs(rect.dx);
	}
	if (maxx > canvas.width){
		rect.dx = Math.abs(rect.dx) * -1;
	}
	if (miny < 0){
		rect.dy = Math.abs(rect.dy);
	}
	if (maxy > canvas.height){
		rect.dy = Math.abs(rect.dy) * -1;
	}
}

function init(){
	background = new SimpleRect("#DDD", 0, 0, 800, 600);
	canvas.width = background.width;
	canvas.height = background.height;

	// создаём 8 прямоугольников
	for (var i = 1; i <= 8; i++) {
		back_color = colorArray[Math.floor(Math.random() * colorArray.length)];
		text_color = colorArray[Math.floor(Math.random() * colorArray.length)];
		dx = 3 * (0.5-Math.random());
		dy = 3 * (0.5-Math.random());
		width = 40 + 20*Math.random();
		height = 40 + 20*Math.random();
		angle = 360*Math.random();
		dangle = (0.5 - Math.random()) * 5;

		rectangles.push(new TextRect(back_color, text_color, 80*i, 60*i, dx, dy, width, height, angle, dangle, i.toString()));
	}
	
	// запускаем прорисовку
	window.playing = setInterval(play, 20);
}

function play(){
	// отрисовываем бэк, чтобы перекрыть предыдущий кадр
	background.render();

	// проверяем коллизии между прямоугольниками
	for (var i = 0; i <= 7; i++) {
		for (var j = 1+i; j <= 7; j++) {
			collision(rectangles[i], rectangles[j]);
		}
		edge_collision(rectangles[i]);
	}

	// применяем изменения и отрисовываем каждый блок
	rectangles.forEach(function(rect) {
		rect.x += rect.dx;
		rect.y += rect.dy;
		rect.angle += rect.dangle;
		rect.render();
	});
}

init();
