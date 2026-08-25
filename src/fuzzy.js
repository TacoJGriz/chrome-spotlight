function scoreItem(target, query) {
  if (!target || !query) return 0;
  const t = target.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 500 + (100 / t.length);

  const words = t.split(/[\s\-_/.]+/);
  for (const word of words) {
    if (word.startsWith(q)) return 400 + (50 / t.length);
  }

  if (t.includes(q)) return 200 + (50 / t.length);

  let score = 0, tIdx = 0, qIdx = 0, consecutiveMatches = 0;
  while (tIdx < t.length && qIdx < q.length) {
    if (t[tIdx] === q[qIdx]) {
      qIdx++; consecutiveMatches++;
      score += 10 + (consecutiveMatches * 5); 
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }
  if (qIdx === q.length) return score - (t.length * 0.1); 
  return 0; 
}