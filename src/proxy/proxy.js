// proxyServer.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
app.use(cors());
const port = 3001;

app.get('/api/hiscore', async (req, res) => {
  const { username } = req.query;
  const url = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=${username}`;
  console.log(url);
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});