# Junior back-end assignment - movie api

***Movie CRUD API***

영화 정보 생성/조회/수정/삭제 API

## 빌드

- 터미널에서 `git clone https://github.com/a101201031/ticketplace-test [디렉터리명]`으로 프로젝트 파일을 다운받습니다.
- `nvm`을 사용중일 경우
  - `cd [디렉터리명]` 후 `nvm install`으로 node version을 동일하게 합니다.
- `nvm`을 사용하지 않을 경우
  - `.nvmrc`에 명시된 `node.js` 버전을 설치합니다.
- `yarn`으로 dependencies를 설치합니다.

## 실행

- `yarn start`으로 실행합니다.

## 테스트

api 문서: <https://documenter.getpostman.com/view/14087354/2s93Y2Thew#8e7f5876-b391-41db-a9df-76b6ef87865c>

api 문서를 참고하여 각 api에 요청을 보내 테스트합니다.

기본 API 경로: <http://localhost:8000/api/v1>

- init
  - POST /init: 데이터베이스를 초기화하고 더미데이터를 생성합니다. **프로젝트 최초 실행 시에 꼭 실행해주세요**
- movie
  - GET /movies: movie list를 조회합니다.
  - POST /movies: 새로운 movie를 생성합니다.
  - GET /movies/{movie_id}: 해당하는 movie 정보를 조회합니다.
  - PUT /movies/{movie_id}: 해당하는 movie 정보를 수정합니다.
  - DELETE /movies/{movie_id}: 해당하는 movie를 삭제합니다.

## 사용 stack

- node.js
- typescript
- serverless framework, middy
- sqlite3
- yup

## 프로젝트 구성

프로젝트 전반적인 코드는 `src`에 있습니다.

```
.
├── db                          # sqlite 데이터베이스 파일 생성 경로
│   └── readme.md
├── src
│   ├── functions               # 요청 처리 함수
│   │   ├── init.ts
│   │   ├── movieCreate.ts
│   │   ├── movieDelete.ts
│   │   ├── movieListRead.ts
│   │   ├── movieRead.ts
│   │   └── movieUpdate.ts
│   ├── libs                    # 유틸리티
│   │   ├── apiGateway.ts       # response 생성 유틸 
│   │   ├── database.ts         # 데이터베이스 연결 등의 유틸
│   │   ├── handlerResolver.ts  # 파일 경로 유틸
│   │   └── lambda.ts           # 미들웨어 연결 유틸
│   ├── middleware              # 미들웨어 디렉터리
│   │   ├── errorHandler.ts
│   │   ├── sqliteConnector.ts
│   │   └── validator.ts
│   ├── model                   # 데이터베이스 모델
│   │   └── movie.ts
│   ├── query                   # 데이터베이스 조작 쿼리 등의 로직
│   │   ├── movie.ts
│   │   └── reset.ts
│   └── handlers.ts             # API 경로와 함수 매칭 파일
├── README.md
├── package.json
├── serverless.ts               # serverless 프레임워크 설정 파일
├── tsconfig.json
├── tsconfig.paths.json
└── yarn.lock
```
