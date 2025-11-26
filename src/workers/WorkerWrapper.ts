export default function WorkerWrapper(options?: { name?: string }) {
  const workerUrl = new URL("./analysisWorker.ts", import.meta.url);
  console.log("[WorkerWrapper] spawning analysis worker:", workerUrl.href);

  return new Worker(workerUrl, {
    type: "module",
    name: options?.name ?? "analysisWorker",
  });
}
