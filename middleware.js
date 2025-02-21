"use server";
import { NextResponse, userAgent } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export function middleware(request) {
  try {
    const ip =
      request.ip || request.headers.get("x-forwarded-for") || "Unknown IP";

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    // Determine if we are in development mode
    const isDev = process.env.NODE_ENV === "development";

    let scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https: http:`;
    let styleSrc = `'self' https://fonts.googleapis.com 'unsafe-inline'`;
    let upgradeInsecureRequests = "upgrade-insecure-requests";
    let connectSrc = `'self' ${
      isDev ? "http://localhost:3000" : process.env.DOMAIN
    }`;
    let accessControlAllowOrigin = isDev
      ? "http://localhost:3000"
      : process.env.DOMAIN;
    let workerSource = "'self' blob:";

    // If in development mode, add 'unsafe-eval'
    if (isDev) {
      scriptSrc += " 'unsafe-eval'";
      //styleSrc += " 'unsafe-inline'";
      upgradeInsecureRequests = "";
    } else {
      //styleSrc += ` 'nonce-${nonce}'`;
    }

    const { device } = userAgent(request);
    const touchScreen = device.type === "mobile" || device.type === "tablet";

    const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self' data:;
    font-src 'self' https://fonts.gstatic.com ;
    object-src 'none';
    frame-src 'none';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    connect-src 'self' ${connectSrc};
    media-src 'self';
    worker-src ${workerSource};
    manifest-src 'self';
    block-all-mixed-content;
    ${upgradeInsecureRequests};
    script-src-attr 'none';


    `;

    // Replace newline characters and spaces
    const contentSecurityPolicyHeaderValue = cspHeader
      .replace(/\s{2,}/g, " ")
      .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("touch", touchScreen ? "true" : "false");
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set(
      "Content-Security-Policy",
      contentSecurityPolicyHeaderValue
    );
    // Strict-Transport-Security: Enforces HTTPS connections for the next year, helping to prevent man-in-the-middle attacks
    requestHeaders.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains;"
    );

    // X-Frame-Options: Prevents the site from being embedded in an iframe, which protects against clickjacking attacks
    requestHeaders.set("X-Frame-Options", "DENY");

    // X-Content-Type-Options: Prevents browsers from MIME-sniffing, which helps protect against certain types of attacks where files are interpreted as the wrong type
    requestHeaders.set("X-Content-Type-Options", "nosniff");

    // Referrer-Policy: Controls the amount of referrer information sent with requests, preventing leakage of sensitive URLs
    requestHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy: Restricts the use of certain browser features (like geolocation, camera, etc.) to enhance security and privacy
    requestHeaders.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );

    // X-XSS-Protection: Enables the XSS filter built into most browsers, and blocks pages if an XSS attack is detected
    requestHeaders.set("X-XSS-Protection", "1; mode=block");

    // X-DNS-Prefetch-Control: Disables DNS prefetching to prevent potential information leaks and reduce exposure to DNS rebinding attacks
    requestHeaders.set("X-DNS-Prefetch-Control", "off");

    // X-Download-Options: Prevents automatic opening of downloaded files in IE, mitigating the risk of executing malicious content
    requestHeaders.set("X-Download-Options", "noopen");

    // X-Permitted-Cross-Domain-Policies: Restricts Adobe Flash and PDF files from loading content from your domain, reducing cross-domain attacks
    requestHeaders.set("X-Permitted-Cross-Domain-Policies", "none");

    // Clear-Site-Data: Clears browsing data (cookies, storage, cache) to enhance security, especially useful after a user logs out

    //requestHeaders.set(
    //  "Clear-Site-Data",
    //  '"cache", "cookies", "storage", "executionContexts"'
    //);
    // Log the IP address along with other details

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set(
      "Content-Security-Policy",
      contentSecurityPolicyHeaderValue
    );

    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains;"
    );
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-DNS-Prefetch-Control", "off");

    response.headers.set("X-Download-Options", "noopen");
    response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    //response.headers.set(
    //  "Clear-Site-Data",
    //  '"cache", "cookies", "storage", "executionContexts"'
    //);

    response.headers.set(
      "Access-Control-Allow-Origin",
      accessControlAllowOrigin
    ); // Needs to be updated

    // Allow the HTTP methods that your application will handle
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    // Allow specific headers that might be used in requests. Include any custom headers your application requires.
    //response.headers.set("Access-Control-Allow-Headers", "Content-Type"); // not sure about this one ?

    // Indicate whether credentials (like cookies) should be allowed - cross origin -?
    //response.headers.set("Access-Control-Allow-Credentials", "false");

    // Expose specific headers to the client. This is useful if the client needs to access certain headers.
    //response.headers.set("Access-Control-Expose-Headers", "Content-Length, X-Custom-Header");

    // Cache preflight response for 24 hours (86400 seconds) // Cache's OPTIONS response
    response.headers.set("Access-Control-Max-Age", "86400");
    return response;
  } catch (error) {
    console.error(`An unexpected error occurred from middleware: `, error);
  }
}
