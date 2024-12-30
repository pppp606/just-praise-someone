import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // TypeScript ファイルを ts-jest でトランスパイル
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // ファイル拡張子のサポート
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // テストファイルのパターン
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // 絶対パスのエイリアスをサポート
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'], // トランスパイル対象外のディレクトリ
};

export default config;
