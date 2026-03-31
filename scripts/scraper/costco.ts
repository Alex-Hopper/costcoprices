import { createPage } from './browser'
import { ScrapedItem } from './types'

const SCRAPE_WAREHOUSES = [
  { address: '605 Expo Blvd', shopId: '5780', zoneId: '755',  postalCode: 'V6B1V4' , label: 'Vancouver' },
  { address: '99 Heritage Gate SE', shopId: '11260', zoneId: '857', postalCode: 'T2H3A7', label: 'Calgary' },
  { address: '100 Billy Bishop Wy', shopId: '751330', zoneId: '703', postalCode: 'M3K2C8', label: 'Toronto' },
  { address: '130 Ritson Rd N', shopId: '751358', zoneId: '759', postalCode: 'L1G0A6', label: 'Toronto2' },
  { address: '300 Rue Bridge', shopId: '971', zoneId: '759', postalCode: 'H3K2C3', label: 'Montreal' },
]

function extractItemFromResponse(json: any, itemNumber: string): ScrapedItem | null {
  try {
    const placements = json?.data?.searchResultsPlacements?.placements ?? []

    for (const placement of placements) {
      if (placement?.content?.__typename !== 'SearchContentManagementSearchItemGrid') continue
      const items = placement?.content?.items ?? []
      if (items.length === 0) continue

      const item = items[0]
      const refCode = item?.viewSection?.retailerReferenceCodeString

      if (refCode !== itemNumber) continue

      const name = item?.name  // directly on item, not in viewSection
      if (!name) return null

      let unitSize = item?.price?.viewSection?.itemCard?.pricingUnitString
      if (!unitSize || typeof unitSize == "string" && unitSize.includes('$')) {
        unitSize = null;
      }

      const templateUrl = item?.viewSection?.itemImage?.templateUrl ?? null
      const imageUrl = templateUrl
        ? templateUrl.replace('{width=}', '394').replace('{height=}', '394')
        : null

      return { item_number: itemNumber, canonical_name: name, unit_string: unitSize, image_url: imageUrl }
    }

    return null
  } catch (err) {
    console.error('extractItemFromResponse error:', err)
    return null
  }
}

export async function scrapeItem(itemNumber: string): Promise<{ result: ScrapedItem | null, failureReason: string }> {
  const page = await createPage()

  try {
    for (const warehouse of SCRAPE_WAREHOUSES) {
      let capturedResult: ScrapedItem | null = null

      const handleResponse = async (response: any) => {
        if (!response.url().includes('SearchResultsPlacements')) return
        console.log(`  → Intercepted GraphQL response for ${warehouse.label}`)
        try {
          const json = await response.json()
          const extracted = extractItemFromResponse(json, itemNumber)
          if (extracted) {
            capturedResult = extracted
          } else {
            console.log(`    ! Couldn't extract item from response.`);
          }
        } catch {}
      }

      page.on('response', handleResponse)

      try {
        // intercept and rewrite the GraphQL request with correct location
        await page.route('**/graphql**', async (route) => {
          const request = route.request()
          const url = new URL(request.url())
          const variables = JSON.parse(url.searchParams.get('variables') ?? '{}')

          variables.postalCode = warehouse.postalCode
          variables.shopId = warehouse.shopId
          variables.zoneId = warehouse.zoneId

          url.searchParams.set('variables', JSON.stringify(variables))
          await route.continue({ url: url.toString() })
        })

        await page.goto(
          `https://sameday.costco.ca/store/costco-canada/s?k=${itemNumber}`,
          { waitUntil: 'domcontentloaded', timeout: 15000 }
        )

        // wait a beat to ensure response handler has fired
        await page.waitForTimeout(3000)

      } catch (error) {
        console.log(error);
        page.off('response', handleResponse)
        continue
      }
      
      page.off('response', handleResponse)

      await page.unroute('**/graphql**')
      
      if (capturedResult) {
        await page.close()
        return { result: capturedResult, failureReason: '' }
      }
  }

    // tried all warehouses, nothing found
    await page.close()
    return { result: null, failureReason: 'no_results' }

  } catch (err) {
    await page.close()
    return { result: null, failureReason: 'parse_error' }
  }
}