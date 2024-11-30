import { useEffect } from "react";
import { useSwitchNetwork, useNetwork } from 'wagmi';

const AvalancheNetworkEnforcer = () => {
  const { chain } = useNetwork();
  const { switchNetworkAsync, isLoading, error } = useSwitchNetwork();

  const enforceAvalanche = async () => {
    if (chain?.id !== 43114) {
      try {
        await switchNetworkAsync(43114);
      } catch (error) {
        console.error('Error al cambiar de red:', error);
      }
    }
  };

  useEffect(() => {
    enforceAvalanche();
  }, [chain]);

  if (isLoading) return <p>Changing avalanche network...</p>;
  if (error) return <p>Error when change network: {error.message}</p>;

  return null;
};

export default AvalancheNetworkEnforcer;