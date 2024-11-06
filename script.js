// Global variables
let countriesData = [];
let currentPage = 1;
const pageSize = 20;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Fetch countries data from the API
async function fetchCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    countriesData = await response.json();
    displayCountries(); // Call function to display countries
    displayFavorites(); // Call function to display favorites
  } catch (error) {
    console.error('Error fetching country data:', error);
  }
}

// Display countries with pagination
function displayCountries(filteredCountries = countriesData) {
  const countryList = document.getElementById('country-list');
  countryList.innerHTML = '';

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCountries = filteredCountries.slice(startIndex, endIndex);
  const likedCountries = JSON.parse(localStorage.getItem('likedCountries')) || [];

  paginatedCountries.forEach(country => {
    const countryCard = document.createElement('div');
    countryCard.className = 'country-card';
    countryCard.innerHTML = `
      <h4>${country.name.common}</h4>
      <img src="${country.flags.png}" alt="Flag of ${country.name.common}" width="80">
      <span class="like-icon" onclick="toggleLike('${country.name.common}')">
        ${likedCountries.includes(country.name.common) ? '❤️' : '♡'}
      </span>
    `;
  countryCard.onclick = () => {
    // Navigate to details page with country name as a query parameter
    window.location.href = `details.html?name=${encodeURIComponent(country.name.common)}`;
  };
    countryCard.addEventListener('click', () => showCountryDetails(country));
    countryList.appendChild(countryCard);
  });
}

// Filter countries by search input
document.getElementById('search-bar').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const query = event.target.value.toLowerCase();
    const country = countriesData.find(country => country.name.common.toLowerCase() === query);
    if (country) {
      displayCountries([country]);
    } else {
      displayCountries([]);
    }
  }
});

// Load more countries on "Show More" button click
document.getElementById('show-more').addEventListener('click', () => {
  currentPage++;
  displayCountries();
});

// Autocomplete search functionality
document.getElementById('search-bar').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const filteredCountries = countriesData.filter(country =>
    country.name.common.toLowerCase().includes(query)
  ).slice(0, 5);

  displayAutocomplete(filteredCountries);
});

function displayAutocomplete(filteredCountries) {
  const autocomplete = document.getElementById('autocomplete');
  autocomplete.innerHTML = '';

  filteredCountries.forEach(country => {
    const suggestion = document.createElement('div');
    suggestion.className = 'suggestion';
    suggestion.innerText = country.name.common;
    suggestion.addEventListener('click', () => showCountryDetails(country));
    autocomplete.appendChild(suggestion);
  });
}

// Filter countries by region and language
document.getElementById('region-filter').addEventListener('change', filterCountries);
document.getElementById('language-filter').addEventListener('input', filterCountries);

function filterCountries() {
  const region = document.getElementById('region-filter').value;
  const language = document.getElementById('language-filter').value.toLowerCase();

  const filteredCountries = countriesData.filter(country => {
    const matchesRegion = !region || country.region === region;
    const matchesLanguage = !language || (country.languages && Object.values(country.languages).some(lang => lang.toLowerCase().includes(language)));
    return matchesRegion && matchesLanguage;
  });

  currentPage = 1;
  displayCountries(filteredCountries);
}

// Add or remove country from Favorites
function toggleLike(countryName) {
  const likedCountries = JSON.parse(localStorage.getItem('likedCountries')) || [];

  if (likedCountries.includes(countryName)) {
    const index = likedCountries.indexOf(countryName);
    likedCountries.splice(index, 1);
  } else {
    likedCountries.push(countryName);
  }

  localStorage.setItem('likedCountries', JSON.stringify(likedCountries));
  displayCountries(); // Update countries display
  displayFavorites(); // Update favorites display
}

// Display favorite countries in the Favorites panel
function displayFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.innerHTML = '';

  const likedCountries = JSON.parse(localStorage.getItem('likedCountries')) || [];
  likedCountries.forEach(countryName => {
    const country = countriesData.find(c => c.name.common === countryName);
    if (country) {
      const countryCard = document.createElement('div');
      countryCard.className = 'country-card';
      countryCard.innerHTML = `
        <h4>${country.name.common}</h4>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}" width="80">
        <span class="like-icon" onclick="toggleLike('${country.name.common}')"></span>
      `;
      favoritesList.appendChild(countryCard);
    }
  });
}

// Initial setup to fetch and display country data
fetchCountries();
