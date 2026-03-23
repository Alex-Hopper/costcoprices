import "server-only";

import { callAnthropicVisionJson } from "@/lib/anthropic";
import type { ExtractedReceipt, ExtractedReceiptInfo } from "@/lib/receipt/types";

const RECEIPT_EXTRACTION_PROMPT = `This is a Costco Canada receipt or multiple receipts. For each receipt extract warehouse id, the purchase data, every purchased item in an array of items and return ONLY a JSON object with this shape:
{"receipts":[...]}
Each object within the receipts array should correspond with exactly one of the receipts (so, if there is only one receipt, an array of size 1), within each of these objects:
The warehouse_id field should be a string, and consists of numbers.
The date should be in a string in the format "YYYY/MM/DD".
Each item object must have exactly these fields:
- item_number: the  item number (string)
- name: the item name exactly as printed (string)
- price: the final price paid as a number, no dollar sign (number)
- price_type: "per_kg" if there is a line above showing a $/kg unit price, otherwise "fixed"
- unit_price: the $/kg price as a number if price_type is per_kg, otherwise null
- is_sale: true if there is an asterisk next to the item name, otherwise false

Ignore tax lines, subtotals, totals, membership fees, and any non-item lines.
Return nothing else. No markdown, no backticks, no explanation. Just the raw JSON object.`;

type ClaudeExtractedItem = {
  item_number: string;
  name: string;
  price: number;
  price_type: "fixed" | "per_kg";
  unit_price: number | null;
  is_sale: boolean;
};

type ClaudeExtractedReceipt = {
  warehouse_id: string | null;
  date: string | null;
  items: ClaudeExtractedItem[];
};

function parseDateToIso(date: string | null) {
  if (!date) return null;
  const match = date.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

function parseJsonFromModelText(rawText: string): ClaudeExtractedReceipt[] {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { receipts?: unknown }).receipts)) {
    throw new Error("Claude response is not a JSON object with a receipts array.");
  }

  return (parsed as { receipts: ClaudeExtractedReceipt[] }).receipts;
}

export async function extractReceiptInfo(images: File[]): Promise<ExtractedReceiptInfo> {
  const rawText = await callAnthropicVisionJson({
    prompt: RECEIPT_EXTRACTION_PROMPT,
    images,
  });
  const receipts = parseJsonFromModelText(rawText);

  return {
    receipts: receipts.map(mapReceipt),
  };
}

function mapReceipt(receipt: ClaudeExtractedReceipt, receiptIndex: number): ExtractedReceipt {
  const items = Array.isArray(receipt.items) ? receipt.items : [];

  return {
    receiptIndex,
    warehouseId: receipt.warehouse_id ?? null,
    purchaseDate: parseDateToIso(receipt.date ?? null),
    items: items.map((item) => ({
      itemNumber: String(item.item_number ?? "").trim(),
      rawName: typeof item.name === "string" ? item.name : null,
      price: Number(item.price),
      priceType: item.price_type === "per_kg" ? "per_kg" : "fixed",
      unitPrice:
        item.price_type === "per_kg" && Number.isFinite(Number(item.unit_price))
          ? Number(item.unit_price)
          : null,
      isSale: Boolean(item.is_sale),
    })),
  };
}
