
// Resource loading optimization utilities
export class ResourceOptimizer {
  private static loadedResources = new Set<string>();
  private static failedResources = new Set<string>();

  static async loadResource(url: string, type: 'script' | 'style' | 'font'): Promise<boolean> {
    if (this.loadedResources.has(url)) {
      return true;
    }

    if (this.failedResources.has(url)) {
      console.warn(`Skipping previously failed resource: ${url}`);
      return false;
    }

    try {
      switch (type) {
        case 'script':
          await this.loadScript(url);
          break;
        case 'style':
          await this.loadStylesheet(url);
          break;
        case 'font':
          await this.loadFont(url);
          break;
      }
      
      this.loadedResources.add(url);
      return true;
    } catch (error) {
      console.error(`Failed to load ${type}:`, url, error);
      this.failedResources.add(url);
      return false;
    }
  }

  private static loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private static loadStylesheet(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  private static loadFont(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = href;
      link.crossOrigin = 'anonymous';
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Clean up unused preloaded resources
  static cleanupUnusedPreloads(): void {
    setTimeout(() => {
      const preloads = document.querySelectorAll('link[rel="preload"]');
      preloads.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        const as = (link as HTMLLinkElement).as;
        
        let isUsed = false;
        
        if (as === 'font') {
          // Check if font is actually being used
          isUsed = Array.from(document.fonts).some(font => 
            href.includes(font.family.toLowerCase().replace(/\s+/g, '-'))
          );
        } else if (as === 'script') {
          isUsed = !!document.querySelector(`script[src="${href}"]`);
        } else if (as === 'style') {
          isUsed = !!document.querySelector(`link[href="${href}"][rel="stylesheet"]`);
        }

        if (!isUsed) {
          link.remove();
          console.info(`🧹 Removed unused preload: ${href}`);
        }
      });
    }, 3000);
  }
}
