import { useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PlaidLinkProps {
  linkToken: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
}

export function PlaidLink({
  linkToken,
  onSuccess,
  onExit,
  buttonText = 'Connect Bank Account',
  buttonVariant = 'default',
}: PlaidLinkProps) {
  const [ready, setReady] = useState(false);

  const handleOnSuccess: PlaidLinkOnSuccess = (public_token, metadata) => {
    onSuccess(public_token, metadata);
  };

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: (error, metadata) => {
      if (onExit) {
        onExit(error, metadata);
      }
      console.log('Plaid Link exited:', error, metadata);
    },
    onLoad: () => {
      setReady(true);
    },
  };

  const { open, ready: plaidReady } = usePlaidLink(config);

  useEffect(() => {
    if (plaidReady) {
      setReady(true);
    }
  }, [plaidReady]);

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      variant={buttonVariant}
      size="lg"
      className="w-full"
    >
      {!ready ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}

