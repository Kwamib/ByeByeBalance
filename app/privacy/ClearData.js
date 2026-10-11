'use client';

import { useState } from 'react';
import { clearSaved } from '../../lib/storage';

export default function ClearData() {
  const [done, setDone] = useState('');
  const onClick = () => {
    if (!window.confirm('Clear your saved plan, check-ins, budget and home scenario on this device? This can’t be undone, so export a backup first if you want to keep them.')) return;
    setDone(clearSaved() ? 'Saved data cleared.' : 'This browser isn’t allowing storage access, so there was nothing to clear.');
  };
  return (
    <div className="row">
      <button type="button" className="secondary" onClick={onClick}>Clear all saved data</button>
      <span role="status" className="note">{done}</span>
    </div>
  );
}
