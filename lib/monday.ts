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
]

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
  for (const col of item.column_values || []) {
    cols[col.id] = col.text || ''
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

export async function logPortalSession(itemId: string, logEntry: string) {
  // Non-blocking — fire and forget
  try {
    // Fetch current value
    const currentQuery = `{
      items(ids: [${itemId}]) {
        column_values(ids: ["long_text_mm3pj2zj"]) {
          id
          text
        }
      }
    }`
    const current = await mondayQuery(currentQuery)
    const existingText =
      current?.data?.items?.[0]?.column_values?.[0]?.text || ''

    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const separator = existingText ? '\n\n---\n\n' : ''
    const newText = `${existingText}${separator}[${timestamp}]\n${logEntry}`

    // Escape for GraphQL string
    const escaped = newText
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
