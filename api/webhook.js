// api/webhook.js

const { Bot } = require('grammy');
const supabase = require('../lib/supabase');
const { analyzeSentiment } = require('../lib/sentiment');
const { handleSentimentCommand, handleMomentumCommand } = require('../lib/commands');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is unset');

const bot = new Bot(token);
let initialized = false;

// Handle regular messages
bot.on('message:text', async (ctx, next) => {
    if (ctx.message.text.startsWith('/')) return next();

    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    const sentimentScore = analyzeSentiment(text);

    try {
        // Upsert user
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                telegram_user_id: userId,
                username: username,
                last_seen_at: new Date()
            }, { onConflict: 'telegram_user_id' });
        if (userError) console.error('User upsert error:', userError);

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
        if (msgError) console.error('Message insert error:', msgError);

    } catch (err) {
        console.error('Processing message error:', err);
    }
});

// Commands
bot.command('sentiment', handleSentimentCommand);
bot.command('momentum', handleMomentumCommand);

// Vercel webhook handler
module.exports = async (req, res) => {
    try {
        // Initialize bot once per serverless instance
        if (!initialized) {
            await bot.init();
            initialized = true;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const update = JSON.parse(body);
            await bot.handleUpdate(update);
            res.status(200).json({ ok: true });
        });

    } catch (err) {
        console.error('Webhook error:', err);
        res.status(200).json({ ok: true });
    }
};
