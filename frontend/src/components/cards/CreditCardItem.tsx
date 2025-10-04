import { CreditCard } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CreditCardItemProps {
  card: CreditCard;
  onClick: () => void;
}

export function CreditCardItem({ card, onClick }: CreditCardItemProps) {
  return (
    <div
      onClick={onClick}
      className="w-[280px] h-[160px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform shadow-lg touch-target relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <span className="text-2xl">💳</span>
          </div>
          {card.annualFee === 0 && (
            <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-semibold">
              No Fee
            </span>
          )}
        </div>

        <div>
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{card.name}</h3>
          <p className="text-sm opacity-90 mb-2 line-clamp-1">{card.primaryBenefit}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-80">{card.issuer}</span>
            {card.annualFee > 0 && (
              <span className="font-semibold">{formatCurrency(card.annualFee)}/year</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

