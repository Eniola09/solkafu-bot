// Basic sentiment analysis based on keywords and emojis

const POSITIVE_KEYWORDS = ['buy', 'moon', 'pump', 'bull', 'lfg', 'good', 'great', 'love', 'nice', 'green', 'up', 'gem'];
const NEGATIVE_KEYWORDS = ['sell', 'dump', 'bear', 'bad', 'hate', 'red', 'down', 'scam', 'rekt', 'sad', 'loss'];
const POSITIVE_EMOJIS = ['🚀', '🔥', '💎', '🌕', '📈', '😎', '💪', '🎉'];
const NEGATIVE_EMOJIS = ['📉', '🐻', '💣', '💩', '😡', '😭', '💀'];

function analyzeSentiment(text) {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let score = 0;

    // Check keywords
    for (const word of POSITIVE_KEYWORDS) {
        if (lowerText.includes(word)) score += 1;
    }
    for (const word of NEGATIVE_KEYWORDS) {
        if (lowerText.includes(word)) score -= 1;
    }

    // Check emojis
    for (const emoji of POSITIVE_EMOJIS) {
        if (text.includes(emoji)) score += 1;
    }
    for (const emoji of NEGATIVE_EMOJIS) {
        if (text.includes(emoji)) score -= 1;
    }

    // Normalize to -1, 0, 1
    if (score > 0) return 1;
    if (score < 0) return -1;
    return 0;
}

module.exports = { analyzeSentiment };
