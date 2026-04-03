type EnvConfig = {
  apiBaseUrl: string;
  mode: 'development' | 'production' | 'test';
};

class Environment {
  private static instance: Environment;
  private config: EnvConfig;

  private constructor() {
    this.config = {
      apiBaseUrl: this.get('VITE_API_BASE_URL', ''),
      mode: this.get('VITE_ENV', 'development') as EnvConfig['mode'],
    };
    this.validate();
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  //   Getter public chỉ được đọc
  get apiBaseUrl() {
    return this.config.apiBaseUrl;
  }

  get mode() {
    return this.config.mode;
  }

  private get(key: string, fallback: string): string {
    return import.meta.env[key] || fallback;
  }

  //   Bắt lỗi nêu mà không có biến môi trường thì sẽ làm gì
  private validate() {
    if (!this.config.apiBaseUrl) {
      throw new Error('Missing VITE_API_BASE_URL');
    }
    if (!['development', 'production', 'test'].includes(this.config.mode)) {
      throw new Error('Invalid VITE_ENV');
    }
  }
}

// export sử dụng cho toàn app
export const env = Environment.getInstance();
