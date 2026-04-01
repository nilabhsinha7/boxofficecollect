import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const username = process.env.INTERNAL_BASIC_AUTH_USER;
  const password = process.env.INTERNAL_BASIC_AUTH_PASSWORD;
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (!username || !password) {
    if (isProduction) {
      return new NextResponse("Internal route is disabled until Basic Auth credentials are configured.", {
        status: 503,
        headers: {
          "x-robots-tag": "noindex, nofollow"
        }
      });
    }

    const response = NextResponse.next();
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

  const authorization = request.headers.get("authorization");
  const expected = `Basic ${btoa(`${username}:${password}`)}`;

  if (authorization === expected) {
    const response = NextResponse.next();
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="BoxOfficeCollect Internal"',
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

export const config = {
  matcher: ["/internal/:path*"]
};
