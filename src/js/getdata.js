import axios from 'axios';
import {
  KEY,
  IMAGE_TYPE,
  ORIENTATION,
  SAFESEARCH,
  PER_PAGE,
  BASE_URL,
} from './const';

axios.defaults.baseURL = BASE_URL;
// axios.defaults.headers.common['key'] = KEY;

async function getData(searchRequest, currentPage) {
  const params = new URLSearchParams({
    key: KEY,
    q: searchRequest,
    image_type: IMAGE_TYPE,
    orientation: ORIENTATION,
    safesearch: SAFESEARCH,
    per_page: PER_PAGE,
    page: currentPage,
  });
  const response = await axios.get(`?${params}`);
  return response.data;
}

export { getData };
