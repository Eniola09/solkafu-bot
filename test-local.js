const { Bot } = require('grammy');
require('dotenv').config();
const { analyzeSentiment } = require('./lib/sentiment');
const { handleSentimentCommand, handleMomentumCommand } = require('./lib/commands');
const supabase = require('./lib/supabase');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error("Error: TELEGRAM_BOT_TOKEN is missing in .env");
    process.exit(1);
}

const bot = new Bot(token);

// Middleware to log all updates
bot.use(async (ctx, next) => {
    console.log(`Update received: ${ctx.update.update_id}`);
    await next();
});

// Commands
bot.command('sentiment', handleSentimentCommand);
bot.command('momentum', handleMomentumCommand);

// Message Handler (Non-Command)
bot.on('message:text', async (ctx) => {
    // Skip commands (already handled by bot.command if placed before, but here 'message:text' catches everything unless filtered)
    // Actually grammy 'command' middleware consumes if matched.
    // But let's be safe.
    if (ctx.message.text.startsWith('/')) return;

    const text = ctx.message.text;
    const sentimentScore = analyzeSentiment(text);
    console.log(`Received message: "${text}" | Sentiment: ${sentimentScore}`);

    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const chatId = ctx.chat.id;

    try {
        // Upsert user
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                telegram_user_id: userId,
                username: username,
                last_seen_at: new Date()
            }, { onConflict: 'telegram_user_id' });

        if (userError) console.error('Error upserting user:', userError);

        // Insert message
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                telegram_message_id: ctx.message.message_id,
                user_id: userId,
                chat_id: chatId,
                content: text,
                sentiment_score: sentimentScore
            });

        if (msgError) console.error('Error inserting message:', msgError);
        else console.log('Message saved to DB.');

    } catch (err) {
        console.error('Error processing message:', err);
    }
});

bot.catch((err) => {
    console.error('Bot error:', err);
});

console.log('Starting local bot instance...');
bot.start();
