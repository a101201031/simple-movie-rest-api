export interface MovieModel {
  movieId: string;
  title: string;
  rating: number;
  releasedAt: string;
  runningTime: number;
}

export interface MovieGenreModel {
  movieId: string;
  genreType: string;
}

export interface MovieCrewModel {
  movieId: string;
  crewType: string;
  personName: string;
}

export interface MovieActorModel {
  movieId: string;
  actorType: string;
  personName: string;
  character: string;
}
