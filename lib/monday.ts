const MONDAY_API_URL = 'https://api.monday.com/v2'
const BOARD_ID = '5891626711'

const COLUMN_IDS = [
  'text_mm1x8cgy',   // Lead Profile
  'text6',            // Address
  'long_text_mm2tp6aw', // Call Brief
  'text_mm2eawgk',   // STR Profit
  'text_mm2dsnw7',   // Long Term Let
  'text_mm26pf4c',   // Rent / Mortgage
  'text5',            // Bedrooms
  'text_mm2xe380',   // Web Meeting Presentation URL
  'text_mm3h5atf',   // Post Meeting Action Plan URL
  'text_mkygb5xx',   // Email
  'file_mm2cqjjh',   // Management Agreement (file)
  'file_mm3mq7dn',   // Setup Quote (file)
]

function parseFileColumnUrl(text: string): string {
  try {
    const parsed = JSON.parse(text)
    return parsed?.files?.[0]?.url || ''
  } catch {
    return ''
  }
}

async function mondayQuery(query: string) {
  const res = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY!,
      'API-Version': '2024-10',
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  })
  return res.json()
}

function buildColumnQuery(ids: string[]) {
  return ids.map(id => `"${id}"`).join(', ')
}

function parseItem(item: any) {
  const cols: Record<string, string> = {}
  const vals: Record<string, string> = {}
  for (const col of item.column_values || []) {
    cols[col.id] = col.text || ''
    vals[col.id] = col.value || ''
  }
  return {
    itemId: String(item.id),
    leadName: item.name || '',
    email: cols['text_mkygb5xx'] || '',
    address: cols['text6'] || '',
    bedrooms: cols['text5'] || '',
    leadProfile: cols['text_mm1x8cgy'] || '',
    callBrief: cols['long_text_mm2tp6aw'] || '',
    strProfit: cols['text_mm2eawgk'] || '',
    longTermLet: cols['text_mm2dsnw7'] || '',
    rentMortgage: cols['text_mm26pf4c'] || '',
    presentationUrl: cols['text_mm2xe380'] || '',
    actionPlanUrl: cols['text_mm3h5atf'] || '',
    // File columns return JSON (in text or value) — parse out the URL
    agreementUrl:
      parseFileColumnUrl(vals['file_mm2cqjjh'] || '') ||
      parseFileColumnUrl(cols['file_mm2cqjjh'] || ''),
    quoteUrl:
      parseFileColumnUrl(vals['file_mm3mq7dn'] || '') ||
      parseFileColumnUrl(cols['file_mm3mq7dn'] || ''),
  }
}

export async function findLeadByEmail(email: string) {
  const safeEmail = email.toLowerCase().replace(/"/g, '')
  const query = `{
    boards(ids: [${BOARD_ID}]) {
      items_page(limit: 5, query_params: {
        rules: [{
          column_id: "text_mkygb5xx",
          compare_value: ["${safeEmail}"],
          operator: contains_text
        }]
      }) {
        items {
          id
          name
          column_values(ids: [${buildColumnQuery(COLUMN_IDS)}]) {
            id
            text
            value
          }
        }
      }
    }
  }`

  const data = await mondayQuery(query)
  const items: any[] = data?.data?.boards?.[0]?.items_page?.items || []

  // Exact email match (case-insensitive)
  const match = items.find(
    (i: any) =>
      i.column_values
        ?.find((c: any) => c.id === 'text_mkygb5xx')
        ?.text?.toLowerCase() === safeEmail
  )

  return match ? parseItem(match) : null
}

export async function findLeadByName(name: string) {
  const safeName = name.replace(/"/g, '').trim()
  const query = `{
    boards(ids: [${BOARD_ID}]) {
      items_page(limit: 5, query_params: {
        rules: [{
          column_id: "name",
          compare_value: ["${safeName}"],
          operator: contains_text
        }]
      }) {
        items {
          id
          name
          column_values(ids: [${buildColumnQuery(COLUMN_IDS)}]) {
            id
            text
            value
          }
        }
      }
    }
  }`

  const data = await mondayQuery(query)
  const items: any[] = data?.data?.boards?.[0]?.items_page?.items || []

  // Best name match (case-insensitive contains)
  const match = items.find((i: any) =>
    i.name?.toLowerCase().includes(safeName.toLowerCase())
  )

  return match ? parseItem(match) : null
}

// Posts an individual Update on the item. Updates have no character limit,
// so this is used for the full Q&A / document-request log entries.
export async function postPortalUpdate(itemId: string, body: string) {
  try {
    const safe = body
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
    const mutation = `mutation {
      create_update(item_id: ${itemId}, body: "${safe}") { id }
    }`
    return await mondayQuery(mutation)
  } catch (err) {
    console.error('[Monday update error]', err)
  }
}

// Writes a short snapshot to the long-text column (overwrite, max 200 chars)
// so the item shows a quick at-a-glance status without opening Updates.
export async function logPortalSession(itemId: string, summary: string) {
  try {
    const snapshot = summary.slice(0, 200)
    const escaped = snapshot
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')

    const mutation = `mutation {
      change_column_value(
        board_id: ${BOARD_ID},
        item_id: ${itemId},
        column_id: "long_text_mm3pj2zj",
        value: "{\\"text\\": \\"${escaped}\\"}"
      ) { id }
    }`

    await mondayQuery(mutation)
  } catch (err) {
    console.error('[Monday log error]', err)
  }
}
