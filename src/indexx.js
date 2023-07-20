import refs from './js/refs';
import _var from './js/var';
import { TOTAL_HITS, PER_PAGE } from './js/const';
import { createMarkup } from './js/markup';
import { getData } from './js/getdata';
import { messageEndCollection } from './js/message';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

let { totalHits } = _var;

const { form, gallery, message, guard } = refs;

form.addEventListener('submit', onSearch);

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
    .catch(err => {
      console.log(err.message);
    });
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

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 0,
};

const observer = new IntersectionObserver(handlerPaggination, options);

function handlerPaggination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLoadMore();
    }
  });
}

export { observer };