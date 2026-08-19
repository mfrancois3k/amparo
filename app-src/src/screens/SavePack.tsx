/* Save-my-pack: the one feature accounts exist for. Loaded lazily, ON CLICK,
 * from PrintStep — ClerkProvider/ConvexProviderWithClerk live inside THIS
 * chunk per main.tsx's bundle-size decision, so only users who tap "Save my
 * pack" ever download auth code.
 *
 * What syncs: the pack's text fields + state + language. What NEVER syncs:
 * document photos and practice history — the Convex schema has no columns
 * for them (schema.ts is the privacy policy).
 */
import { ClerkProvider, SignInButton, UserButton, useAuth, useUser } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { getConvexClient } from '../clerkAndConvex'
import { useState } from 'react'
import type { Bank } from '../i18n'
import { useLang } from '../i18n'
import { readApp, writeApp } from '../services/storage'
import { EMPTY_INFO, type YouInfo } from './youTypes'

type Props = { t: Bank; state: string | null }

function SavePanel({ t, state }: Props) {
  const { isSignedIn } = useUser()
  const { lang } = useLang()
  const save = useMutation(api.packs.save)
  const cloud = useQuery(api.packs.get)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setStatus('saving')
    try {
      const you = readApp<YouInfo>('you', EMPTY_INFO)
      await save({ state, ...you, lang })
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  const handleRestore = () => {
    if (!cloud) return
    const { name, ec, ecp, ec2, ecp2, att, zip } = cloud
    writeApp('you', { name, ec, ecp, ec2, ecp2, att, zip })
    /* state/lang restore intentionally not applied silently — the on-device
       choice wins; the restored fields appear next time You renders. */
    setStatus('saved')
  }

  if (!isSignedIn) {
    return (
      <div>
        <p className="soon" style={{ textAlign: 'left', margin: '6px 0 10px' }}>{t.acct_why}</p>
        <SignInButton mode="modal">
          <button type="button" className="btn ghost">{t.acct_signin}</button>
        </SignInButton>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 10px' }}>
        <UserButton />
        <span className="soon" style={{ textAlign: 'left' }}>{t.acct_scope}</span>
      </div>
      <button type="button" className="btn ghost" onClick={handleSave} disabled={status === 'saving'}>
        {status === 'saved' ? t.acct_saved : t.acct_save}
      </button>
      {cloud ? (
        <button type="button" className="btn ghost" style={{ marginTop: 8 }} onClick={handleRestore}>
          {t.acct_restore}
        </button>
      ) : null}
      {status === 'error' ? <p className="soon" style={{ color: '#7a2e2e' }}>{t.acct_err}</p> : null}
    </div>
  )
}

export default function SavePack(props: Props) {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!clerkKey) return null
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={getConvexClient()} useAuth={useAuth}>
        <SavePanel {...props} />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
