import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button onClick={toggleTheme} style={btnStyle}>
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

const btnStyle = {
  background: "transparent",
  border: "1px solid gray",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
};

