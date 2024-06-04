declare module "http" {
  interface IncomingMessage {
    protocol: "http" | "https"
  }
}