// difficulty 1
// all use rand(min, max) function in utils.js

function randFrac1() {

	// reverse engineer the fraction to be an integer
	var MAX_RESULT = 10;
	var MAX_DENOMINATOR = 10;

	var result = rand(1, MAX_RESULT); // this is inclusive, btw

	var denominator = rand(2, MAX_DENOMINATOR);

	var numerator = denominator * result;

	console.log(numerator + "/" + denominator + " = " + result);
}

function randPower1(difficulty) {
	var MAX_POWER = difficulty + 1;
	var MAX_BASE = 20;

	var MIN_POWER = (Math.random() < 0.1) ? 0 : 1;

	var base = rand(1, MAX_BASE);
	var power = rand(MIN_POWER, MAX_POWER);

	console.log(base + "^" + power + " = " + Math.pow(base, power));
}

function chance(percent) {
	return Math.random() <= percent;
}