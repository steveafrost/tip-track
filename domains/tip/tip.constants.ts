const tipValues = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
} as const;

export type TipValue = (typeof tipValues)[keyof typeof tipValues];

export const tipLabels: { [key: string]: string } = {
  [tipValues.zero]: "💔",
  [tipValues.one]: "❤️",
  [tipValues.two]: "💚",
  [tipValues.three]: "🤑",
  [tipValues.four]: "🤑🤑",
} as const;
