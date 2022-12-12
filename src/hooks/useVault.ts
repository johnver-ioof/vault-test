import { useMemo, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';


const unsecuredConfig: IdentityVaultConfig = {
    key: 'au.com.insignia.unsecuredvault',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 2000,
    shouldClearVaultAfterTooManyFailedAttempts: true,
    customPasscodeInvalidUnlockAttempts: 2,
    unlockVaultOnLoad: false,
  };

const config: IdentityVaultConfig = {
  key: 'au.com.insignia.vault',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

export type LockType = 'NoLocking' | 'Biometrics' | 'SystemPasscode' | 'Both' | undefined;

const getConfigUpdates = (lockType: LockType) => {
    switch (lockType) {
      case 'Biometrics':
        return {
          type: VaultType.DeviceSecurity,
          deviceSecurityType: DeviceSecurityType.Biometrics,
          unlockVaultOnLoad: true
        };
        case 'Both':
          return {
            type: VaultType.DeviceSecurity,
            deviceSecurityType: DeviceSecurityType.Both,
            unlockVaultOnLoad: true
          };
      case 'SystemPasscode':
        return {
          type: VaultType.DeviceSecurity,
          deviceSecurityType: DeviceSecurityType.SystemPasscode,
          unlockVaultOnLoad: true
        };
      default:
        return {
          type: VaultType.SecureStorage,
          deviceSecurityType: DeviceSecurityType.None,
        };
    }
  };

export const useVault = () => {
  const [session, setSession] = useState<string | undefined>(undefined);
  const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
  const [lockType, setLockType] = useState<LockType>(undefined);
  const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);
  const [canUseSystemPin, setCanUseSystemPin] = useState<boolean>(false);
  const isMobile = Capacitor.isNativePlatform()
  
  const unsecuredVault = useMemo(() => {
    const vault =
    Capacitor.getPlatform() === 'web'
      ? new BrowserVault(unsecuredConfig)
      : new Vault(unsecuredConfig);

    return vault;
  }, []);

  const vault = useMemo(() => {
    const vault =
    Capacitor.getPlatform() === 'web'
      ? new BrowserVault(config)
      : new Vault(config);

    vault.onLock(() => {
        setVaultIsLocked(true);
        setSession(undefined);
        vault.isLocked().then(setVaultIsLocked);
    });

    vault.onUnlock(() => setVaultIsLocked(false));

    return vault;
  }, []);

  useEffect(() => {
    if (lockType) {
      const { type, deviceSecurityType, unlockVaultOnLoad } = getConfigUpdates(lockType);
      const newConfig = { ...vault.config, type, deviceSecurityType, unlockVaultOnLoad }
      vault.updateConfig(newConfig);
      console.log('newConfig', newConfig)
      unsecuredVault.setValue('existingConfig', newConfig).catch((err) => console.log('err',err))
    }
  }, [lockType, vault]);

  useEffect(() => {
    if (isMobile) {
      Device.isSystemPasscodeSet().then(setCanUseSystemPin);
      Device.isBiometricsEnabled().then(setCanUseBiometrics);
      Device.setHideScreenOnBackground(true);
    }
  }, []);

  const storeSession = async (value: string): Promise<void> => {
    setSession(value);
    await vault.setValue(key, value);
  };

  const restoreSession = async (): Promise<void> => {
    const value = await vault.getValue(key);
    setSession(value);
  };

  const lockVault = async (): Promise<void> => {
    await vault.lock();
  };
  
  const unlockVault = async (): Promise<void> => {
    await vault.unlock();
  };

    
  const clearVault = async (): Promise<void> => {
    try {
      await vault.clear();
    } catch (e) {
      console.log('clearVault', e)
    }
  };

  return { session, vaultIsLocked, storeSession, restoreSession, lockVault,
    unlockVault, canUseBiometrics, setLockType, canUseSystemPin, clearVault};
};