
// External scripts management
export const externalScripts = {
  analytics: {
    plausible: {
      src: 'https://plausible.io/js/script.js',
      'data-domain': 'pipelinelabs.app',
      defer: true
    }
  },
  tracking: {
    gtag: {
      src: 'https://www.googletagmanager.com/gtag/js',
      async: true
    }
  }
};

// Script loading utility with error handling
export const loadExternalScript = (scriptConfig: any, onError?: () => void) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    Object.keys(scriptConfig).forEach(key => {
      if (key === 'src') {
        script.src = scriptConfig[key];
      } else {
        script.setAttribute(key, scriptConfig[key]);
      }
    });

    script.onload = () => resolve(script);
    script.onerror = () => {
      console.warn(`Failed to load external script: ${scriptConfig.src}`);
      if (onError) onError();
      reject(new Error(`Script load failed: ${scriptConfig.src}`));
    };

    document.head.appendChild(script);
  });
};
