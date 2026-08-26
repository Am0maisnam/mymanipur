// The homepage "Live Updates" ticker isn't part of PROJECT_PLAN.md's
// database schema (it's short-lived sidebar chatter, not editorial
// articles), so it stays static config for now rather than a D1 table.
// Revisit if this needs to become editor-manageable later.

export interface LiveUpdate {
  time: string;
  text: string;
}

export const liveUpdates: LiveUpdate[] = [
  { time: "1:15 PM", text: "Chief Minister arrives at the Assembly hall ahead of the budget session." },
  {
    time: "12:45 PM",
    text: "Traffic advisory issued for Tiddim Road due to ongoing roadworks. Commuters advised to use alternate routes.",
  },
  { time: "11:30 AM", text: "Heavy rainfall warning issued for the hill districts. Relief teams placed on standby." },
  { time: "10:00 AM", text: "Registration for the Sangai Festival volunteer program opens today." },
];
