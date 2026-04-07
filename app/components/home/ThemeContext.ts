import { createContext } from "react";

export type ThemeContextValue = {
  theme: string;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
});

export default ThemeContext;
