import MainLayout from "@/components/layout/MainLayout/MainLayout";
import Header from "@/components/modules/Header/Header";
import { useAuth } from "@/hooks/useAuth";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUsersRedux } from "@/redux/usersSlice";
import Head from "next/head";

export default function MainPage() {

    const init=useRef(true);
    const { user } = useSelector((state: any) => state.main);
    const { currentAccessRoute, ActiveScreen } = useAccessRoutes();
    const { logout } = useAuth();
    const dispatch = useDispatch();

    const { allUsers } = useAuth();


    useEffect(() => {
        if(init.current){
            init.current=false;
            allUsers(users => dispatch(setUsersRedux(users)));
        }        
    }, [])
    return (
        <>
           <Head>
                <title>AMG статистика</title>
            </Head>
            <Header />

            <MainLayout>

                <ActiveScreen />

            </MainLayout>
        </>
    )
}