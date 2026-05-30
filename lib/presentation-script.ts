// Lucy's narration scripts for video walkthroughs she presents to leads.
// Each section's `at` is the time in seconds (into the video) when Lucy
// should start speaking that section. Lucy narrates over a silent video —
// the source's audio is stripped during the edit step.

export interface NarrationSection {
  at: number
  label: string
  text: string
}

export interface PresentationScript {
  id: string
  title: string
  videoSrc: string
  duration: number
  // Plays once as Lucy moves into the corner, before the video starts.
  intro: string
  sections: NarrationSection[]
  closing: string
}

export interface PresentationContext {
  leadName?: string
  address?: string
}

// Section 1 of the web meeting walkthrough — Revenue Forecast & Case Studies.
// Built per-session so Lucy can reference the lead's property by name and
// remind them, throughout, that the figures Zac shows on the call will be
// specific to their property.
export function buildRevenueForecastWalkthrough(
  ctx: PresentationContext = {}
): PresentationScript {
  const firstName = (ctx.leadName || '').split(' ')[0] || ''
  const propertyClause = ctx.address
    ? `your property at ${ctx.address}`
    : 'your property'
  const yourPropertyClause = ctx.address
    ? `your property at ${ctx.address}`
    : 'your property'
  const namePrefix = firstName ? `${firstName}, ` : ''

  return {
    id: 'revenue-forecast',
    title: 'Income & Forecast',
    videoSrc: '/videos/web-meeting-revenue-forecast.mp4',
    duration: 142.8,
    intro: `OK ${namePrefix}loading the presentation now. Quick note before we start — on the real call with Zac, every number you'll see is built specifically for ${yourPropertyClause}. What I'm about to walk you through is an example using another property, so you get a feel for the format, but yours will look the same with your own figures.`,
    sections: [
      {
        at: 0,
        label: 'income-overview',
        text: `This first part of the meeting is all about the income. On your call, Zac will open with the same view — fully personalised to ${propertyClause} — showing what you'd net each month on average and the uplift over a long-term let.`,
      },
      {
        at: 15,
        label: 'nightly-rate-occupancy',
        text: `Next, the nightly rate we'd target for your property, your projected occupancy, and how that compares to the wider market in your area.`,
      },
      {
        at: 26,
        label: 'twelve-month-forecast',
        text: `Then a full twelve-month forecast for your property — month by month, so you can see clearly which months are strongest and which to plan around.`,
      },
      {
        at: 41,
        label: 'floor-and-ceiling',
        text: `This is where we estimate the floor — the lowest realistic month — and the ceiling. The example here is around eight hundred at the floor and two thousand two hundred at the peak. Yours will reflect ${propertyClause} specifically.`,
      },
      {
        at: 56,
        label: 'listing-establishment',
        text: `Now something most management companies skip — exactly what needs to happen on your listing for us to reach or beat the figures above. Zac will tailor this to your property too.`,
      },
      {
        at: 65,
        label: 'review-baseline',
        text: `Two key anchors here: the average review rating across competing properties in your area, and the average number of reviews. That's how we gauge how quickly your property moves into the competitive band.`,
      },
      {
        at: 77,
        label: 'competitive-edge',
        text: `Then Zac highlights anything that gives you a competitive edge. In this example, a garden, workspace, free parking, and a smart television. On your call he'll go through what's true for your property and what could justify a premium nightly rate.`,
      },
      {
        at: 93,
        label: 'case-studies',
        text: `Now real case studies from properties we currently manage. In this one we forecast sixty-two thousand gross and thirty-two net. The property actually delivered fifty-six gross and thirty-six net — slightly under on gross but ahead on net, which is the figure that matters most to you.`,
      },
      {
        at: 116,
        label: 'direct-bookings',
        text: `Lastly, the direct booking picture — why guests book in your area, how close your property is to the demand drivers, and how much room there is to grow direct bookings on top of the platforms.`,
      },
      {
        at: 135,
        label: 'wrap',
        text: `And that's the shape of the income half of the meeting.`,
      },
    ],
    closing: `That's the income part of the presentation. On the live call, Zac will show you your actual figures for ${propertyClause}, walk you through how Stayful operates day to day, and answer any questions you have. Are you ready to book in a call, or is there anything else you'd like to know first?`,
  }
}
