'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Download, Upload, Lock } from './Icons';
import {
  MAX_BACKUP_BYTES, readBackup, applyBackup, collectBackupData, exportBackup, readLastBackup, lastBackupStatus,
} from '../../lib/backup';
import { downloadText } from '../../lib/exportCsv';

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const DOT = { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'currentColor', marginRight: 6, verticalAlign: 1 };
const downloadJson = (name, text) => downloadText(name, text, 'application/json');

function BackupBadge({ status }) {
  // Before mount, keep the same box (hidden) so server and browser markup match and nothing shifts.
  const shown = status || { tone: 'none', text: 'No backup saved yet' };
  return (
    <span
      className={`tag backup-status${shown.tone === 'fresh' ? '' : ' warn'}`}
      style={{ marginTop: 4, visibility: status ? undefined : 'hidden' }}
      aria-hidden={status ? undefined : 'true'}
    >
      <span aria-hidden="true" style={DOT} />{shown.text}
    </span>
  );
}

/**
 * Export and import a backup of everything saved on this device.
 * Shared by /planner, /progress and /budget.
 *
 * getBudget()  optional: the budget currently on screen (/budget), or null to use the saved one.
 * onRestored() called after a restore succeeds, so the page can reload its data.
 * toast(msg)   the page's toast.
 */
export default function BackupPanel({ getBudget, onRestored, toast }) {
  const [restore, setRestore] = useState(null); // validated backup awaiting confirmation
  const [error, setError] = useState('');
  const [lastBackup, setLastBackup] = useState(undefined); // undefined until mounted
  const [announce, setAnnounce] = useState('');
  const fileRef = useRef(null);
  const confirmRef = useRef(null);
  const ids = useId();
  const privateNoteId = `${ids}-private`;

  useEffect(() => { setLastBackup(readLastBackup()); }, []);
  useEffect(() => { if (restore) confirmRef.current?.focus(); }, [restore]);
  const status = lastBackup === undefined ? null : lastBackupStatus(lastBackup);

  const onExport = () => {
    setError('');
    const data = collectBackupData(getBudget ? getBudget() : null);
    if (data.empty) { setError('Nothing is saved on this device yet, so there’s nothing to back up.'); return; }
    let stamp;
    try { stamp = exportBackup(data, { download: downloadJson }); } catch { setError('The backup file couldn’t be created in this browser.'); return; }
    if (!stamp) return;
    setLastBackup(stamp);
    setAnnounce(`Backup file saved. ${lastBackupStatus(stamp).text}.`);
  };

  const onFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setError('');
    setRestore(null);
    if (!file) return;
    // Check the size before reading anything from the file.
    if (file.size > MAX_BACKUP_BYTES) { setError('That file is too large to be a ByeByeBalance backup.'); return; }
    let text;
    try { text = await file.text(); } catch { setError('That file couldn’t be read.'); return; }
    const res = readBackup(text, file.size);
    if (!res.ok) { setError(res.error); return; }
    setRestore(res);
  };

  const apply = mode => {
    const res = applyBackup(restore, mode, { currentBudget: getBudget ? getBudget() : null });
    setRestore(null);
    if (!res.ok) { setError(res.error); return; }
    onRestored?.();
    toast?.(mode === 'merge' ? 'Backup merged' : 'Backup restored');
  };

  const s = restore?.summary;
  const exported = restore?.exportedAt ? `Saved ${new Date(restore.exportedAt).toLocaleDateString()}. ` : '';

  return (
    <div className="card no-print">
      <div className="panel-title" style={{ flexWrap: 'wrap', columnGap: 16, rowGap: 0 }}>
        <h3 style={{ margin: '0 0 10px' }}>Back up your plan</h3>
        <BackupBadge status={status} />
      </div>
      <p>Your plan lives only in this browser. Clearing browser data or switching devices removes it, so save a copy now and then.</p>
      <div className="export-grid">
        <button type="button" onClick={onExport} aria-describedby={privateNoteId}><Download /> Save a backup file</button>
        <button type="button" className="secondary" onClick={() => fileRef.current?.click()}><Upload /> Restore from a file</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
      <p id={privateNoteId} className="note" style={{ margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lock /> This file contains your plan details. Keep it somewhere private.
      </p>
      <p className="visually-hidden" role="status" aria-live="polite">{announce}</p>
      {error && <div className="notice warn" role="alert" style={{ marginTop: 14 }}><p>{error}</p></div>}
      {restore && (
        <div className="import-preview" role="group" aria-labelledby={`${ids}-confirm`} style={{ marginTop: 14 }}>
          <p id={`${ids}-confirm`} ref={confirmRef} tabIndex={-1} style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink)' }}>Restore this backup?</p>
          <p className="note" style={{ margin: '0 0 10px' }}>
            {exported}
            {plural(s.debts, 'debt')} and {plural(s.checkIns, 'check-in')} in My plan; {plural(s.expenses, 'expense')} and {plural(s.budgetDebts, 'debt payment')} in the budget{s.home ? '; your home-buying numbers' : ''}.
          </p>
          <p className="note"><strong>Replace</strong> swaps what’s saved on this device for what’s in the backup. <strong>Merge</strong> keeps what you have and adds budget rows that aren’t here yet. If anything goes wrong, nothing is changed.</p>
          <div className="row">
            <button type="button" className="small" onClick={() => apply('replace')}>Replace</button>
            <button type="button" className="secondary small" onClick={() => apply('merge')}>Merge</button>
            <button type="button" className="secondary small" onClick={() => setRestore(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
