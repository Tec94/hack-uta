import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaidLink } from '@/components/plaid/PlaidLink';
import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { 
  createLinkToken, 
  exchangePublicToken, 
  getTransactions,
  calculateSpendingFromTransactions,
  SANDBOX_CREDENTIALS 
} from '@/lib/plaid';
import { useUserStore } from '@/store/userStore';

export function LinkBankPage() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'connecting' | 'processing' | 'success'>('setup');
  const { setBudget, setLinkedBank, setOnboardingCompleted } = useUserStore();

  // Create link token on component mount
  useEffect(() => {
    const initPlaid = async () => {
      try {
        if (!user?.sub) {
          throw new Error('User not authenticated');
        }
        
        const token = await createLinkToken(user.sub);
        setLinkToken(token);
      } catch (err) {
        console.error('Error creating link token:', err);
        setError('Failed to initialize Plaid. Please check your API credentials.');
      }
    };

    initPlaid();
  }, [user]);

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    console.log('Plaid Link success:', metadata);
    setStep('processing');

    try {
      // Exchange public token for access token
      const { access_token, item_id } = await exchangePublicToken(publicToken);
      console.log('Access token obtained:', item_id);

      // Get transactions from last 30 days
      const { transactions } = await getTransactions(access_token);
      console.log(`Retrieved ${transactions.length} transactions`);

      // Calculate spending by category
      const spending = calculateSpendingFromTransactions(transactions);
      console.log('Calculated spending:', spending);

      // Store budget in user store
      setBudget({
        dining: Math.round(spending.dining),
        gas: Math.round(spending.gas),
        groceries: Math.round(spending.groceries),
        travel: Math.round(spending.travel),
        shopping: Math.round(spending.shopping),
        entertainment: Math.round(spending.entertainment),
      });

      setLinkedBank(true);
      setStep('success');

      // Navigate to dashboard after short delay
      setTimeout(() => {
        setOnboardingCompleted(true);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error processing Plaid data:', err);
      setError('Failed to process bank data. Please try again.');
      setStep('setup');
    }
  };

  const handlePlaidExit = (error: any, metadata: any) => {
    console.log('Plaid Link exited:', error, metadata);
    if (error) {
      setError('Bank connection was cancelled or failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Your Bank Account</h1>
          <p className="text-gray-600">Securely connect your bank using Plaid Sandbox</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-8 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </motion.div>

        {step === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Connect with Plaid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🏦 Plaid Sandbox Test Mode</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    This app uses Plaid Sandbox for testing. Use these credentials:
                  </p>
                  <div className="bg-white rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{SANDBOX_CREDENTIALS.username}</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Password:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{SANDBOX_CREDENTIALS.password}</code>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    Reference: <a href="https://plaid.com/docs/sandbox/" target="_blank" rel="noopener noreferrer" className="underline">Plaid Sandbox Docs</a>
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Plaid Link button */}
                {linkToken ? (
                  <PlaidLink
                    linkToken={linkToken}
                    onSuccess={handlePlaidSuccess}
                    onExit={handlePlaidExit}
                    buttonText="🔗 Connect Bank with Plaid"
                  />
                ) : (
                  <Button disabled className="w-full" size="lg">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing Plaid...
                  </Button>
                )}

                {/* Back button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/onboarding/choice')}
                  className="w-full"
                >
                  Back to Options
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card>
              <CardContent className="pt-12 pb-12">
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-2">Analyzing Your Spending</h2>
                <p className="text-gray-600">Fetching your transactions from Plaid...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Successfully Connected!</h2>
                <p className="text-gray-600">Your bank account is linked via Plaid</p>
                <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
