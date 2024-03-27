import MobileModal from "./mobileModals";
import DesktopModal from "./desktopModal";
function CombinedModal({ children, headerTitle, show, setShow, overflow }) {
    return (
        <>
            <MobileModal show={show} setShow={setShow} headerTitle={headerTitle} >{children}</MobileModal>
            <DesktopModal show={show} setShow={setShow} overflow={overflow} header={headerTitle} >{children}</DesktopModal>
        </>

    );
}

export default CombinedModal;