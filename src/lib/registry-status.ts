/**
 * The registry and Honeymoon Fund accept submissions only when REGISTRY_OPEN is
 * exactly "true", so an unset variable leaves them closed.
 */
export function isRegistryOpen() {
  return process.env.REGISTRY_OPEN === 'true';
}
