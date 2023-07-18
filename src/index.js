import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

console.log(simpleLightbox);

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.js-gallery'),
  btnLoadMore: document.querySelector('.js-load-more'),
  message: document.querySelector('.js-message'),
};

const { form, gallery, btnLoadMore, message } = refs;

form.addEventListener('submit', onSearch);
btnLoadMore.addEventListener('click', onLoadMore);

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '38278991-17cfe7c1d9183e0e901f08bd5';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const SAFESEARCH = 'true';
const WIDTH = 300;
const HEIGHT = 210;
const PER_PAGE = 40;
let currentPage = 1;
let searchRequest = null;
let btnVisible = 0;
const TOTAL_HITS = 500;
let totalHits = 500;
var lightbox = null;

function getData(searchRequest, currentPage) {
  const params = new URLSearchParams({
    key: KEY,
    q: searchRequest,
    image_type: IMAGE_TYPE,
    orientation: ORIENTATION,
    safesearch: SAFESEARCH,
    per_page: PER_PAGE,
    page: currentPage,
  });
  const request = `?${params}`;
  return axios.get(request).then(response => {
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  });
}

function onSearch(event) {
  currentPage = 1;
  event.preventDefault();
  searchRequest = event.target.firstElementChild.value;

  return getData(searchRequest, currentPage)
    .then(data => {
      message.innerHTML = '';
      gallery.innerHTML = '';
      gallery.insertAdjacentHTML(
        'beforeend',
        createMarkup(data.hits, currentPage, totalHits)
      );
      lightbox = new SimpleLightbox('.js-gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      });
      totalHits = data.totalHits;
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      if (!totalHits) totalHits = TOTAL_HITS;
      btnVisible ? (btnLoadMore.hidden = false) : (btnLoadMore.hidden = true);
    })
    .catch(err => {
      console.log(err.message);
    });
}

function createMarkup(arrData, currentPage, totalHits) {
  if (currentPage > Math.ceil(totalHits / PER_PAGE)) {
    btnVisible = 0;
    Notiflix.Notify.warning(
      `We're sorry, but you've reached the end of search results.`
    );
    message.innerHTML = '';
    message.insertAdjacentHTML(
      'beforeend',
      `<p class="js-message">We're sorry, but you've reached the end of search results.</p>`
    );
    return ``;
  } else {
    if (!arrData.length) {
      btnVisible = 0;
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      gallery.innerHTML = '';
      message.innerHTML = '';
      message.insertAdjacentHTML(
        'beforeend',
        `
        <p class="js-message js-warning">Sorry, there are no images matching your search query. Please try again.</p>`
      );
      return ``;
    }
  }

  btnVisible = 1;
  return arrData
    .map(
      (
        {
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        },
        idx
      ) => `<div class="photo-card">
        <a class="gallery__link" href="${largeImageURL}">
        <img
          src="${webformatURL}"
          alt="${tags}"
          loading="lazy"
          width="${WIDTH}"
          height="${HEIGHT}"
        />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>${likes}</p>
          <p class="info-item"><b>Views</b>${views}</p>
          <p class="info-item"><b>Comments</b>${comments}</p>
          <p class="info-item"><b>Downloads</b>${downloads}</p>
        </div>
      </div>`
    )
    .join('');
}

function onLoadMore() {
  currentPage += 1;

  getData(searchRequest, currentPage)
    .then(data => {
      gallery.insertAdjacentHTML(
        'beforeend',
        createMarkup(data.hits, currentPage, totalHits)
      );
      console.log(data.hits);
      lightbox.refresh();
      const { height: cardHeight } = document
        .querySelector('.js-gallery')
        .firstElementChild.getBoundingClientRect();
      console.log(cardHeight);
      window.scrollBy({
        top: cardHeight * 1.8,
        behavior: 'smooth',
      });
      btnVisible ? (btnLoadMore.hidden = false) : (btnLoadMore.hidden = true);
    })
    .catch(err => {
      console.log(err.message);
    });
}
