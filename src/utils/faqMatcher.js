/**
 * Simple FAQ matching logic.
 * Tokenizes the user question and checks for keyword overlap and basic similarity.
 */

function matchFaq(userQuestion, faqs) {
  if (!faqs || faqs.length === 0) return null;

  const userTokens = tokenize(userQuestion);
  
  let bestMatch = null;
  let highestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    
    // Keyword matching
    if (faq.keywords) {
      const keywords = faq.keywords.split(',').map(k => k.trim().toLowerCase());
      for (const keyword of keywords) {
        if (userQuestion.toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
    }

    // Question content matching
    const faqTokens = tokenize(faq.question);
    const overlap = userTokens.filter(token => faqTokens.includes(token));
    score += overlap.length;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  // Threshold to avoid garbage matches
  return highestScore > 0 ? bestMatch : null;
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 2); // Filter out short words like 'a', 'to', 'is'
}

module.exports = { matchFaq };
