import refs from './refs';
import Notiflix from 'notiflix';
import { observer } from '..';

const { message, guard, gallery } = refs;

function messageEndCollection(textWarning) {
  Notiflix.Notify.warning(`${textWarning}`);
  message.insertAdjacentHTML(
    'beforeend',
    `<p class="js-message">${textWarning}</p>`
  );
  observer.unobserve(guard);
  return ``;
}

function messageError(textError) {
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

export { messageEndCollection, messageError };
