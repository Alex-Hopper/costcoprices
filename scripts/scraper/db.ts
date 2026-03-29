import { createClient } from '@supabase/supabase-js'
import { BacklogItem, ScrapedItem } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DAYS_UNTIL_WE_IGNORE = 14 * 24; // 14 Days * 24 hours in a day.

export async function getPendingBacklogItems(): Promise<BacklogItem[]> {
  const { data, error } = await supabase
    .from('scrape_backlog')
    .select('id, item_number, cycles_in_backlog, last_failure_reason')
    .eq('status', 'pending')
    .lte('cycles_in_backlog', DAYS_UNTIL_WE_IGNORE)

  if (error) throw error
  return data ?? []
}

export async function markResolved(backlogId: string, itemNumber: string) {
  // update item
  await supabase
    .from('items')
    .update({ enrichment_status: 'enriched' })
    .eq('item_number', itemNumber)

  // mark backlog resolved
  await supabase
    .from('scrape_backlog')
    .update({ status: 'resolved' })
    .eq('id', backlogId)
}

export async function markFailed(
  backlogId: string,
  itemNumber: string,
  cycles_in_backlog: number,
  reason: string
) {
  if (cycles_in_backlog >= DAYS_UNTIL_WE_IGNORE) {
    // give up
    await supabase
      .from('scrape_backlog')
      .update({ status: 'failed', last_failure_reason: reason, last_attempted_at: new Date().toISOString() })
      .eq('id', backlogId)

    await supabase
      .from('items')
      .update({ enrichment_status: 'failed' })
      .eq('item_number', itemNumber)
  } else {
    await supabase
      .from('scrape_backlog')
      .update({
        cycles_in_backlog: cycles_in_backlog + 1,
        last_failure_reason: reason,
        last_attempted_at: new Date().toISOString(),
      })
      .eq('id', backlogId)
  }
}

export async function insertItemImages(itemNumber: string, storagePath: string) {
  await supabase
    .from('item_images')
    .insert({ item_number: itemNumber, storage_path: storagePath, display_order: 0 })
}

export async function updateItemName(itemNumber: string, canonicalName: string) {
  await supabase
    .from('items')
    .update({ canonical_name: canonicalName })
    .eq('item_number', itemNumber)
}

export { supabase }