import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.js-gallery'),
  message: document.querySelector('.js-message'),
  guard: document.querySelector('.js-guard'),
};

const { form, gallery, message, guard } = refs;

form.addEventListener('submit', onSearch);

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
const TOTAL_HITS = 1;
let totalHits = 1;
let lightbox = null;
let arrSearchData = [];

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 0,
};

const observer = new IntersectionObserver(handlerPaggination, options);

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
  return axios.get(request).then(response => response.data);
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
      arrSearchData = data.hits;
      observer.observe(guard);
      lightbox = new SimpleLightbox('.js-gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      });
      totalHits = data.totalHits;
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      if (!totalHits) totalHits = TOTAL_HITS;
    })
    .catch(() => {
      location.href = './error.html';
    });
}

function createMarkup(arrData, currentPage, totalHits) {
  if (currentPage > Math.ceil(totalHits / PER_PAGE))
    messageEndCollection(
      "We're sorry, but you've reached the end of search results."
    );
  else {
    if (!arrData.length)
      messageErrorSearch(
        'Sorry, there are no images matching your search query. Please try again.'
      );
  }
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
  let photo = currentPage * PER_PAGE;
  if (photo <= totalHits + 20) {
    getData(searchRequest, currentPage)
      .then(data => {
        gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.hits, currentPage, totalHits)
        );
        lightbox.refresh();
        const { height: cardHeight } = document
          .querySelector('.js-gallery')
          .firstElementChild.getBoundingClientRect();
        window.scrollBy({
          top: cardHeight * 1.8,
          behavior: 'smooth',
        });
      })
      .catch(err => {
        console.log(err.message);
      });
  } else {
    if (arrSearchData.length !== 0)
      messageEndCollection(
        "We're sorry, but you've reached the end of search results."
      );
  }
}

function messageEndCollection(textWarning) {
  Notiflix.Notify.warning(`${textWarning}`);
  message.insertAdjacentHTML(
    'beforeend',
    `<p class="js-message">${textWarning}</p>`
  );
  observer.unobserve(guard);
  return ``;
}

function messageErrorSearch(textError) {
  errorMarker = true;
  Notiflix.Notify.failure(`${textError}`);
  gallery.innerHTML = '';
  message.innerHTML = '';
  message.insertAdjacentHTML(
    'beforeend',
    `
        <p class="js-message js-warning">${textError}</p>`
  );
  return ``;
}

function handlerPaggination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLoadMore();
    }
  });
}
