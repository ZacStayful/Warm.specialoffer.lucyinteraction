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
  sections: NarrationSection[]
  closing: string
}

// Section 1 of the web meeting walkthrough — Revenue Forecast & Case Studies.
// Source video was trimmed to drop Zac's intro framing; playback now opens
// directly on the first slide.
export const REVENUE_FORECAST_WALKTHROUGH: PresentationScript = {
  id: 'revenue-forecast',
  title: 'Income & Forecast',
  videoSrc: '/videos/web-meeting-revenue-forecast.mp4',
  duration: 142.8,
  sections: [
    {
      at: 0,
      label: 'income-overview',
      text: "This first part of the meeting is all about the numbers. What you're looking at here is a fully personalised view of your property — what we expect you'd net each month on average, and the uplift over a long-term let.",
    },
    {
      at: 15,
      label: 'nightly-rate-occupancy',
      text: "Next, Zac walks you through the nightly rate we'd target, your projected occupancy, and how that compares to the wider market in your area.",
    },
    {
      at: 26,
      label: 'twelve-month-forecast',
      text: "Then a full twelve-month forecast — month by month, so you can see clearly which months are strongest and which to plan around.",
    },
    {
      at: 41,
      label: 'floor-and-ceiling',
      text: "This is where we estimate the floor — the lowest realistic month — and the ceiling. For the property shown, that's around eight hundred at the floor and just over two thousand two hundred at the peak.",
    },
    {
      at: 56,
      label: 'listing-establishment',
      text: "Now something most management companies skip — exactly what needs to happen on your listing for us to reach or beat those figures.",
    },
    {
      at: 65,
      label: 'review-baseline',
      text: "Two key anchors here: the average review rating across competing properties in your area, and the average number of reviews. That's how we gauge how quickly you'll move into the competitive band.",
    },
    {
      at: 77,
      label: 'competitive-edge',
      text: "Then Zac highlights anything that gives you a competitive edge — in this example a garden, workspace, free parking, and a smart television — plus features that could justify a premium nightly rate.",
    },
    {
      at: 93,
      label: 'case-studies',
      text: "Now real case studies from properties we currently manage. In this one we forecast sixty-two thousand gross and thirty-two net. The property actually delivered fifty-six gross and thirty-six net — so we came in slightly under on gross but ahead on net. That's the figure that matters most to you.",
    },
    {
      at: 116,
      label: 'direct-bookings',
      text: "Lastly, the direct booking picture — why guests book in your area, how close your property is to the demand drivers, and how much room there is to grow direct bookings on top of the platforms.",
    },
    {
      at: 135,
      label: 'wrap',
      text: "And that's the income half of the meeting in a nutshell.",
    },
  ],
  closing:
    "That's the first section. Zac covers more in the live meeting — the management side, the contract, what onboarding looks like — but you've seen the bones of the income piece. Anything that came up for you, I'm happy to go through. Or whenever you're ready, you can book a time with Zac from the top right.",
}
