/* Beta shell — wargames/15 Move 1.3.
 *
 * This is deliberately almost empty. Phase 2 adds the mechanical content
 * extractor and the storage adapter; Phase 3 ports the first real screens. The
 * only thing that ships now is an honest statement of what this build is.
 *
 * The two strings below are the ONLY hand-written user-facing copy allowed in
 * /app. Everything else — every officer line, every legal phrase, every label —
 * arrives via tools/extract-app-content.mjs from index.html, hash-matched
 * (wargames/15 §0.2). They are shown in both languages at once rather than
 * behind a toggle: the language toggle is real state that Phase 3 builds
 * properly, and faking one here would be the "convincing stub" this project
 * keeps warning about.
 */
export default function App() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px' }}>
      <p
        style={{
          background: 'var(--white)',
          border: '1.5px solid var(--line)',
          borderLeft: '5px solid var(--gold)',
          borderRadius: 'var(--radius)',
          padding: '16px 18px',
          fontSize: 14,
        }}
      >
        <strong>Preview build.</strong> The live app is at{' '}
        <a href="/" style={{ color: 'var(--navy)' }}>
          amparohq.com
        </a>
        .
        <br />
        <span style={{ color: 'var(--muted)' }}>
          <strong>Versión de prueba.</strong> La aplicación real está en{' '}
          <a href="/" style={{ color: 'var(--navy)' }}>
            amparohq.com
          </a>
          .
        </span>
      </p>
    </main>
  )
}
