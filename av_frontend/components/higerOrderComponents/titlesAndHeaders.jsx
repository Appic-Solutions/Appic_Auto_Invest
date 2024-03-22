"use client";

import darkModeClassnamegenerator from "@/utils/darkClassGenerator";

function Title({ children, title }) {
  return (
    <div className={darkModeClassnamegenerator("titleAndHeader")}>
      <h2 className="title">{title}</h2>
      <div className="header">{children}</div>
    </div>
  );
}

export default Title;
