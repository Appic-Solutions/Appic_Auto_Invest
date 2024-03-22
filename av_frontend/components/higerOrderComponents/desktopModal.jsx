"use client";

import darkModeClassnamegenerator from "@/utils/darkClassGenerator";

function DesktopModal({ children, header, show, setShow, overflow }) {
  return (
    <div 
      // onClick={(e) => {
      //   e.stopPropagation();
      //   setShow(false);
      // }}
      className={darkModeClassnamegenerator("desktopModal", show)}
      >
      <div
        // onClick={(e) => {
        //   e.stopPropagation();
        // }}
        // className="modal__content"
         >
        {/* <div className="modal__header">
          <svg
            onClick={(e) => {
              e.stopPropagation();
              setShow(false);
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="37"
            viewBox="0 0 23 37"
            fill="none">
            <path
              d="M21.448 35.1016L1.22852 18.3169L21.448 1.53223"
              strokeWidth=""
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2>{header}</h2>
        </div> */}
        {/* <div className={`modal__body ${overflow == false ? "notOverflow" : ""}`} >{children}</div> */}
        
      </div>
      {children}
    </div>
  );
}

export default DesktopModal;
