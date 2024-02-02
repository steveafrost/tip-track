const tipValues = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
} as const;

export type TipValue = (typeof tipValues)[keyof typeof tipValues];

export const tipEmoji: { [key: string]: string } = {
  [tipValues.zero]: "💔",
  [tipValues.one]: "❤️",
  [tipValues.two]: "💚",
  [tipValues.three]: "🤑",
  [tipValues.four]: "🤑🤑",
} as const;

export const tipLabel: { [key: string]: string } = {
  [tipValues.zero]: "No Tip",
  [tipValues.one]: "Less Than $5",
  [tipValues.two]: "Between $5 and $10",
  [tipValues.three]: "More Than $10",
  [tipValues.four]: "More Than $20",
} as const;
