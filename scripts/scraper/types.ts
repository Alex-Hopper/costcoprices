export type BacklogItem = {
  id: string
  item_number: string
  cycles_in_backlog: number
  last_failure_reason: string | null
}

export type ScrapedItem = {
  item_number: string
  canonical_name: string
  unit_string: string | null
  image_url: string | null
}