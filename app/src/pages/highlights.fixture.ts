// A highlights.yml for the smoke tests: one highlight that's a note on the Detector group and the
// Methodology section, and one whose text is no longer in the reading.
export const HIGHLIGHTS_YML = `# test highlights

- id: h-1
  reading: mendu2025safer
  tag: metrics
  text: "the closest existing tool"
  prefix: "For this project, it's "
  suffix: ": a pretraining-data filter"
  created: 2026-11-02
  groups: [detector]
  sections: [methodology]
- id: h-gone
  reading: mendu2025safer
  tag: ethics
  text: "words that were edited away"
  prefix: ""
  suffix: ""
  created: 2026-11-02
  groups: []
  sections: []
`

export const highlightsFile = { path: 'highlights.yml', sha: 'sha-highlights', text: HIGHLIGHTS_YML }
