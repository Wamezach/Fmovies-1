// Full fixed JavaScript with anime movie + series support

const API_KEY = '9a134c87182ea691afbebbf099bea806';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const autocompleteList = document.getElementById('autocomplete-list');
// Anime-specific keywords (anime, Japanese animation)
const ANIME_TV_URL = `${BASE_URL}/discover/tv?sort_by=popularity.desc&with_keywords=210024|287501&api_key=${API_KEY}`;
const ANIME_MOVIE_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&with_keywords=210024|287501&api_key=${API_KEY}`;
const SEARCH_URL = `${BASE_URL}/search/multi?api_key=${API_KEY}`;

const genres = [
  { id: 16, name: "Animation" },
  { id: 10759, name: "Action & Adventure" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const searchInput = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');

let currentPage = 1;
let nextPage = 2;
let prevPage = 0;
let totalPages = 100;
let lastUrl = '';
let selectedGenre = [];

setGenre();
getMovies(ANIME_TV_URL);

function setGenre() {
  tagsEl.innerHTML = '';
  genres.forEach(genre => {
    const t = document.createElement('div');
    t.classList.add('tag');
    t.id = genre.id;
    t.innerText = genre.name;
    t.addEventListener('click', () => {
      if (selectedGenre.includes(genre.id)) {
        selectedGenre = selectedGenre.filter(id => id !== genre.id);
      } else {
        selectedGenre.push(genre.id);
      }
      let url = `${ANIME_TV_URL}`;
      if (selectedGenre.length > 0) {
        url += `&with_genres=${encodeURI(selectedGenre.join(','))}`;
      }
      getMovies(url);
      highlightSelection();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    tagsEl.appendChild(t);
  });
}

function highlightSelection() {
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => tag.classList.remove('highlight'));
  selectedGenre.forEach(id => {
    const tag = document.getElementById(id);
    if (tag) tag.classList.add('highlight');
  });
  clearBtn();
}

function clearBtn() {
  let clearBtn = document.getElementById('clear');
  if (!clearBtn) {
    clearBtn = document.createElement('div');
    clearBtn.classList.add('tag', 'highlight');
    clearBtn.id = 'clear';
    clearBtn.innerText = 'Clear x';
    clearBtn.addEventListener('click', () => {
      selectedGenre = [];
      setGenre();
      getMovies(ANIME_TV_URL);
    });
    tagsEl.appendChild(clearBtn);
  } else {
    clearBtn.classList.add('highlight');
  }
}

function getMovies(url) {
  lastUrl = url;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.results.length > 0) {
        showMovies(data.results);
        currentPage = data.page;
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        totalPages = data.total_pages;
        current.innerText = currentPage;
        prev.classList.toggle('disabled', currentPage <= 1);
        next.classList.toggle('disabled', currentPage >= totalPages);
      } else {
        main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
      }
    })
    .catch(() => {
      main.innerHTML = `<h1 class="no-results">Error fetching data</h1>`;
    });
}

function showMovies(data) {
  main.innerHTML = '';
  data.forEach(item => {
    const title = item.title || item.name;
    const poster_path = item.poster_path;
    const vote_average = item.vote_average;
    const overview = item.overview;
    const id = item.id;

    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${title}">
      <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getColor(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <div class="overview-text">${overview}</div>
        <button class="know-more" id="${id}">Watch Now</button>
      </div>
    `;

    main.appendChild(movieEl);

    movieEl.querySelector('.know-more').addEventListener('click', () => {
      openModal(item);
    });
  });
}

function getColor(vote) {
  if (vote >= 8) return 'green';
  if (vote >= 5) return 'orange';
  return 'red';
}

const modal = document.getElementById('movieModal');
const closeButton = document.querySelector('.close-button');
const movieTitle = document.getElementById('movieTitle');
const movieOverview = document.getElementById('movieOverview');
const movieIframe = document.getElementById('movieIframe');

