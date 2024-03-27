"use client";
import React, { useState } from "react";
import darkModeClassnamegenerator, { darkClassGenerator } from "@/utils/darkClassGenerator";
import { useSelector, useDispatch } from "react-redux";

function History() {
  const [historyData, setHistoryData] = useState([]);
  const isDark = useSelector((state) => state.theme.isDark);

  return (
    <div className={darkClassGenerator(isDark,"history_list")}>
      {historyData.length === 0 ? (
        <div className="empty_history">
          <img src="/assets/images/Empty.svg" alt="No history" />
          <p>No history available</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default History;

