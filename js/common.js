import debounce from './debounce.js';

const main = document.querySelector('.autocomplete');
const input = document.querySelector('.autocomplete__input');
const searchList = document.querySelector('.search-list');
const infoBlock = document.querySelector('.info');
const template = document.querySelector('.infoBlock').content;

const getSearchData = async (searchText) => {
  const url = 'https://api.github.com/search/repositories';
  const res = await fetch(`${url}?q=${searchText}&sort=stars`);
  const repositories = await res.json();

  const matches = repositories.items.filter((repo) => {
    const regex = new RegExp(`^${searchText}`, 'gi');
    return repo.name.match(regex);
  });

  return createSearchList(matches);
};

const debounceData = debounce(getSearchData, 200);

const createSearchList = (array) => {
  const searchItem = array.reduce((str, current, index) => {
    const { name, stargazers_count, owner } = current;
    if (index < 5) {
      str += `<li data-stars="${stargazers_count}" 
                    data-avatar="${owner.avatar_url}"
                    data-login="${owner.login}" 
                    data-name="${name}"
                    class="search-list__item">${name}</li>`;
    }
    return str;
  }, '');
  searchList.innerHTML = searchItem;
};

const createInfoBlock = ({ stars, login, name, avatar }) => {
  const newTemplate = document.importNode(template, true);
  newTemplate.querySelector('.info__owner').textContent = login;
  newTemplate.querySelector('.info__repository').textContent = name;
  newTemplate.querySelector('.info__stars').textContent = stars;
  newTemplate.querySelector('.info__avatar').setAttribute('src', avatar);
  infoBlock.prepend(newTemplate);
};

const handleInputValue = () => {
  input.value ? debounceData(input.value) : (searchList.innerHTML = '');
};

const handleInfoBlock = ({ target }) => {
  if (target.className === 'search-list__item') {
    createInfoBlock(target.dataset);
    searchList.innerHTML = '';
    input.value = '';
  }
  if (target.className === 'close') {
    target.parentNode.remove();
  }
};

input.addEventListener('input', handleInputValue);
main.addEventListener('click', handleInfoBlock);
