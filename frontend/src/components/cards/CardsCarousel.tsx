import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CreditCard } from '@/types';
import { CreditCardItem } from './CreditCardItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardsCarouselProps {
  cards: CreditCard[];
  onCardClick: (card: CreditCard) => void;
}

export function CardsCarousel({ cards, onCardClick }: CardsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-4 py-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="embla__slide flex-[0_0_280px]"
            >
              <CreditCardItem card={card} onClick={() => onCardClick(card)} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Previous cards"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Next cards"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

