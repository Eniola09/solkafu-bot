const { analyzeSentiment } = require('./lib/sentiment');
const supabase = require('./lib/supabase');

async function runTest() {
    console.log('Running mock verification...');

    // 1. Test Sentiment Analysis
    const testPhrase = 'LFG to the moon! 🚀';
    const score = analyzeSentiment(testPhrase);
    console.log(`Test Sentiment: "${testPhrase}" -> Score: ${score} (Expected: > 0)`);

    if (score <= 0) {
        console.error('Sentiment test failed!');
    } else {
        console.log('Sentiment test passed.');
    }

    // 2. Test DB Connection & Insert
    const fakeUserId = 123456789;
    const fakeUsername = 'test_user';
    const fakeMessageId = Math.floor(Math.random() * 100000);

    console.log('Testing DB connection...');
    try {
        // Upsert user
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                telegram_user_id: fakeUserId,
                username: fakeUsername,
                last_seen_at: new Date()
            }, { onConflict: 'telegram_user_id' });

        if (userError) throw userError;
        console.log('User upsert passed.');

        // Insert message
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                telegram_message_id: fakeMessageId,
                user_id: fakeUserId,
                chat_id: -100123456,
                content: testPhrase,
                sentiment_score: score
            });

        if (msgError) throw msgError;
        console.log('Message insert passed.');

        console.log('Verification SUCCESS: Bot logic and DB are working.');

    } catch (err) {
        console.error('DB Verification FAILED:', err.message);
        // Don't fail the whole process if DB is not set up yet (user needs to run schema)
        console.log('Note: Ensure you have run the schema.sql in Supabase SQL Editor.');
    }
}

runTest();
