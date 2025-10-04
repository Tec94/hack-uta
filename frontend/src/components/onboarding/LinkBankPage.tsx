'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { generateMockTransactions, calculateCategorySpending } from '@/data/mock-transactions';
import { useUserStore } from '@/store/userStore';

const mockBanks = [
  { id: 'chase', name: 'Chase', logo: '🏦' },
  { id: 'bofa', name: 'Bank of America', logo: '🏦' },
  { id: 'wells', name: 'Wells Fargo', logo: '🏦' },
  { id: 'citi', name: 'Citibank', logo: '🏦' },
];

export function LinkBankPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'login' | 'processing' | 'success'>('select');
  const { setBudget, setLinkedBank, setOnboardingCompleted } = useUserStore();

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock transactions and calculate spending
    const transactions = generateMockTransactions(30);
    const spending = calculateCategorySpending(transactions);

    // Store the budget in the user store
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
    setLoading(false);

    // Navigate to dashboard after a short delay
    setTimeout(() => {
      setOnboardingCompleted(true);
      router.push('/dashboard');
    }, 2000);
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
          <p className="text-gray-600">Securely connect your bank to analyze spending patterns</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-8 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </motion.div>

        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {mockBanks.map((bank) => (
              <Card
                key={bank.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBankSelect(bank.id)}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl mb-3">{bank.logo}</div>
                  <p className="font-semibold">{bank.name}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Login to {mockBanks.find(b => b.id === selectedBank)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue="demo_user"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      defaultValue="demo_pass"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">🔒 Demo Mode</p>
                    <p>This is a simulation. No real bank connection is made.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep('select')} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      Connect Account
                    </Button>
                  </div>
                </form>
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
                <p className="text-gray-600">Processing your transactions...</p>
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
                <p className="text-gray-600">Redirecting to your dashboard...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

