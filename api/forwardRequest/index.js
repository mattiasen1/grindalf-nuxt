const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const { player } = req.query;

  if (!player) {
    context.res = {
      status: 400,
      body: "Player parameter is required"
    };
    return;
  }

  try {
    const response = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.json?player=${player}`);
    const data = await response.json(); // Use text() instead of json() if the response is not JSON

    context.res = {
      status: 200,
      body: data
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: `Error fetching data: ${error.message}`
    };
  }
};