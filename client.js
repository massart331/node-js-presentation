import R from 'ramda'
import whilst from 'async/whilst';
import { marketTypes as mt } from '../../constants'
import { withEmitter } from '../../../exchanges/mixins/events'
import {
  batchOrderBooksFetcher,
  orderBooksFetcher,
  orderBookFetcher,
  tickersFetcher,
} from '../fetchers'

const fetcherConfig = {
  [mt.HTTP_BATCH_BOOKS]: batchOrderBooksFetcher,
  [mt.HTTP_TICKERS]: tickersFetcher,
  [mt.HTTP_BOOKS]: orderBooksFetcher,
  [mt.HTTP_BOOK]: orderBookFetcher,
}

const createClient = client => ({ symbols = [] }) => ({
  symbols,
  client,

  initialize() {
    const fetcherParams = {
      client,
      symbols,
    }

    client.markets.forEach((market) => {
      const createFetcher = fetcherConfig[market]

      // if fetcher not found, we skip processing
      if (createFetcher) {
        const fetcher = createFetcher(fetcherParams)(this);

        whilst(R.T, (callback) => {
          fetcher().then(callback)
        })
      }
    })
  },
})

export default client => params => R.pipe(
  createClient(client),
  withEmitter,
)(params)
