import { createPage } from './browser'
import { ScrapedItem } from './types'

const SCRAPE_WAREHOUSES = [
  { address: '605 Expo Blvd', postalCode: 'V6B1V4' , label: 'Vancouver' },
  { address: '99 Heritage Gate SE', postalCode: 'T2H3A7', label: 'Calgary' },
  { address: '100 Billy Bishop Wy', postalCode: 'M3K2C8', label: 'Toronto' },
  { address: '300 Rue Bridge', postalCode: 'H3K2C3', label: 'Montreal' },
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

      const templateUrl = item?.viewSection?.itemImage?.templateUrl ?? null
      const imageUrl = templateUrl
        ? templateUrl.replace('{width=}', '394').replace('{height=}', '394')
        : null

      return { item_number: itemNumber, canonical_name: name, image_url: imageUrl }
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
          // console.dir(json, { depth: null });
          const extracted = extractItemFromResponse(json, itemNumber)
          console.log(extracted); // TODO: this is always null.
          if (extracted) capturedResult = extracted
        } catch {}
      }

      page.on('response', handleResponse)

      try {
        await page.goto(
          `https://sameday.costco.ca/store/costco-canada/s?k=${itemNumber}&postalCode=${warehouse.postalCode}`,
          { waitUntil: 'domcontentloaded', timeout: 15000 }
        )

        // wait a beat to ensure response handler has fired
        await page.waitForTimeout(3000)

      } catch (error) {
        console.log(error);
        page.off('response', handleResponse)
        continue
      }
      
      console.log("NOPE");
      page.off('response', handleResponse)
      
      if (capturedResult) {
        console.log("CLOSING");
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