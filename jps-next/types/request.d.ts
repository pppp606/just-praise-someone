export type PutUserWithProfileRequest = {
  name: string;
  profile: {
    bio: string;
    snsLinks: Record<string, string>;
  };
};
