import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // We can't easily verify the actual JWT validity in edge runtime without the secret,
  // but checking for existence of the cookie/token is usually enough for middleware, 
  // with the actual API rejecting invalid requests.
  // Wait, our API interceptor uses localStorage which means the token is not in cookies!
  // If the token is only in localStorage, the middleware CANNOT read it.
  
  // Since we use localStorage, the initial request will always look unauthenticated to the server.
  // We'll have to rely on client-side routing guards or switch to storing the access_token in a cookie.
  
  // For now, we will let client-side components handle the redirection, or just pass it through.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
