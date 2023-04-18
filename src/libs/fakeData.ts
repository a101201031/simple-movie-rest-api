export const fakeData = {
  movies: [
    {
      movie_id: 'm1',
      title: '존 윅',
      rating: 27,
      released_at: new Date('1995-12-17T03:24:00').toISOString(),
      running_time: 160 * 60 * 1000,
    },
    {
      movie_id: 'm2',
      title: '존 윅2',
      rating: 47,
      released_at: new Date('2004-02-05T12:12:25.373Z').toISOString(),
      running_time: 160 * 60 * 1000,
    },
    {
      movie_id: 'm3',
      title: '존 윅3',
      rating: 67,
      released_at: new Date('2007-02-05T12:12:25.373Z').toISOString(),
      running_time: 160 * 60 * 1000,
    },
    {
      movie_id: 'm4',
      title: '존 윅4',
      rating: 100,
      released_at: new Date('2023-04-05T12:12:25.373Z').toISOString(),
      running_time: 160 * 60 * 1000,
    },
  ],
  movieGenres: [
    { movie_id: 'm1', genre_type: 'action' },
    { movie_id: 'm1', genre_type: 'horror' },
    { movie_id: 'm2', genre_type: 'action' },
    { movie_id: 'm2', genre_type: 'musical' },
    { movie_id: 'm3', genre_type: 'action' },
    { movie_id: 'm3', genre_type: 'noir' },
    { movie_id: 'm4', genre_type: 'romance' },
    { movie_id: 'm4', genre_type: 'comedy' },
  ],
  movieCrews: [
    {
      movie_id: 'm1',
      crew_type: 'directer',
      person_name: '조수현',
    },
    {
      movie_id: 'm2',
      crew_type: 'directer',
      person_name: '조수현',
    },
    {
      movie_id: 'm3',
      crew_type: 'directer',
      person_name: '조수현',
    },
    {
      movie_id: 'm4',
      crew_type: 'directer',
      person_name: '조수현',
    },
  ],
  movieActors: [
    {
      movie_id: 'm1',
      actor_type: 'main',
      person_name: '조수현',
      character: '존 윅',
    },
    {
      movie_id: 'm1',
      actor_type: 'sub',
      person_name: '조수수현',
      character: '존존 윅',
    },
    {
      movie_id: 'm2',
      actor_type: 'main',
      person_name: '조수현',
      character: '존 윅',
    },
    {
      movie_id: 'm2',
      actor_type: 'sub',
      person_name: '조수수현',
      character: '존존 윅',
    },
    {
      movie_id: 'm3',
      actor_type: 'main',
      person_name: '조수현',
      character: '존 윅',
    },
    {
      movie_id: 'm3',
      actor_type: 'sub',
      person_name: '조수수현',
      character: '존존 윅',
    },
    {
      movie_id: 'm4',
      actor_type: 'main',
      person_name: '조수현',
      character: '존 윅',
    },
    {
      movie_id: 'm4',
      actor_type: 'sub',
      person_name: '조수수현',
      character: '존존 윅',
    },
  ],
};
