const webhookHandler = require('./api/webhook');

// Mock Request and Response for Node.js/Vercel
const req = {
    body: {
        update_id: 123456,
        message: {
            message_id: 789,
            from: { id: 999, first_name: 'TestUser', username: 'testuser' },
            chat: { id: 999, type: 'private' },
            date: 1678900000,
            text: '/sentiment'
        }
    }
};

const res = {
    statusCode: 200,
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log(`Response sent: Status ${this.statusCode}, Data:`, data);
    }
};

async function test() {
    console.log('Testing webhook handler with mock request...');
    try {
        await webhookHandler(req, res);
        console.log('Webhook verification passed.');
    } catch (err) {
        console.error('Webhook verification failed:', err);
    }
}

test();
