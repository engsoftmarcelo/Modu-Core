const internalOrigin = "https://moducore.internal";

function parseHttpOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback = "/inicio",
) {
  if (!value?.startsWith("/")) {
    return fallback;
  }

  try {
    const url = new URL(value, internalOrigin);

    if (url.origin !== internalOrigin) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

type ResolveSiteOriginOptions = {
  configuredSiteUrl?: string;
  environment?: string;
  requestOrigin?: string | null;
};

export function resolveSiteOrigin({
  configuredSiteUrl,
  environment = "production",
  requestOrigin,
}: ResolveSiteOriginOptions) {
  const configuredOrigin = parseHttpOrigin(configuredSiteUrl);

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (environment !== "production") {
    return parseHttpOrigin(requestOrigin) ?? "http://localhost:3000";
  }

  return null;
}
