const SHA_RE = /^[0-9a-fA-F]{40}$/

export function resolveCommitSha(
  env: Record<string, string | undefined>
): string {
  const renderSha = env.RENDER_GIT_COMMIT?.trim()
  if (renderSha && SHA_RE.test(renderSha)) {
    return renderSha
  }

  const fallbackSha = env.GIT_COMMIT_SHA?.trim()
  if (fallbackSha && SHA_RE.test(fallbackSha)) {
    return fallbackSha
  }

  return "unknown"
}
