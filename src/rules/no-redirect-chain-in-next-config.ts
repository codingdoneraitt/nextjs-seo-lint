import { createRule, report } from '../utils/rule'

export const noRedirectChainInNextConfig = createRule(
  'no-redirect-chain-in-next-config',
  'detect redirect chains and temporary redirects in next.config',
  (context) => ({
    'Program:exit'(program) {
      if (!/next\.config\.[cm]?[jt]s$/.test(context.getFilename())) return
      const redirects = extractRedirects(context.sourceCode.getText())
      const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]))
      for (const redirect of redirects) {
        const next = bySource.get(redirect.destination)
        if (next) {
          report(
            context,
            program,
            `Redirect chain detected: "${redirect.source}" -> "${redirect.destination}" -> "${next.destination}".`,
          )
        }
        if (redirect.permanent === false || redirect.statusCode === 302 || redirect.statusCode === 307) {
          report(
            context,
            program,
            `Temporary redirect for "${redirect.source}"; use permanent redirects for URL moves.`,
          )
        }
      }
    },
  }),
  'suggestion',
)

function extractRedirects(
  text: string,
): Array<{ source: string; destination: string; permanent?: boolean; statusCode?: number }> {
  const redirects: Array<{ source: string; destination: string; permanent?: boolean; statusCode?: number }> =
    []
  for (const block of text.matchAll(
    /\{[^{}]*source\s*:\s*['"`]([^'"`]+)['"`][^{}]*destination\s*:\s*['"`]([^'"`]+)['"`][^{}]*\}/g,
  )) {
    const body = block[0]
    redirects.push({
      source: block[1],
      destination: block[2],
      permanent: /permanent\s*:\s*true/.test(body)
        ? true
        : /permanent\s*:\s*false/.test(body)
          ? false
          : undefined,
      statusCode: Number(body.match(/statusCode\s*:\s*(\d+)/)?.[1] ?? 0) || undefined,
    })
  }
  return redirects
}
