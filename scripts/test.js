$(function(){

a = new AnimationManager("jane/idle.png")

a.registerCharacter("jane", {
	selector:".jane",
	startY:0,
	size:"50x70",
	position:{ top:"70%", left:"10%"},
	styles:{transform:"scale(2)"}
});

a.characters.jane.registerAnimation("idle", {index:0, frames:4, duration:1400})

});