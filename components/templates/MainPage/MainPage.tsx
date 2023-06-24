import MainLayout from "@/components/layout/MainLayout/MainLayout";
import Header from "@/components/modules/Header/Header";
import { useAuth } from "@/hooks/useAuth";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function MainPage(){
const {user} = useSelector((state:any)=>state.main);
const {currentAccessRoute,ActiveScreen}=useAccessRoutes();
const {logout} =useAuth();
// useEffect(()=>{console.log('ACTIVE',activeScreen)},[activeScreen]);
    return(
        <>
            <Header/>       
            
            <MainLayout>

            <ActiveScreen/>
            
            </MainLayout>
        </>
    )
}