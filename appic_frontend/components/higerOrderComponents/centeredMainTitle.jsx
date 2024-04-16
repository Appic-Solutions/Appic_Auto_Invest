"use client"
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import Link from "next/link";
import { useRouter } from "next/navigation";


function CenteredMainTitle({ children, show = true, onClick, backLink }) {
    //make the below svg a clickable button to go back to the previous page and also add a show prop to hide and show it when needed
    const router = useRouter();
    const handleBack = () => {
        router.back();
    }
    return (
        <div className={darkModeClassnamegenerator("CenteredMainTitle")}>
            {show &&
                <svg onClick={() => {
                    if (backLink) {
                        handleBack();
                    }
                    else {
                        onClick()
                    }
                }} xmlns="http://www.w3.org/2000/svg" width="18" height="30" viewBox="0 0 18 30" fill="none">
                    <path d="M17 28.0664L1 14.7844L17 1.50241" stroke="#843EA1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            <div>{children}</div>
        </div>
    );
}

export default CenteredMainTitle;