import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loading } from '@/components/common/Loading'
import { BottomNav } from '@/components/navigation/BottomNav'
import { getAllTransferRates, TransferRate } from '@/lib/transfer-rates'
import { 
  ArrowRightLeft, 
  Search, 
  Clock, 
  Building2,
  TrendingUp,
  Info,
  Filter,
  Plane,
  Hotel as HotelIcon
} from 'lucide-react'

// Helper function to categorize transfer programs
const isAirlineProgram = (program: string): boolean => {
  const airlines = [
    'mileageplus', 'aadvantage', 'skymiles', 'rapid rewards', 'flying blue', 
    'avios', 'skywards', 'miles & more', 'velocity', 'lifemiles', 
    'aeromexico', 'air canada', 'alaska', 'jetblue', 'southwest', 'united', 
    'american', 'delta', 'singapore', 'cathay', 'qantas', 'virgin', 'etihad'
  ]
  return airlines.some(airline => program.toLowerCase().includes(airline))
}

const isHotelProgram = (program: string): boolean => {
  const hotels = [
    'marriott', 'bonvoy', 'hilton', 'honors', 'hyatt', 'ihg', 'choice', 
    'wyndham', 'accor', 'radisson', 'best western'
  ]
  return hotels.some(hotel => program.toLowerCase().includes(hotel))
}

export function TransferRatesPage() {
  const [transferRates, setTransferRates] = useState<TransferRate[]>([])
  const [filteredRates, setFilteredRates] = useState<TransferRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIssuer, setSelectedIssuer] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState<'airline' | 'hotel'>('airline')

  useEffect(() => {
    fetchTransferRates()
  }, [])

  useEffect(() => {
    filterRates()
  }, [searchQuery, selectedIssuer, selectedTab, transferRates])

  const fetchTransferRates = async () => {
    try {
      const rates = await getAllTransferRates()
      setTransferRates(rates)
      setFilteredRates(rates)
    } catch (err) {
      console.error('Error fetching transfer rates:', err)
      setError('Failed to load transfer rates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterRates = () => {
    let filtered = [...transferRates]

    // Filter by category (airline or hotel)
    filtered = filtered.filter(rate => {
      if (selectedTab === 'airline') {
        return isAirlineProgram(rate.to_program)
      } else {
        return isHotelProgram(rate.to_program)
      }
    })

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(rate => 
        rate.from_program.toLowerCase().includes(query) ||
        rate.to_program.toLowerCase().includes(query) ||
        rate.card_issuer.toLowerCase().includes(query)
      )
    }

    // Filter by issuer
    if (selectedIssuer !== 'all') {
      filtered = filtered.filter(rate => rate.card_issuer === selectedIssuer)
    }

    setFilteredRates(filtered)
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 sm:py-12 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-6 sm:p-8">
            <div className="text-destructive mb-4">
              <ArrowRightLeft className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Error Loading Transfer Rates</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  const issuers = ['all', ...Array.from(new Set(transferRates.map(rate => rate.card_issuer)))]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/credify-logo.png" 
                alt="Credily" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">Transfer Rates</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Compare credit card points transfer rates to travel partners
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1 flex-shrink-0 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">{filteredRates.length} {filteredRates.length === 1 ? 'Rate' : 'Rates'}</span>
              <span className="sm:hidden">{filteredRates.length}</span>
            </Badge>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search by program or issuer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <select
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-10 sm:h-11 text-sm sm:text-base min-w-[140px]"
              >
                {issuers.map(issuer => (
                  <option key={issuer} value={issuer}>
                    {issuer === 'all' ? 'All Issuers' : issuer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-muted/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm mb-1">About Transfer Rates</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Transfer your credit card points to airline and hotel partners to maximize their value. 
                    Rates and transfer times vary by issuer and partner program.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Airlines and Hotels */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'airline' | 'hotel')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="airline" className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Plane className="w-4 h-4" />
              <span>Airlines</span>
            </TabsTrigger>
            <TabsTrigger value="hotel" className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <HotelIcon className="w-4 h-4" />
              <span>Hotels</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Transfer Rates Table */}
                {filteredRates.length === 0 ? (
                  <Card className="text-center py-8 sm:py-12">
                    <CardContent>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">No Transfer Rates Found</h3>
                      <p className="text-sm sm:text-base text-muted-foreground px-4">
                        Try adjusting your search or filter criteria
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredRates.map((rate, index) => (
                      <motion.div
                        key={rate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs sm:text-sm font-medium">{rate.card_issuer}</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                  <Badge className="bg-secondary text-secondary-foreground text-xs">
                                    {rate.from_program}
                                  </Badge>
                                  <ArrowRightLeft className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                  <Badge className="bg-secondary text-secondary-foreground text-xs">
                                    {rate.to_program}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                                <div className="text-xl sm:text-2xl font-bold">{rate.transfer_ratio}</div>
                                <div className="text-xs text-muted-foreground">ratio</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  Transfer Time: <span className="font-medium text-foreground">{rate.transfer_time}</span>
                                </span>
                              </div>
                              {rate.notes && (
                                <div className="flex items-start gap-2 flex-1 w-full sm:min-w-[200px]">
                                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-xs sm:text-sm text-muted-foreground">{rate.notes}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}
