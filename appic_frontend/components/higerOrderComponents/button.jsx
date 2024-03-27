function AlphaButton({ children, onClick, isWide,disabled=false }) {
    return (<button onClick={onClick} className={`alphaButton ${isWide == true ? "wide" : ""}`} >
        {children}
    </button> );
}

export default AlphaButton;