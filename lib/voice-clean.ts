export function cleanForVoice(text: string): string {
  return text
    // Remove markdown links — speak the link text only, not the URL
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown formatting
    .replace(/[*_`#]/g, '')
    // Fix VAT — replace with spaced letters so ElevenLabs spells it out
    .replace(/\bVAT\b/g, 'V A T')
    // Keep commas and full stops — ElevenLabs uses them for natural breath
    // pauses. Stripping them is what made Lucy sound rushed and robotic.
    .replace(/  +/g, ' ')
    .trim()
}
