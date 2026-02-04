// api/webhook.js

const express = require('express');
const { Bot } = require('grammy');
const supabase = require('../lib/supabase');
const { analyzeSentiment } = require('../lib/sentiment');
const { handleSentimentCommand, handleMomentumCommand } = require('../lib/commands');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is unset');

const bot = new Bot(token);

// Register commands
bot.command('sentiment', handleSentimentCommand);
bot.command('momentum', handleMomentumCommand);

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

// Express app for Render
const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/api/webhook', async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
    } catch (err) {
        console.error('Webhook error:', err);
    }
    res.status(200).json({ ok: true });
});

// Start server and bind to Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
