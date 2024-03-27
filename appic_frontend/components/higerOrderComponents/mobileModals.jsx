import darkModeClassnamegenerator from "@/utils/darkClassGenerator";

function MobileModal({ children, headerTitle, show, setShow }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShow(false);
      }}
      className={darkModeClassnamegenerator("mobileModal", show)}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setShow(false);
        }}></span>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="mobileModal__content">
        <div className="modal__header ">
          <svg
            onClick={(e) => {
              setShow(false);
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="19"
            viewBox="0 0 11 19"
            fill="none">
            <path
              d="M9.5 1.5L1.5 9.5L9.5 17.5"
              stroke="#7E7E7E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p>{headerTitle}</p>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export default MobileModal;
