$(function(){

a = new AnimationManager("jane/idle.png")

a.registerCharacter("jane", {
	selector:".jane",
	startY:0,
	size:"50x70",
	position:{ top:"30%", left:"20%"},
	styles:{transform:"scale(4)"}
});

a.characters.jane.registerAnimation("idle", {index:0, frames:4, duration:800})

});