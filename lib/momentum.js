const supabase = require('./supabase');

async function calculateMomentum() {
    // Get count of messages in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fifteenMinutesAgo);

    if (error) {
        console.error('Error calculating momentum:', error);
        return 'Unknown';
    }

    const msgCount = count || 0;
    // Simple heuristic for momentum based on 15 min volume
    if (msgCount > 50) return 'Exploding 🤯';
    if (msgCount > 20) return 'Hot 🔥';
    if (msgCount > 5) return 'Rising 📈';
    return 'Calm ☕';
}

module.exports = { calculateMomentum };