function openModal(movie) {
  movieTitle.textContent = movie.name || movie.title;
  movieOverview.textContent = movie.overview;

  fetch(`${BASE_URL}/${movie.media_type || 'tv'}/${movie.id}/videos?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      movieIframe.src = `https://vidsrc.cc/v2/embed/${movie.media_type || 'tv'}/${movie.id}`;

      modal.style.display = 'block';
      const serverSelect = document.getElementById('server');
      serverSelect.innerHTML = '';

      const serverOptions = [
        { name: 'Server 1', url: `https://vidsrc.cc/v2/embed/${movie.media_type || 'tv'}/${movie.id}` },
        { name: 'Server 2', url: `https://another-server.com/embed/${movie.id}` },
        { name: 'Server 3', url: `https://yetanother-server.com/embed/${movie.id}` },
      ];

      serverOptions.forEach(server => {
        const option = document.createElement('option');
        option.value = server.url;
        option.textContent = server.name;
        serverSelect.appendChild(option);
      });

      serverSelect.value = serverOptions[0].url;

      const newServerSelect = serverSelect.cloneNode(true);
      serverSelect.parentNode.replaceChild(newServerSelect, serverSelect);

      newServerSelect.addEventListener('change', e => {
        movieIframe.src = e.target.value;
      });
    })
    .catch(() => {
      movieIframe.src = '';
      modal.style.display = 'block';
    });
}

closeButton.addEventListener('click', () => {
  modal.style.display = 'none';
  movieIframe.src = '';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
    movieIframe.src = '';
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  selectedGenre = [];
  setGenre();

  if (query) {
    getMovies(`${SEARCH_URL}&query=${encodeURIComponent(query)}`);
  } else {
    getMovies(ANIME_TV_URL);
  }
});

prev.addEventListener('click', () => {
  if (prevPage > 0) {
    pageCall(prevPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

next.addEventListener('click', () => {
  if (nextPage <= totalPages) {
    pageCall(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

function pageCall(page) {
  let urlSplit = lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let pageParamIndex = queryParams.findIndex(param => param.startsWith('page='));

  if (pageParamIndex === -1) {
    getMovies(lastUrl + `&page=${page}`);
  } else {
    queryParams[pageParamIndex] = `page=${page}`;
    const newUrl = urlSplit[0] + '?' + queryParams.join('&');
    getMovies(newUrl);
  }
}
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.getElementById('clearSearch');
    const search = document.getElementById('search');

    clearBtn.addEventListener('click', () => {
        search.value = '';
        location.reload();
    });
});
function clearAutocomplete() {
  autocompleteList.innerHTML = '';
  autocompleteList.style.display = 'none';
}

// Render dropdown items
function renderAutocomplete(movies) {
  clearAutocomplete();
  if (!movies || movies.length === 0) return;

  movies.forEach(movie => {
    const item = document.createElement('div');
    item.classList.add('autocomplete-item');

    const img = document.createElement('img');
    img.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
      : 'https://via.placeholder.com/40x60?text=No+Img'; // fallback image
    img.alt = movie.title;

    const title = document.createElement('span');
    title.textContent = movie.title;

    item.appendChild(img);
    item.appendChild(title);

    item.addEventListener('click', () => {
      searchInput.value = movie.title;
      clearAutocomplete();
      openModal(movie); // ✅ Open the modal with selected movie
    });

    autocompleteList.appendChild(item);
  });

  autocompleteList.style.display = 'block';
}

// Debounce and fetch suggestions
let debounceTimeout;
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (!query) {
    clearAutocomplete();
    return;
  }
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetch(`${SEARCH_URL}&query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        renderAutocomplete(data.results || []);
      })
      .catch(() => {
        clearAutocomplete();
      });
  }, 300);
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
    clearAutocomplete();
  }
});

 function toggleNav() {
    document.getElementById('navMenu').classList.toggle('active');
  }
