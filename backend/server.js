const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

function createRedisClient() {
  return redis.createClient({
    socket: {
      host: 'redis-16878.c99.us-east-1-4.ec2.cloud.redislabs.com',
      port: 16878,
    },
    username: 'default',
    password: 'mDz6PTrSxxGNHJWfXJgOOJ2bOt7im9Ax',
  });
}

app.get('/', (req, res) => {
  res.send('Welcome to the Side-by-Side Picture Voting API!');
});

app.get('/api/upvotes/:imageId', async (req, res) => {
  try {
    const client = createRedisClient();
    await client.connect();
    
    const imageId = req.params.imageId;
    const upvoteCount = await client.get(imageId);

    await client.disconnect();

    if (upvoteCount === null) {
      res.status(404).json({ message: `No upvotes found for image: ${imageId}` });
    } else {
      res.status(200).json({ upvoteCount: parseInt(upvoteCount, 10) });
    }
  } catch (error) {
    console.error('Error fetching upvote count:', error);
    res.status(500).send('Error fetching upvote count');
  }
});

app.post('/api/upvote', async (req, res) => {
  try {
    const client = createRedisClient();
    await client.connect();
    
    const imageId = req.body.imageId;
    const newUpvoteCount = await client.incr(imageId);

    await client.disconnect();
    
    res.status(200).json({ upvoteCount: newUpvoteCount });
  } catch (error) {
    console.error('Error incrementing upvote count:', error);
    res.status(500).send('Error incrementing upvote count');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
