declare module "*.mjs?url" {
  const url: string;
  export default url;
}

declare module "*.js?url" {
  const url: string;
  export default url;
}

declare module "*.worker.js?url" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*?worker" {
  const workerConstructor: {
    new (options?: WorkerOptions): Worker;
  };
  export default workerConstructor;
}
