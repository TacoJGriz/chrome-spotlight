function calculateMath(query) {
  let trimmed = query.trim().toLowerCase().replace(/x/g, '*');
  if (!/\d/.test(trimmed)) return null;

  const factMatch = trimmed.match(/^(\d+)\s*!$/);
  if (factMatch) {
    const n = parseInt(factMatch[1], 10);
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; 
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  const pctMatch = trimmed.match(/^(-?\d*\.?\d+)\s*%\s*of\s*(-?\d*\.?\d+)$/);
  if (pctMatch) return parseFloat(pctMatch[1]) * parseFloat(pctMatch[2]) / 100;

  const singlePctMatch = trimmed.match(/^(-?\d*\.?\d+)\s*%$/);
  if (singlePctMatch) return parseFloat(singlePctMatch[1]) / 100;

  const mathMatch = trimmed.match(/^(-?\d*\.?\d+)\s*(%?)\s*([-+*/^]|\*\*)\s*(-?\d*\.?\d+)\s*(%?)$/);
  if (mathMatch) {
    let a = parseFloat(mathMatch[1]);
    if (mathMatch[2] === '%') a = a / 100;
    const op = mathMatch[3];
    let b = parseFloat(mathMatch[4]);
    if (mathMatch[5] === '%') b = b / 100;
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : null;
      case '^': case '**': return Math.pow(a, b);
    }
  }
  return null; 
}