const API_KEY = 'api_key=9a134c87182ea691afbebbf099bea806';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/tv?with_networks=213&sort_by=popularity.desc&vote_average.gte=7&${API_KEY}`;

const SEARCH_URL = `${BASE_URL}/search/tv?${API_KEY}`;

const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const genres = [
    { "id": 10759, "name": "Action & Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 10762, "name": "Kids" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10763, "name": "News" },
    { "id": 10764, "name": "Reality" },
    { "id": 10765, "name": "Sci-Fi & Fantasy" },
    { "id": 10766, "name": "Soap" },
    { "id": 10767, "name": "Talk" },
    { "id": 10768, "name": "War & Politics" },
    { "id": 37, "name": "Western" }
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');

const searchInput = document.getElementById('search');
const autocompleteList = document.getElementById('autocomplete-list');

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
            event.preventDefault();
            if (selectedGenre.length === 0) {
                selectedGenre.push(genre.id);
            } else {
                if (selectedGenre.includes(genre.id)) {
                    selectedGenre = selectedGenre.filter(id => id !== genre.id);
                } else {
                    selectedGenre.push(genre.id);
                }
            }
            getMovies(`${API_URL}&with_genres=${encodeURI(selectedGenre.join(','))}`);
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

// Clear selected genres button
function clearBtn() {
    let clearBtn = document.getElementById('clear');
    if (clearBtn) {
        clearBtn.classList.add('highlight');
    } else {
        const clear = document.createElement('div');
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

// Fetch TV shows from API
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

                prev.classList.toggle('disabled', currentPage <= 1);
                next.classList.toggle('disabled', currentPage >= totalPages);
            } else {
                main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
            }
        });
}

// Display TV shows
function showMovies(data) {
    main.innerHTML = '';
    data.forEach(tv => {
        const { name, poster_path, vote_average, overview, id } = tv;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
            <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${name}">
            <div class="movie-info">
                <h3>${name}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <div class="overview-text">${overview}</div>
                <button class="know-more" id="${id}">Watch Now</button>
            </div>
        `;
        main.appendChild(movieEl);
        document.getElementById(id).addEventListener('click', () => {
            openModal(tv);
        });
    });
}

// Vote average color code
function getColor(vote) {
    if (vote >= 8) return 'green';
    else if (vote >= 5) return 'orange';
    else return 'red';
}

// Modal elements
const modal = document.getElementById('movieModal');
const closeButton = document.querySelector('.close-button');
const movieTitle = document.getElementById('movieTitle');
const movieOverview = document.getElementById('movieOverview');
const movieIframe = document.getElementById('movieIframe');

function openModal(tv) {
    movieTitle.textContent = tv.name;
    movieOverview.textContent = tv.overview;

    fetch(`${BASE_URL}/tv/${tv.id}/videos?${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.results.length > 0) {
                // You could filter videos by type "Trailer" or "Official"
                const videoKey = data.results[0].key;
                movieIframe.src = `https://vidsrc.cc/v2/embed/tv/${tv.id}`;
            } else {
                movieIframe.src = '';
            }
            modal.style.display = 'block';

            const serverSelect = document.getElementById('server');
            serverSelect.innerHTML = '';

            const serverOptions = [
                { name: 'Server 1', url: `https://vidsrc.cc/v2/embed/tv/${tv.id}` },
                { name: 'Server 2', url: `https://another-server.com/embed/${tv.id}` },
                { name: 'Server 3', url: `https://yetanother-server.com/embed/${tv.id}` },
            ];

            serverOptions.forEach(server => {
                const option = document.createElement('option');
                option.value = server.url;
                option.textContent = server.name;
                serverSelect.appendChild(option);
            });

            serverSelect.value = serverOptions[0].url;

            // Remove old listeners by cloning
            const newServerSelect = serverSelect.cloneNode(true);
            serverSelect.parentNode.replaceChild(newServerSelect, serverSelect);

            newServerSelect.addEventListener('change', (event) => {
                movieIframe.src = event.target.value;
            });
        });
}

// Close modal logic
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

// Search form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = search.value.trim();
    selectedGenre = [];
    setGenre();

    if (query) {
        getMovies(`${SEARCH_URL}&query=${encodeURIComponent(query)}`);
    } else {
        location.reload();
    }
});

// Pagination
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
    let key = queryParams[queryParams.length - 1].split('=');
    if (key[0] !== 'page') {
        let url = lastUrl + '&page=' + page;
        getMovies(url);
    } else {
        key[1] = page.toString();
        queryParams[queryParams.length - 1] = key.join('=');
        let b = queryParams.join('&');
        let url = urlSplit[0] + '?' + b;
        getMovies(url);
    }
}

// Autocomplete search UI

function clearAutocomplete() {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
}

function renderAutocomplete(tvShows) {
    clearAutocomplete();
    if (!tvShows || tvShows.length === 0) return;

    tvShows.forEach(tv => {
        const item = document.createElement('div');
        item.classList.add('autocomplete-item');

        const img = document.createElement('img');
        img.src = tv.poster_path
            ? `https://image.tmdb.org/t/p/w92${tv.poster_path}`
            : 'https://via.placeholder.com/40x60?text=No+Img';
        img.alt = tv.name;

        const title = document.createElement('span');
        title.textContent = tv.name;

        item.appendChild(img);
        item.appendChild(title);

        item.addEventListener('click', () => {
            searchInput.value = tv.name;
            clearAutocomplete();
            openModal(tv);
        });

        autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = 'block';
}

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

// Close autocomplete if clicking outside
document.addEventListener('click', e => {
    if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
        clearAutocomplete();
    }
});

// Clear search button (assuming button with id 'clearSearch' exists)
document.addEventListener('DOMContentLoaded', () => {
    const clearBtn = document.getElementById('clearSearch');
    const search = document.getElementById('search');

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            search.value = '';
            location.reload();
        });
    }
});

// Initial load of TV shows
getMovies(API_URL);
