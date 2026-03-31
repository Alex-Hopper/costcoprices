import { getPendingBacklogItems, markResolved, markFailed, updateItemName, insertItemImages, updateUnitString } from './db'
import { scrapeItem } from './costco'
import { downloadAndUploadImage } from './images'
import { closeBrowser } from './browser'

async function run() {
  console.log('Starting scraper...')

  const backlogItems = await getPendingBacklogItems()
  console.log(`Found ${backlogItems.length} items to process`)

  for (const backlogItem of backlogItems) {
    console.log(`Processing item #${backlogItem.item_number}...`)

    const { result, failureReason } = await scrapeItem(backlogItem.item_number)
    
    if (!result) {
      console.log(`  ✗ Not found — reason: ${failureReason}`)
      await markFailed(backlogItem.id, backlogItem.item_number, backlogItem.cycles_in_backlog, failureReason)
      continue
    }

    console.log(`  ✓ Found: ${result.canonical_name}`)

    // update canonical name
    await updateItemName(backlogItem.item_number, result.canonical_name)
    
    if (result.unit_string) {
      await updateUnitString(backlogItem.item_number, result.unit_string)
    } 

    // download and upload image if available
    if (result.image_url) {
      const storagePath = await downloadAndUploadImage(result.image_url, backlogItem.item_number)
      if (storagePath) {
        await insertItemImages(backlogItem.item_number, storagePath)
        console.log(`  ✓ Image uploaded to ${storagePath}`)
      }
    }

    await markResolved(backlogItem.id, backlogItem.item_number)
    console.log(`  ✓ Resolved`)
  }

  await closeBrowser()
  console.log('Scraper complete')
}

run().catch((err) => {
  console.error('Scraper failed:', err)
  process.exit(1)
})