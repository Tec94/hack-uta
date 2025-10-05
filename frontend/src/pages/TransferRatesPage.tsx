import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Filter
} from 'lucide-react'

export function TransferRatesPage() {
  const [transferRates, setTransferRates] = useState<TransferRate[]>([])
  const [filteredRates, setFilteredRates] = useState<TransferRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIssuer, setSelectedIssuer] = useState<string>('all')

  useEffect(() => {
    fetchTransferRates()
  }, [])

  useEffect(() => {
    filterRates()
  }, [searchQuery, selectedIssuer, transferRates])

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
      <div className="min-h-screen bg-background py-12 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <div className="text-destructive mb-4">
              <ArrowRightLeft className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Transfer Rates</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
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
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2 sm:gap-3">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                Transfer Rates
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compare credit card points transfer rates to travel partners
              </p>
            </div>
            <Badge variant="outline" className="gap-1 flex-shrink-0">
              <TrendingUp className="w-3 h-3" />
              {filteredRates.length} {filteredRates.length === 1 ? 'Rate' : 'Rates'}
            </Badge>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by program or issuer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-11"
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
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">About Transfer Rates</p>
                  <p className="text-xs text-muted-foreground">
                    Transfer your credit card points to airline and hotel partners to maximize their value. 
                    Rates and transfer times vary by issuer and partner program.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transfer Rates Table */}
        {filteredRates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Transfer Rates Found</h3>
              <p className="text-muted-foreground">
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium">{rate.card_issuer}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className="bg-secondary text-secondary-foreground">
                            {rate.from_program}
                          </Badge>
                          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                          <Badge className="bg-secondary text-secondary-foreground">
                            {rate.to_program}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold">{rate.transfer_ratio}</div>
                        <div className="text-xs text-muted-foreground">ratio</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Transfer Time: <span className="font-medium text-foreground">{rate.transfer_time}</span>
                        </span>
                      </div>
                      {rate.notes && (
                        <div className="flex items-start gap-2 flex-1 min-w-[200px]">
                          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{rate.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredRates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{transferRates.length}</div>
                    <div className="text-xs text-muted-foreground">Total Rates</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{issuers.length - 1}</div>
                    <div className="text-xs text-muted-foreground">Card Issuers</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {new Set(transferRates.map(r => r.from_program)).size}
                    </div>
                    <div className="text-xs text-muted-foreground">From Programs</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {new Set(transferRates.map(r => r.to_program)).size}
                    </div>
                    <div className="text-xs text-muted-foreground">To Programs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
