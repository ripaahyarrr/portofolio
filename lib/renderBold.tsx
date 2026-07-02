import React from "react";

export function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/(<br><br>|<strong>.*?<\/strong>|\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part === "<br><br>") {
      return (
        <React.Fragment key={i}>
          <br />
          <br />
        </React.Fragment>
      );
    }
    if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(8, -9)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
