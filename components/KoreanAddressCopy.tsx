'use client';

import React, {useRef, useState} from 'react';

export default function KoreanAddressCopy({korean, primary}: {korean: string; primary: string}) {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const copying = useRef(false);
  if (!korean) return null;

  async function copyAddress() {
    if (copying.current) return;
    copying.current = true;
    setPending(true);
    setStatus('');
    try {
      await navigator.clipboard.writeText(korean);
      setStatus('Korean address copied.');
    } catch {
      setStatus('Could not copy. Select the address text and copy it manually.');
    } finally {
      copying.current = false;
      setPending(false);
    }
  }

  const controls = <>
    <button type="button" onClick={copyAddress} disabled={pending}
      className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-60">
      {pending ? 'Copying…' : 'Copy Korean address'}
    </button>
    <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-slate-600">{status}</p>
  </>;

  return korean !== primary ? <details>
    <summary className="cursor-pointer min-h-11 py-3 underline">Korean address for taxi / copy</summary>
    <p lang="ko" className="select-all break-words pb-2">{korean}</p>
    {controls}
  </details> : <div>{controls}</div>;
}
