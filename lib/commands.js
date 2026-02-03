const supabase = require('./supabase');
const { calculateMomentum } = require('./momentum');

async function handleSentimentCommand(ctx) {
    try {
        // Check average sentiment of last 50 messages
        const { data, error } = await supabase
            .from('messages')
            .select('sentiment_score')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        if (!data || data.length === 0) {
            return ctx.reply("No sentiment data yet! Start chatting. 🗣️");
        }

        const totalScore = data.reduce((acc, curr) => acc + curr.sentiment_score, 0);
        const average = totalScore / data.length;

        let mood = "Neutral 😐";
        if (average > 0.2) mood = "Bullish 🐂";
        if (average > 0.5) mood = "Euphoric 🚀";
        if (average < -0.2) mood = "Bearish 🐻";
        if (average < -0.5) mood = "FUD Alert ⚠️";

        await ctx.reply(`Current Community Vibe: ${mood}\n(Based on last ${data.length} messages)`);
    } catch (err) {
        console.error(err);
        await ctx.reply("Could not fetch sentiment. 😵");
    }
}

async function handleMomentumCommand(ctx) {
    try {
        const status = await calculateMomentum();
        await ctx.reply(`Community Activity: ${status}`);
    } catch (err) {
        console.error(err);
        await ctx.reply("Could not check momentum. 😵");
    }
}

module.exports = {
    handleSentimentCommand,
    handleMomentumCommand
};
