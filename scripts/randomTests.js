function Fraction(op) {
	if (op.result === undefined) {
		this.denominator = op.denominator;
		this.numerator = op.numerator;
		this.result = this.denominator / this.numerator;
	}
	if (op.numerator === undefined) {
		this.denominator = op.denominator;
		this.result = op.result;
		this.numerator = this.result * this.denominator;
	}
	if (op.denominator === undefined) {
		this.result = op.result;
		this.numerator = op.numerator;
		this.denominator = this.numerator / this.result;
	}

	this.toString = function() { return this.numerator + "/" + this.denominator; };
}

function Power(base, exponent) {
	this.base = base;
	this.exponent = exponent;
	this.result = Math.pow(this.base, this.exponent);
	this.toString = function() { return this.base + "^" + this.exponent;};
}

function Integer(value) {
	this.result = value;
	this.toString = function() { return this.result.toString(); }
}

var possibleFractions = [null];
var possiblePowers = [null]; // creating these arrays with null at index 0 because there is no difficulty 0
var possibleNumbers = [null];

for (var difficulty = 1; difficulty < 5/*5 difficulties*/; difficulty++) {
	possibleFractions.push([]);
	possiblePowers.push([]);
	possibleNumbers.push([]);
	switch (difficulty) {
		case 1: //ez mode
			for (var k = 1; k <= 50; k++) {
				possibleNumbers[difficulty].push(new Integer(k));
			}
			break;
		case 4:
			// generate the multiplication-table fractions and add to difficulty 1
			for (var d = 1; d <= 12; d++) {
				for (var r = 1; r <= 12; r++) {
					possibleFractions[difficulty].push(new Fraction({denominator:d, result:r}));
				}
			}
			// generate only squared powers of numbers 1-12
			for (var b = 1; b <= 12; b++) {
				possiblePowers[difficulty].push(new Power(b, 2));
			}

			// generate all integers 1-100
			for (var i = 1; i <= 100; i++) {
				possibleNumbers[difficulty].push(new Integer(i));
			}
			break;
	}

}

function getRandomExpression(diff) {
	var r = Math.random();
	var choice;

	if (diff == 4) {
		if (r <= 0.1) // 10% chance
			choice = math.pickRandom(possiblePowers[diff]);
		else if (r <= 0.5) // 40% chance (not <= .1 but still <= .5)
			choice = math.pickRandom(possibleFractions[diff]);
		else
			choice = math.pickRandom(possibleNumbers[diff]);
	}
	else if (diff === 1) {
		choice = math.pickRandom(possibleNumbers[diff]);
	}
	return choice;
}

