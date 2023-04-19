export interface MovieModel {
  movieId: string;
  title: string;
  rating: number;
  releasedAt: string;
  runningTime: number;
}

export interface MovieGenreModel {
  movieId: string;
  genreType:
    | 'action'
    | 'horror'
    | 'musical'
    | 'noir'
    | 'romance'
    | 'comedy'
    | 'war';
}

export interface MovieCrewModel {
  movieId: string;
  crewType: 'director';
  personName: string;
}

export interface MovieActorModel {
  movieId: string;
  actorType: 'main' | 'sub';
  personName: string;
  character: string;
}
