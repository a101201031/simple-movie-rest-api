import type { AWS } from '@serverless/typescript';
import handlers from 'src/handlers';

const serverlessConfiguration: AWS = {
  service: 'ticketplace-test',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'ap-northeast-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  functions: handlers,
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['sqlite3'],
      packager: 'yarn',
    },
    'serverless-offline': {
      httpPort: 8000,
      host: '0.0.0.0',
      prefix: 'api/v1',
    },
  },
};

module.exports = serverlessConfiguration;
