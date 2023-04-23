import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import type {
  MovieActorModel,
  MovieCrewModel,
  MovieGenreModel,
  MovieModel,
} from '@model/movie';
import { insertData, resetTable } from '@query/reset';
import type { APIGatewayProxyResult } from 'aws-lambda';

export const fakeData: {
  movies?: MovieModel[];
  movieGenres?: MovieGenreModel[];
  movieCrews?: MovieCrewModel[];
  movieActors?: MovieActorModel[];
} = {
  movies: [
    {
      id: 'm1',
      title: '존 윅',
      rating: 27,
      releasedAt: new Date('1995-12-17T03:24:00').toISOString(),
      runningTime: 160 * 60 * 1000,
    },
    {
      id: 'm2',
      title: '존 윅2',
      rating: 47,
      releasedAt: new Date('2004-02-05T12:12:25.373Z').toISOString(),
      runningTime: 160 * 60 * 1000,
    },
    {
      id: 'm3',
      title: '존 윅3',
      rating: 67,
      releasedAt: new Date('2007-02-05T12:12:25.373Z').toISOString(),
      runningTime: 160 * 60 * 1000,
    },
    {
      id: 'm4',
      title: '존 윅4',
      rating: 100,
      releasedAt: new Date('2023-04-05T12:12:25.373Z').toISOString(),
      runningTime: 160 * 60 * 1000,
    },
  ],
  movieGenres: [
    { movieId: 'm1', type: 'action' },
    { movieId: 'm1', type: 'horror' },
    { movieId: 'm2', type: 'action' },
    { movieId: 'm2', type: 'musical' },
    { movieId: 'm3', type: 'action' },
    { movieId: 'm3', type: 'noir' },
    { movieId: 'm4', type: 'romance' },
    { movieId: 'm4', type: 'comedy' },
  ],
  movieCrews: [
    {
      movieId: 'm1',
      type: 'director',
      personName: '조수현',
    },
    {
      movieId: 'm2',
      type: 'director',
      personName: '조수현',
    },
    {
      movieId: 'm3',
      type: 'director',
      personName: '조수현',
    },
    {
      movieId: 'm4',
      type: 'director',
      personName: '조수현',
    },
  ],
  movieActors: [
    {
      movieId: 'm1',
      type: 'main',
      personName: '조수현',
      character: '존 윅',
    },
    {
      movieId: 'm1',
      type: 'sub',
      personName: '조수수현',
      character: '존존 윅',
    },
    {
      movieId: 'm2',
      type: 'main',
      personName: '조수현',
      character: '존 윅',
    },
    {
      movieId: 'm2',
      type: 'sub',
      personName: '조수수현',
      character: '존존 윅',
    },
    {
      movieId: 'm3',
      type: 'main',
      personName: '조수현',
      character: '존 윅',
    },
    {
      movieId: 'm3',
      type: 'sub',
      personName: '조수수현',
      character: '존존 윅',
    },
    {
      movieId: 'm4',
      type: 'main',
      personName: '조수현',
      character: '존 윅',
    },
    {
      movieId: 'm4',
      type: 'sub',
      personName: '조수수현',
      character: '존존 윅',
    },
  ],
};

const initFunction = async (): Promise<APIGatewayProxyResult> => {
  await resetTable();
  await insertData(fakeData);

  return formatJSONResponse({});
};

export const init = middyfy({ handler: initFunction });
