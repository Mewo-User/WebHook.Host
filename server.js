const express = require('express');
const crypto = require('crypto'); // Built into Node.js to generate unique IDs
const app = express();

app.use(express.json());

// A simple database stored in memory to hold everyone's webhooks
const userWebhooks = {};

// 1. Endpoint for users to generate a new unique webhook link
app.get('/api/create-webhook', (req, res) => {
  const uniqueId = crypto.randomBytes(4).toString('hex'); // Generates a random 8-character ID
  userWebhooks[uniqueId] = []; // Create an empty list for this user's data
  
  res.json({
    webhookId: uniqueId,
    webhookUrl: `${req.protocol}://${req.get('host')}/webhook/${uniqueId}`
  });
});

// 2. Endpoint where the webhook data actually gets sent
app.post('/webhook/:id', (req, res) => {
  const webhookId = req.params.id;

  if (!userWebhooks[webhookId]) {
    return res.status(404).send('Webhook URL not found!');
  }

  // Save the incoming data to this specific user's list
  userWebhooks[webhookId].push({
    timestamp: new Date(),
    data: req.body
  });

  res.status(200).send('Webhook received!');
});

// 3. Endpoint for users to check the messages sent to their webhook
app.get('/api/logs/:id', (req, res) => {
  const webhookId = req.params.id;
  const logs = userWebhooks[webhookId] || [];
  res.json(logs);
});

app.listen(3000, () => console.log('Server running on port 3000'));