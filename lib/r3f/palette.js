export const ARCHETYPE_COLORS = {
  stoic:     { warm: "#c9a84c", warmHi: "#f5d99a", shadow: "#c97575" },
  alchemist: { warm: "#a06ac4", warmHi: "#cda8e0", shadow: "#c97575" },
  explorer:  { warm: "#5fa0d4", warmHi: "#9bc4e3", shadow: "#c97575" },
  healer:    { warm: "#7abcae", warmHi: "#a8d4c9", shadow: "#c97575" },
  monk:      { warm: "#4a9c8a", warmHi: "#8cc0b3", shadow: "#c97575" },
  craftsman: { warm: "#c4884a", warmHi: "#e3b07c", shadow: "#c97575" },
};
export const colorFor = (id) => ARCHETYPE_COLORS[id] || ARCHETYPE_COLORS.stoic;
