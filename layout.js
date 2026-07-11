import "./globals.css";
import siteConfig from "../site.config";

export const metadata = {
  title: siteConfig.siteName,
  description: siteConfig.tagline
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Source+Serif+4:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap">
            <div className="brand-row">
              <span className="signal-bars" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </span>
              <a href="/" className="site-title">{siteConfig.siteName}</a>
            </div>
            <p className="tagline">{siteConfig.tagline}</p>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="wrap">
            published automatically, one dispatch a day
          </div>
        </footer>
      </body>
    </html>
  );
}
