import { DefaultSession } from 'next-auth';

interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  role: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organizations?: UserOrganization[];
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organizations?: UserOrganization[];
  }
}
