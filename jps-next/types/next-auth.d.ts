import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user']; // 既存の型に id を追加
  }
  // Profileにlogin？: string;を追加、他は既存の型をそのまま使う
  interface Profile {
    login?: string;
  }
}
