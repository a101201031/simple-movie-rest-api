import { EventEmitter } from 'eventemitter3';
import isObject from 'lodash/isObject';
import type { Database } from 'sqlite3';
import sqlite3 from 'sqlite3';
import { handlerPath } from './handler-resolver';

class DatabaseConnector {
  public readonly database: Database;

  #isConnected: boolean;

  #event: EventEmitter;

  constructor() {
    this.#isConnected = false;

    this.#event = new EventEmitter();
    this.#event.on('connected', () => {
      this.#isConnected = true;
    });
    this.#event.on('error', (err) => {
      console.error(err);
      this.#isConnected = false;
    });

    const sqliteVerbose = sqlite3.verbose();
    this.database = new sqliteVerbose.Database(
      `${handlerPath(__dirname)}/../../../../db/movie.db`,
      (err) => {
        if (err) {
          this.#event.emit('error', err);
          return;
        }
        this.#event.emit('connected');
      },
    );
  }

  isConnected() {
    return new Promise<boolean>((resolve, reject) => {
      if (this.#isConnected) {
        resolve(true);
      }

      let isCanceled = false;
      const timeout = setTimeout(() => {
        isCanceled = true;
        reject(new Error('Connection timed out'));
      }, 3_000);

      this.#event.once('connected', () => {
        if (isCanceled) return;
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }

  async getCursor() {
    await this.isConnected();
    return this.database;
  }

  dispose() {
    this.database.close();
    this.#event.removeAllListeners();
  }
}

interface SqliteError {
  code: 'SQLITE_ERROR';
  message: string;
}

export const isSqliteError = (err: unknown): err is SqliteError =>
  !!isObject(err) && 'code' in err && err.code === 'SQLITE_ERROR';

export const cursorRun = async (
  cursor: Database,
  { sql, values = [] }: { sql: string; values?: any[] },
) =>
  new Promise((resolve, reject) => {
    cursor.run(sql, values, (err: any, rows: any) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

export const cursorAll = async <Return extends any[]>(
  cursor: Database,
  { sql, values = [] }: { sql: string; values?: any[] },
): Promise<Return> =>
  new Promise((resolve, reject) => {
    cursor.all(sql, values, (err: any, rows: any) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

export const databaseConnector = new DatabaseConnector();
