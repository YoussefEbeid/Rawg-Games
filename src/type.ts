export interface Game {
    id: number;
    name: string; 
    slug: string;
    background_image: string;
    metacritic: number | null;
}

export interface GamesResponse {
  count: number;
  next: string ;     
  previous: string;
  results: Game[];  
}
    
export interface GameDetails extends Game { 
    description: string;
    rating: number;
    released: string;
}

export interface Genre {
    id: number; 
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
}

export interface GenresResponse{
    count: number;
    results: Genre[];
}