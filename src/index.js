import refs from './js/refs';
import _var from './js/var';
import { PER_PAGE } from './js/const';
import { createMarkup } from './js/markup';
import { getData } from './js/getdata';
import { messageEndCollection } from './js/message';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { messageError } from './js/message';

let { currentPage, searchRequest, lightbox, arrSearchData, totalHits } = _var;

const { form, gallery, message, guard } = refs;

form.addEventListener('submit', onSearch);

function onSearch(event) {
  event.preventDefault();
  currentPage = 1;
  searchRequest = event.target.firstElementChild.value.trim();
  if (!searchRequest)
    return messageError('No data to search. Enter data in the input field.');

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
    })
    .catch(error => {
      // console.log(error);
      messageError(`${error.message}. Error reading data.`);
    })
    .finally(() => {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      if (!totalHits) totalHits = 1;
    });
}

function onLoadMoreInfinityScroll() {
  currentPage += 1;
  let photo = currentPage * PER_PAGE;
  if (photo <= totalHits || photo - totalHits <= PER_PAGE) {
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
          top: cardHeight * 2.15,
          behavior: 'smooth',
        });
      })
      .catch(error => {
        // console.log(error);
        messageError(error.message);
      });
  } else {
    if (arrSearchData.length !== 0)
      messageEndCollection(
        `We're sorry, but you've reached the end of search results. Found ${totalHits} images.`
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
      onLoadMoreInfinityScroll();
    }
  });
}

export { observer };
