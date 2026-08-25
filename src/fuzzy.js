function scoreItem(target, query) {
  if (!target || !query) return 0;

  const t = target.toLowerCase();
  const q = query.toLowerCase();
  
  const tClean = t.replace(/[^a-z0-9]/g, '');
  const qClean = q.replace(/[^a-z0-9]/g, '');

  if (!tClean || !qClean) return 0;

  if (tClean === qClean) return 1000;
  if (tClean.startsWith(qClean)) return 500 + (100 / tClean.length);

  const words = t.split(/[\s\-_/.]+/);
  for (const word of words) {
    if (word.replace(/[^a-z0-9]/g, '').startsWith(qClean)) return 400 + (50 / t.length);
  }

  if (tClean.includes(qClean)) return 200 + (50 / tClean.length);

  let score = 0;
  let tIdx = 0;
  let consecutiveMatches = 0;
  let errors = 0; 
  
  const MAX_ERRORS = Math.floor(qClean.length / 3); 

  for (let qIdx = 0; qIdx < qClean.length; qIdx++) {
    const char = qClean[qIdx];
    let found = false;

    for (let searchIdx = tIdx; searchIdx < tClean.length; searchIdx++) {
      if (tClean[searchIdx] === char) {
        found = true;
        
        if (searchIdx === tIdx) {
          consecutiveMatches++;
          score += 15 + (consecutiveMatches * 5); 
        } else {
          consecutiveMatches = 0;
          score += 5;
          score -= (searchIdx - tIdx);
        }
        tIdx = searchIdx + 1;
        break;
      }
    }

    if (!found) {
      consecutiveMatches = 0;
      errors++;
      score -= 15;
      
      if (errors > MAX_ERRORS) return 0; 
    }
  }

  return score > 0 ? score - (tClean.length * 0.1) : 0;
}