declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production';
        REACT_APP_SUPPORTED_NETWORKS: string,
        REACT_APP_DEFAULT_NETWORK: string
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}