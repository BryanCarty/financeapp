import { NextResponse } from "next/server";

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Determine if we are in development mode
  const isDev = process.env.NODE_ENV === "development";

  let scriptSrc = "'self'";
  let styleSrc = "'self' https://fonts.googleapis.com";
  let upgradeInsecureRequests = "upgrade-insecure-requests";
  let connectSrc = "https://insightsofatrader.com";
  let accessControlAllowOrigin = "https://insightsofatrader.com";
  let workerSource = "'self'";
  // If in development mode, add 'unsafe-eval'
  if (isDev) {
    scriptSrc += " 'unsafe-eval' 'unsafe-inline'";
    styleSrc += " 'unsafe-eval' 'unsafe-inline'";
    upgradeInsecureRequests = "";
    connectSrc = "https://0.0.0.0:8080 http://0.0.0.0:8080";
    accessControlAllowOrigin = "*";
    workerSource += " blob:";
  }

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self';
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
  //requestHeaders.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy: Controls the amount of referrer information sent with requests, preventing leakage of sensitive URLs
  requestHeaders.set("Referrer-Policy", "no-referrer-when-downgrade");

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

  /*requestHeaders.set(
    "Clear-Site-Data",
    '"cache", "cookies", "storage", "executionContexts"'
  );*/

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
  //response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  /*response.headers.set(
    "Clear-Site-Data",
    '"cache", "cookies", "storage", "executionContexts"'
  );*/

  response.headers.set("Access-Control-Allow-Origin", accessControlAllowOrigin); // Needs to be updated

  // Allow the HTTP methods that your application will handle
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // Allow specific headers that might be used in requests. Include any custom headers your application requires.
  response.headers.set("Access-Control-Allow-Headers", "Content-Type"); // not sure about this one ?

  // Indicate whether credentials (like cookies) should be allowed
  //response.headers.set("Access-Control-Allow-Credentials", "true");

  // Expose specific headers to the client. This is useful if the client needs to access certain headers.
  //response.headers.set("Access-Control-Expose-Headers", "Content-Length, X-Custom-Header");

  // Cache preflight response for 24 hours (86400 seconds) // Cache's OPTIONS response
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}
