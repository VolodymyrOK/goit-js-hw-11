import axios from 'axios';
import { KEY, IMAGE_TYPE, ORIENTATION, SAFESEARCH, PER_PAGE } from './const';
import { messageErrorSearch } from './message';

axios.defaults.baseURL = 'https://pixabay.com/api/';

async function getData(searchRequest, currentPage) {
  try {
    const params = new URLSearchParams({
      key: KEY,
      q: searchRequest,
      image_type: IMAGE_TYPE,
      orientation: ORIENTATION,
      safesearch: SAFESEARCH,
      per_page: PER_PAGE,
      page: currentPage,
    });
    return (await axios.get(`?${params}`)).data;
  } catch {
    messageErrorSearch(`Error reading data. Network error.`);
  }
}

export { getData };
