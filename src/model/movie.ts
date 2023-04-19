export interface MovieModel {
  id: string;
  title: string;
  rating: number;
  releasedAt: string;
  runningTime: number;
}

export interface MovieGenreModel {
  movieId: string;
  type: 'action' | 'horror' | 'musical' | 'noir' | 'romance' | 'comedy' | 'war';
}

export interface MovieCrewModel {
  movieId: string;
  type: 'director';
  personName: string;
}

export interface MovieActorModel {
  movieId: string;
  type: 'main' | 'sub';
  personName: string;
  character: string;
}
