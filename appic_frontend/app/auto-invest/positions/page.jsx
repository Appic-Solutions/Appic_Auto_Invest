"use client"
import DcaPositions from "@/components/dcaPositions"
import AlphaButton from "@/components/higerOrderComponents/button"
import WalletNotConnected from "@/components/walletNotConnectd"
import darkModeClassnamegenerator from "@/utils/darkClassGenerator"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"


export default function Position(){
   const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);

    const router = useRouter();
    const handleCreateDCA = ()=>{
        router.push("/DCA");
        
    }
    return (
        <div className={darkModeClassnamegenerator("mainPage")}>

            <DcaPositions />

        </div>
    )
}