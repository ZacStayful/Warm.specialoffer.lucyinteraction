export function cleanForVoice(text: string): string {
  return text
    // Remove markdown links — speak the link text only, not the URL
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown formatting
    .replace(/[*_`#]/g, '')
    // Fix VAT — replace with spaced letters so ElevenLabs spells it out
    .replace(/\bVAT\b/g, 'V A T')
    // Remove commas and full stops that TTS reads aloud
    .replace(/,/g, '')
    .replace(/\./g, ' ')
    // Fix any double spaces created
    .replace(/  +/g, ' ')
    .trim()
}
