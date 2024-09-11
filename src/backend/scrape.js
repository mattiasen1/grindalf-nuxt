import axios from 'axios';
import { load } from 'cheerio';

export const fetchData = async (username, boss) => {
    const url = `/api/m=hiscore_oldschool/index_lite.json?player=${username}`;

  try {
    console.log(username, boss);
    const response = await axios.get(url);
    const data = response.data;
    console.log(data);

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};