const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const SEARCH_URL = `${BASE_URL}/search/movie?${API_KEY}`;
const searchInput = document.getElementById('search');
const autocompleteList = document.getElementById('autocomplete-list');

const genres = [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 14, "name": "Fantasy" },
    { "id": 36, "name": "History" },
    { "id": 27, "name": "Horror" },
    { "id": 10402, "name": "Music" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 10770, "name": "TV Movie" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "War" },
    { "id": 37, "name": "Western" }
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;
var selectedGenre = [];

// Set up genres
setGenre();

function setGenre() {
    tagsEl.innerHTML = '';
    genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id = genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default actions

            // Genre selection logic
            if (selectedGenre.length === 0) {
                selectedGenre.push(genre.id);
            } else {
                if (selectedGenre.includes(genre.id)) {
                    selectedGenre = selectedGenre.filter(id => id !== genre.id);
                } else {
                    selectedGenre.push(genre.id);
                }
            }

            // Fetch movies based on selected genres
            getMovies(`${API_URL}&with_genres=${encodeURI(selectedGenre.join(','))}`);

            // Scroll to top without focusing on tags
            window.scrollTo({ top: 0, behavior: 'smooth' });
            highlightSelection();
        });
        tagsEl.append(t);
    });
}

// Highlight selected genres
function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.classList.remove('highlight');
    });
    clearBtn();
    if (selectedGenre.length !== 0) {
        selectedGenre.forEach(id => {
            const highlightedTag = document.getElementById(id);
            highlightedTag.classList.add('highlight');
        });
    }
}

// Clear selected genres
function clearBtn() {
    let clearBtn = document.getElementById('clear');
    if (clearBtn) {
        clearBtn.classList.add('highlight');
    } else {
        clear = document.createElement('div');
        clear.classList.add('tag', 'highlight');
        clear.id = 'clear';
        clear.innerText = 'Clear x';
        clear.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();
            getMovies(API_URL);
        });
        tagsEl.append(clear);
    }
}

// Fetch movies from the API
getMovies(API_URL);

function getMovies(url) {
    lastUrl = url;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.results.length !== 0) {
                showMovies(data.results);
                currentPage = data.page;
                nextPage = currentPage + 1;
                prevPage = currentPage - 1;
                totalPages = data.total_pages;
                current.innerText = currentPage;

                // Handle button disable state
                prev.classList.toggle('disabled', currentPage <= 1);
                next.classList.toggle('disabled', currentPage >= totalPages);
            } else {
                main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
            }
        });
}

// Show movie data
function showMovies(data) {
    main.innerHTML = '';
    data.forEach(movie => {
        const { title, poster_path, vote_average, overview, id } = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
            <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                ${overview}
                <button class="know-more" id="${id}">Watch Now</button>
            </div>
        `;
        main.appendChild(movieEl);
        document.getElementById(id).addEventListener('click', () => {
            openModal(movie);
        });
    });
}

// Get color based on vote average
function getColor(vote) {
    if (vote >= 8) return 'green';
    else if (vote >= 5) return 'orange';
    else return 'red';
}

// Modal functionality
const modal = document.getElementById('movieModal');
const closeButton = document.querySelector('.close-button');
const movieTitle = document.getElementById('movieTitle');
const movieOverview = document.getElementById('movieOverview');
const movieIframe = document.getElementById('movieIframe');

function openModal(movie) {
    movieTitle.textContent = movie.title;
    movieOverview.textContent = movie.overview;

    fetch(`${BASE_URL}/movie/${movie.id}/videos?${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.results.length > 0) {
                const videoKey = data.results[0].key;
                movieIframe.src = `https://vidsrc.to/embed/movie/${movie.id}`;
            } else {
                movieIframe.src = '';
            }
            modal.style.display = 'block';

            const serverSelect = document.getElementById('server');

            // Clear existing options before adding new ones
            serverSelect.innerHTML = '';

            const serverOptions = [
                { name: 'Server 1', url: `https://vidsrc.to/embed/movie/${movie.id}` },
                { name: 'Server 2', url: `https://another-server.com/embed/${movie.id}` },
                { name: 'Server 3', url: `https://yetanother-server.com/embed/${movie.id}` },
            ];

            serverOptions.forEach(server => {
                const option = document.createElement('option');
                option.value = server.url;
                option.textContent = server.name;
                serverSelect.appendChild(option);
            });

            // Set default server (Server 1)
            serverSelect.value = serverOptions[0].url;

            // Remove any existing 'change' event listeners by cloning the node (clean slate)
            const newServerSelect = serverSelect.cloneNode(true);
            serverSelect.parentNode.replaceChild(newServerSelect, serverSelect);

            // Add event listener to the new node
            newServerSelect.addEventListener('change', (event) => {
                movieIframe.src = event.target.value;
            });
        });
}

// Close Modal
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    movieIframe.src = '';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        movieIframe.src = '';
    }
});

// Search functionality
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = search.value.trim();
    selectedGenre = [];
    setGenre();

    if (query) {
        getMovies(`${SEARCH_URL}&query=${query}`).then(movies => {
            if (!movies || movies.length === 0) {
                location.reload(); // Reload if nothing found
            }
        });
    } else {
        location.reload(); // Reload if search is empty
    }
});

// Pagination functionality
prev.addEventListener('click', () => {
    if (prevPage > 0) {
        pageCall(prevPage);
    }
});

next.addEventListener('click', () => {
    if (nextPage <= totalPages) {
        pageCall(nextPage);
    }
});

// Handle page calls for pagination
function pageCall(page) {
    let urlSplit = lastUrl.split('?');
    let queryParams = urlSplit[1].split('&');
    let key = queryParams[queryParams.length - 1].split('=');
    if (key[0] !== 'page') {
        let url = lastUrl + '&page=' + page;
        getMovies(url);
    } else {
        key[1] = page.toString();
        let a = key.join('=');
        queryParams[queryParams.length - 1] = a;
        let b = queryParams.join('&');
        let url = urlSplit[0] + '?' + b;
        getMovies(url);
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
