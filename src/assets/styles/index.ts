
// External stylesheets management
export const externalStyles = {
  fonts: {
    googleFonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  icons: {
    fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  }
};

// Stylesheet loading utility
export const loadExternalStylesheet = (href: string, media: string = 'all') => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = media;
  document.head.appendChild(link);
};
