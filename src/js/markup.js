import { messageEndCollection, messageError } from './message';
import { WIDTH, HEIGHT, PER_PAGE } from './const';

function createMarkup(arrData, currentPage, totalHits) {
  console.log(totalHits);
  if (currentPage > Math.ceil(totalHits / PER_PAGE))
    messageEndCollection(
      "We're sorry, but you've reached the end of search results."
    );
  else {
    if (!arrData.length)
      messageError(
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

export { createMarkup };
