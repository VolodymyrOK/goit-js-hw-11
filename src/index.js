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

const scrollWinUp = () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
};

let {
  currentPage,
  searchRequest,
  lightbox,
  arrSearchData,
  totalHits,
  readingError,
} = _var;

const { form, gallery, message, guard, buttonArrowUp } = refs;

form.addEventListener('submit', onSearch);
buttonArrowUp.addEventListener('click', () => {
  scrollWinUp();
});

async function onSearch(event) {
  event.preventDefault();
  currentPage = 1;
  searchRequest = event.target.firstElementChild.value.trim();
  if (!searchRequest) {
    buttonArrowUp.hidden = true;
    return messageError('No data to search. Enter data in the input field.');
  }
  scrollWinUp();
  try {
    const data = await getData(searchRequest, currentPage);

    readingError = false;
    message.innerHTML = '';
    gallery.innerHTML = '';
    gallery.insertAdjacentHTML(
      'beforeend',
      await createMarkup(data.hits, currentPage, totalHits)
    );
    arrSearchData = data.hits;
    observer.observe(guard);
    lightbox = new SimpleLightbox('.js-gallery a', {
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    totalHits = data.totalHits;
  } catch (error) {
    // console.log(error.message);
    readingError = true;
    buttonArrowUp.hidden = true;
    messageError(`${error}. Error reading data.`);
  } finally {
    if (totalHits && !readingError) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    if (!totalHits) totalHits = 1;
  }
}

async function onLoadMoreInfinityScroll() {
  currentPage += 1;
  let photo = currentPage * PER_PAGE;
  if (photo <= totalHits || photo - totalHits <= PER_PAGE) {
    try {
      const data = await getData(searchRequest, currentPage);
      gallery.insertAdjacentHTML(
        'beforeend',
        await createMarkup(data.hits, currentPage, totalHits)
      );

      lightbox.refresh();

      const { height: cardHeight } = document
        .querySelector('.js-gallery')
        .firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2.15,
        behavior: 'smooth',
      });
    } catch (error) {
      // console.log(error.message);
      buttonArrowUp.hidden = true;
      messageError(`${error.message}. Error reading data.`);
    }
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
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      await onLoadMoreInfinityScroll();
    }
  });
}

export { observer };
