import React, { useState } from 'react';
import { useVault, LockType } from '../hooks/useVault';

const Home: React.FC = () => {
    const { session, vaultIsLocked, storeSession, restoreSession, lockVault, unlockVault, canUseBiometrics, canUseSystemPin, setLockType } = useVault();
    const [data, setData] = useState<string>('');
  
    return (
      <div>
        <form onSubmit={(e) => {
            e.preventDefault();
            return false;
        }}>
            <div style={{ flex: 'auto' }}>
                <input type="text" value={data} onChange={e => setData(e.target.value)}/>
            </div>
            <div style={{ flex: 'auto' }}>
                <button onClick={() => storeSession(data)}>Set session data</button>
            </div>
            
            <div style={{ flex: 'auto' }}>
                <button onClick={() => restoreSession()}>Reset session data</button>
            </div>

            <div style={{ flex: 'auto' }}>
                <button onClick={() => lockVault()}>Lock Vault</button>
            </div>

            <div style={{ flex: 'auto' }}>
                <button onClick={() => unlockVault()}>Unlock Vault</button>
            </div>

            <div>
                <input type="radio" id="nolocking" name="lockType" value="NoLocking" onChange={(e) => {
                    if(e.target.checked) setLockType('NoLocking')
                }}/>
                <label htmlFor="nolocking">Do Not Lock</label>
            </div>

            <div>
                <input type="radio" id="biometrics" name="lockType" value="Biometrics" disabled={!canUseBiometrics} onChange={(e) => {
                    if(e.target.checked) setLockType('Biometrics')
                }}/>
                <label htmlFor="biometrics">Biometrics</label>
            </div>

            <div>
                <input type="radio" id="systempasscode" name="lockType" value="SystemPasscode" disabled={!canUseSystemPin} onChange={(e) => {
                    if(e.target.checked) setLockType('SystemPasscode')
                }}/>
                <label htmlFor="systempasscode">SystemPasscode</label>
            </div>

            <div style={{ flex: 'auto' }}>
                <div>Session Data: {session}</div>
                <div>Vault Locked: {vaultIsLocked}</div>
            </div>

        </form>
    </div>
   
    );
  };
  
  export default Home;