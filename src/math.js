function calculateMath(query) {
  let expr = query.trim().toLowerCase();
  if (!expr || !/\d/.test(expr)) return null;

  expr = expr.replace(/x/g, '*');

  const pctOfMatch = expr.match(
    /^(-?(?:\d+(?:\.\d+)?|\.\d+))\s*%\s*of\s*(-?(?:\d+(?:\.\d+)?|\.\d+))$/
  );

  if (pctOfMatch) {
    return roundResult(
      parseFloat(pctOfMatch[1]) * parseFloat(pctOfMatch[2]) / 100
    );
  }

  const singlePctMatch = expr.match(
    /^(-?(?:\d+(?:\.\d+)?|\.\d+))\s*%$/
  );

  if (singlePctMatch) {
    return roundResult(parseFloat(singlePctMatch[1]) / 100);
  }

  let pos = 0;

  function skipSpaces() {
    while (pos < expr.length && /\s/.test(expr[pos])) {
      pos++;
    }
  }

  function peek() {
    skipSpaces();
    return expr[pos];
  }

  function consume(char) {
    skipSpaces();

    if (expr.startsWith(char, pos)) {
      pos += char.length;
      return true;
    }

    return false;
  }

  function parseNumber() {
    skipSpaces();

    const match = expr
      .slice(pos)
      .match(/^(?:\d+(?:\.\d*)?|\.\d+)/);

    if (!match) {
      throw new Error('Expected number');
    }

    pos += match[0].length;

    return parseFloat(match[0]);
  }

  function factorial(n) {
    if (!Number.isFinite(n)) return Infinity;

    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Invalid factorial');
    }

    if (n > 170) {
      return Infinity;
    }

    if (n === 0 || n === 1) {
      return 1;
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  }

  function parsePrimary() {
    skipSpaces();

    if (consume('(')) {
      const value = parseAddSub();

      if (!consume(')')) {
        throw new Error('Missing closing parenthesis');
      }

      return value;
    }

    return parseNumber();
  }

  function parseFactorial() {
    let value = parsePrimary();

    while (consume('!')) {
      value = factorial(value);
    }

    return value;
  }

  function parseUnary() {
    skipSpaces();

    if (consume('+')) {
      return parseUnary();
    }

    if (consume('-')) {
      return -parseUnary();
    }

    return parseFactorial();
  }

  function parsePower() {
    let value = parseUnary();

    skipSpaces();

    if (consume('**')) {
      const exponent = parsePower();
      value = Math.pow(value, exponent);
    } else if (consume('^')) {
      const exponent = parsePower();
      value = Math.pow(value, exponent);
    }

    return value;
  }

  function parseMulDiv() {
    let value = parsePower();

    while (true) {
      skipSpaces();

      if (consume('*')) {
        value *= parsePower();
      } else if (consume('/')) {
        const divisor = parsePower();

        if (divisor === 0) {
          throw new Error('Division by zero');
        }

        value /= divisor;
      } else {
        break;
      }
    }

    return value;
  }

  function parseAddSub() {
    let value = parseMulDiv();

    while (true) {
      skipSpaces();

      if (consume('+')) {
        value += parseMulDiv();
      } else if (consume('-')) {
        value -= parseMulDiv();
      } else {
        break;
      }
    }

    return value;
  }

  try {
    const result = parseAddSub();

    skipSpaces();

    if (pos !== expr.length) {
      return null;
    }

    if (typeof result !== 'number' || Number.isNaN(result)) {
      return null;
    }

    if (!Number.isFinite(result)) {
      return Infinity;
    }

    return roundResult(result);

  } catch (e) {
    return null;
  }

  function roundResult(value) {
    if (!Number.isFinite(value)) {
      return value;
    }

    return Math.round(value * 100000) / 100000;
  }
}