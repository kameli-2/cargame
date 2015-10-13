var game = $("#game");
var car = $("#car");
var speed = 0;
var direction = Math.PI;
var toppi = 50;
var left = 50;
var condition = 1;

var dirpx = 0.2;
var speedpx = 15;
var slowdown = speedpx/10;
var maxspeed = 40;

var keyupisdown = false;
var keydownisdown = false;
var keyleftisdown = false;
var keyrightisdown = false;

var user = 1;
var interval;

var timer = 0;
var timeron = false;
var currentCheckpoint = 0;

$(document).ready(function(){
	$("#hiscores").load("save.php");
	$('#nick').val('pelaaja-'+Math.floor(Math.random()*1000));
	$('body').bind('keydown',function(e){
		if (e.which === 37) {
			keyleftisdown = true;
		}
		else if (e.which === 39) {
			keyrightisdown = true;
		}
		else if (e.which === 38) {
			keyupisdown = true;
		}
		else if (e.which === 40) {
			keydownisdown = true;
		}
	}).bind('keyup',function(e){
		if (e.which === 37) {
			keyleftisdown = false;
		}
		else if (e.which === 39) {
			keyrightisdown = false;
		}
		else if (e.which === 38) {
			keyupisdown = false;
		}
		else if (e.which === 40) {
			keydownisdown = false;
		}
	});

	interval = setInterval(moveCar, 40);

	$(document).keydown(function(e) {
		if (e.which >= 37 && e.which <= 40) e.preventDefault(); // prevent the default action (scroll / move caret)
		if (e.which == 27) {
			clearInterval(interval);
			interval = false;
		}
		if (e.which == 82) { // Reset game
			condition = 1;
			toppi = 50;
			left = 50;
			speed = 0;
			direction = Math.PI;
			timer = 0;
			timeron = false;
			currentCheckpoint = 0;
			$("#currentCondition").css("width", condition*100+"%");
			if (interval == false) interval = setInterval(moveCar, 40);
		}
	});
});

function moveCar() {
	car.css('top', toppi);
	car.css('left', left);
	car.css("transform", "rotate("+((360*direction/(2*Math.PI))-90)+"deg)");

	if (keyupisdown) speed = speed - 3*speedpx/(Math.abs(speed)+10);
	if (keydownisdown) {
		speed = speed + speedpx/10;
		if (speed > 0) speed = 0;
	}
	if (speed < 0) {
		if (keyleftisdown) direction = direction - dirpx;
		if (keyrightisdown) direction = direction + dirpx;
	}

	var y = Math.sin(direction)*speed;
	var x = Math.cos(direction)*speed;

	speed = speed/1.03;
	if (Math.abs(speed) < 0.5) speed = 0;
	toppi = toppi+y*condition;
	left = left+x*condition;
	
	// Don't cross game boundaries
	if (toppi < -5 || toppi > game.height()-car.height()+5 || left < -5 || left > game.width()-car.width()+5) {
			collision(x,y);
	}
	
	// Other collisions
	$(".collidable").each(function(){
		var collidableleft = $(this).offset().left;
		var collidabletop = $(this).offset().top;
		var collidableright = $(this).offset().left+$(this).width();
		var collidablebottom = $(this).offset().top+$(this).height();
		if (
			toppi < collidablebottom-5 &&
			toppi > collidabletop-car.height()+5 &&
			left < collidableright-5 &&
			left > collidableleft-car.width()+5
		) { // Collision is taking place
			if ($(this).hasClass("checkpoint")) checkpoint($(this).attr("id"));
			else collision(x,y);
		}
	});
				
	condition = Math.max(0, condition);

	if (car.attr('src') != 'car'+Math.floor(condition*5)*20+'.png') car.attr('src', 'car'+Math.floor(condition*5)*20+'.png');

	if (timeron) timer = timer + 40;
	var timerhtml = Math.floor(timer/100)/10 + "";
	if (timerhtml.length < 3) timerhtml = timerhtml + ".0";
	$("#timer").html(timerhtml);
}

function collision(x,y) {
	// Handle collisions
	toppi = toppi-y*condition;
	left = left-x*condition;
	speed = speed/2;
	if (speed) condition = condition - Math.pow(Math.abs(speed*condition),3)/10000;
	$("#currentCondition").css("width", condition*100+"%");
}
function checkpoint(checkpoint) {
	if (checkpoint == 'startline') {
		timeron = true;
		if (currentCheckpoint == 2) { // Full lap has been done
			$("#lastlaps ol").prepend("<li>"+$("#nick").val()+": "+$("#timer").html()+"</li>");
			$("#hiscores").load("save.php?nick="+$("#nick").val()+"&time="+timer);
			timer = 0;
		}
		currentCheckpoint = 0;
	}
	else {
		checkpoint = checkpoint.charAt(checkpoint.length-1);
		if (Math.abs(checkpoint - currentCheckpoint) == 1) currentCheckpoint = checkpoint;
	}
}
