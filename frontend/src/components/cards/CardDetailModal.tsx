import { CreditCard } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface CardDetailModalProps {
  card: CreditCard | null;
  isOpen: boolean;
  onClose: () => void;
  aiRecommendation?: string;
}

export function CardDetailModal({ card, isOpen, onClose, aiRecommendation }: CardDetailModalProps) {
  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.name}</DialogTitle>
        </DialogHeader>

        {/* Card Visual */}
        <div className="w-full h-48 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="text-sm opacity-90">{card.issuer}</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
              <p className="text-sm opacity-90">{card.primaryBenefit}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="text-lg">🤖</span> AI Recommendation
            </h4>
            <p className="text-sm text-foreground/80">{aiRecommendation}</p>
          </div>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Annual Fee</p>
            <p className="text-xl font-bold">
              {card.annualFee === 0 ? 'No Fee' : formatCurrency(card.annualFee)}
            </p>
          </div>
          {card.signupBonus && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sign-up Bonus</p>
              <p className="text-sm font-semibold">{card.signupBonus}</p>
            </div>
          )}
        </div>

        {/* Rewards Structure */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3">Rewards Structure</h4>
          <div className="space-y-2">
            {card.rewardsStructure.map((reward, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{reward.category}</span>
                    <span className="text-primary font-bold">{reward.rate}</span>
                  </div>
                  {reward.description && (
                    <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3">Additional Benefits</h4>
          <ul className="space-y-2">
            {card.secondaryBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-2">Requirements</h4>
          <p className="text-sm text-gray-700">Credit Score: {card.creditScoreRequired}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-6">{card.fullDescription}</p>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.open(card.applicationUrl, '_blank')}
            className="flex-1"
            size="lg"
          >
            Apply Now
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={onClose} variant="outline" size="lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

