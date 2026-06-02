// Connection manager — stubbed for TDD
// Implementation agent will fill this in

export function handleConnection(ws, req) {
  throw new Error("Not implemented");
}

export function handleMessage(ws, message) {
  throw new Error("Not implemented");
}

export function handleDisconnect(ws, code, reason) {
  throw new Error("Not implemented");
}

export function setConnectionMetadata(ws, metadata) {
  throw new Error("Not implemented");
}

export function getConnectionMetadata(ws) {
  throw new Error("Not implemented");
}
