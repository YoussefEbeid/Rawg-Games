import './style.css'
import type { GamesResponse, Game, GameDetails, GenresResponse, Genre } from './type.js';

const apiKey = 'dac46f31254f4bcd9b98e6ff04d35b77'; 
const gameGrid: HTMLElement | null = document.getElementById('game-grid');
let genresId: number;
let searchText: string = ""; 
let debounceTimer: number;   
const searchBar = document.   getElementById('search-bar') as HTMLInputElement;
const loader = document.getElementById('loader') as HTMLDivElement;
searchBar.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    searchText = searchBar.value.trim();
    getGames();
  }, 500); 
}); 
const genreList = document.getElementById('genre-list') as HTMLElement;

async function getGenres() {
  try {
    const res = await fetch(`https://api.rawg.io/api/genres?key=${apiKey}`);
    const data: GenresResponse = await res.json();
    
    genreList.innerHTML = '';
    data.results.forEach((genre: Genre) => {
      const li = document.createElement('li');
      li.className = "hover:text-white cursor-pointer flex items-center gap-2 mb-2";
      li.innerHTML = `<span class="${genresId===genre.id?'text-white font-bold':''}">${genre.name}</span>`;
      li.addEventListener('click', () => {
         genresId = genre.id; 
        getGames();
      });
      genreList.appendChild(li);
    });
  } catch (err) { console.log(err); }
}

let storeSort: string = ""; 
const sortOrder = document.getElementById('sort-order') as HTMLSelectElement;

const countGames = document.getElementById('game-count') as HTMLElement;

function toggleLoader(show: boolean) {
  if (!loader||!gameGrid) return;
  if (show) {
    loader.classList.remove('hidden');
    gameGrid.classList.add('hidden');
  } else {
    loader.classList.add('hidden');
    gameGrid.classList.remove('hidden');
  }
}

// const page = 1;
// const cardsPerPage = 20;
// const skipPage = (page - 1) * cardsPerPage;

let nextPage: string | null = null;
const PAGE_SIZE = 20;
let games: Game[] = [];
let totalGames: number = 0;
let fetchGames = false;
async function getGames() {
  if (fetchGames) return;

  try {
    fetchGames = true;
    let url = nextPage ? nextPage : `https://api.rawg.io/api/games?key=${apiKey}&page_size=${PAGE_SIZE}`;
      if (genresId) {
        url = url + `&genres=${genresId}`;
      }
      if (searchText) {
        url += `&search=${searchText}`;
      }
      if (storeSort) {
        url += `&ordering=${storeSort}`;
      }

    

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch games');
      }
        
      const data: GamesResponse = await res.json();
      nextPage = data.next;
      games = [...games, ...data.results];
      totalGames = data.count;
      if (countGames) {
        countGames.innerText = data.count + " Games";
      }
      if (!gameGrid) return;
      gameGrid.innerHTML = '';

      games.forEach((game: Game, index) => {
        let score = '';
        if (game.metacritic) {
          score = `<span class="border border-green-500 text-green-400 text-xs font-bold px-2 py-1 rounded">${game.metacritic}</span>`;
        }
        gameGrid.innerHTML += ` <div class="game-card bg-gray-900 rounded-xl cursor-pointer" 
             data-id="${game.id}" id=${index === games.length - 1 ? "fetch-item" : ""}>
          <div class="h-48 ">
             <img src="${game.background_image}" class="w-full h-full object-cover">
          </div>
          <div class="p-4">
            <div class="flex justify-end mb-2">${score}
            </div>
            <h3 class="text-2xl font-bold">${game.name}</h3>
          </div>
        </div>`;
      });
  } catch (err) {
    console.log(err);
    if (gameGrid) {
      gameGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <p class = "text-red-500 p-6 font-bold text-2xl">Something went wrong!</p>
          <button id="retry-button" class="bg-white text-black px-6 py-2 rounded-lg font-bold">Try</button></div>`;
       document.getElementById('retry-button')?.addEventListener('click', () => {
        getGames();
      });
    }
  }
  finally {
    toggleLoader(false);
    fetchGames = false;
  }
  
}
const modal = document.getElementById('modal') as HTMLDivElement;
const content = document.getElementById('modal-content') as HTMLDivElement;

async function showDetails(id: number) {
  modal.classList.remove('hidden');
  modal.classList.add('flex'); 
  
  content.innerHTML = '<h1 class="text-center p-10 text-xl">Loading</h1>';
  try {
    const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
    if (!res.ok) {
      throw new Error('Failed to fetch game details');
    }
    const game:GameDetails = await res.json();

    content.innerHTML = `
    <div>
      <img src="${game.background_image}" class="w-full h-64 md:h-80 object-cover rounded-t-xl">
      <div class="p-4 md:p-8">
        <h2 class="text-3xl md:text-5xl font-black mb-4 ">${game.name}</h2>
        
        <div class="flex flex-col md:flex-row gap-4 md:gap-10 mb-6 text-gray-400">
            <p><strong class="text-white">Rating:</strong> ${game.rating} / 5</p>
            <p><strong class="text-white">Released:</strong> ${game.released}</p>
        </div>
        <p class="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
          ${game.description }
        </p>
        <div class="flex justify-end gap-3">
            <button id="close-btn" class="px-5 py-2 rounded bg-white/10 hover:bg-white/20">Close</button>
        </div>
      </div>
    </div>`;
    document.getElementById('close-btn')?.addEventListener('click', closePopup);
  } catch (err) { 
    content.innerHTML = '<h1 class="text-center p-10 text-xl">Failed to load game details.</h1>';
    console.log(err);
  }
}; 

getGames();
getGenres() 

sortOrder?.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement;
  storeSort = target.value; 
  getGames(); 
});

gameGrid?.addEventListener('click', (e) => {
  const card = e.target as HTMLElement;
    if (card.classList.contains('game-card')) {
     const id = card.getAttribute('data-id');
     if (id) showDetails(Number(id));
  }
});

gameGrid?.addEventListener('click',(e)=> {
  const target = e.target as HTMLElement;
  const card  = target.closest('.game-card') as HTMLDivElement;
  if (card) {
    const id = card.getAttribute('data-id');
    if (id) {
      showDetails(Number(id));
    }
  }
});

function closePopup() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

modal.onclick = function(e) {
  if (e.target==modal) {
    closePopup();
  }
};


  function isInViewport(e: HTMLElement) {
    const rect = e.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  }


window.addEventListener("scroll", () => {
  const el = document.querySelector("#fetch-item");
  
  
  if (el && isInViewport(el as HTMLElement)) {
    console.log("Visible!");
  }

  if (nextPage && !fetchGames) {
    getGames();
  }
});
