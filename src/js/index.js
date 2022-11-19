import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import ApiService from './api-service';
import createListTemplate from './templates/listTemplate.hbs';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formRef: document.querySelector('.search-form'),
  galleryRef: document.querySelector('.gallery-list'),
  loadBtnRef: document.querySelector('.load-more'),
};

refs.formRef.addEventListener('submit', onFormSubmit);
refs.loadBtnRef.addEventListener('click', onLoadMoreBtnClick);

const apiService = new ApiService();
const lightbox = new SimpleLightbox('.gallery-link');

async function onFormSubmit(e) {
  e.preventDefault();
  clearGalleryMarkup();
  hideLoadMoreBtn();
  apiService.resetPage();

  const searchQuery = e.target.elements.searchQuery.value;
  apiService.changeQuery(searchQuery);

  try {
    const { hits, totalHits } = await apiService.getPhotos();

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }

    Notify.info(`Hooray! We found ${totalHits} images.`);

    const photosMarkup = createListTemplate(hits);
    appendPhotosMarkup(photosMarkup);

    if (totalHits > apiService.getItemsPerPage()) {
      showLoadMoreBtn();
    }
  } catch (error) {
    Notify.failure(`Trouble! Error name: ${error.message}`);
  }

  lightbox.refresh();
  e.target.reset();
}

async function onLoadMoreBtnClick() {
  apiService.incrementPage();
  disableLoadMoreBtn();

  try {
    const { hits, totalHits } = await apiService.getPhotos();

    const photosMarkup = createListTemplate(hits);
    appendPhotosMarkup(photosMarkup);

    if (totalHits <= apiService.getItemsPerPage() * apiService.getPage()) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      hideLoadMoreBtn();
    }
  } catch (error) {
    Notify.failure(`Trouble! Error name: ${error.message}`);
  }

  scrollToNewPhotos();
  enableLoadMoreBth();
  lightbox.refresh();
}

function appendPhotosMarkup(photos) {
  refs.galleryRef.insertAdjacentHTML('beforeend', photos);
}

function clearGalleryMarkup() {
  refs.galleryRef.innerHTML = '';
}

function showLoadMoreBtn() {
  refs.loadBtnRef.classList.remove('hidden');
}

function hideLoadMoreBtn() {
  refs.loadBtnRef.classList.add('hidden');
}

function disableLoadMoreBtn() {
  refs.loadBtnRef.disabled = true;
  refs.loadBtnRef.textContent = 'Loading...';
}

function enableLoadMoreBth() {
  refs.loadBtnRef.disabled = false;
  refs.loadBtnRef.textContent = 'Load more';
}

function scrollToNewPhotos() {
  const { height: cardHeight } =
    refs.galleryRef.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: 'smooth',
  });
}