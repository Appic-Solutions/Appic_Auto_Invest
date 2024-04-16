"use client";
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import { useSelector } from "react-redux";

function Background({ children }) {
  const isLoading = useSelector((state) => state.wallet.items.loader);

  return (
    <div className={darkModeClassnamegenerator("background")}>
      <div className="layout">
        {children}
      </div>
    </div>
  );
}

export default Background;
