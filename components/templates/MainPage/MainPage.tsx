import MainLayout from "@/components/layout/MainLayout/MainLayout";
import Header from "@/components/modules/Header/Header";
import { useAuth } from "@/hooks/useAuth";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUsersRedux } from "@/redux/usersSlice";
import Head from "next/head";
import useOrg from "@/hooks/useOrg";

export default function MainPage() {
    //REF
    const init = useRef(true);

    //SELECTORS

    //HOOKS

    const { getOrgFullScheme } = useOrg();

    const { ActiveScreen } = useAccessRoutes();

    useEffect(() => {
        if (init.current) {
            init.current = false;
            getOrgFullScheme({});
            //allUsers(users => dispatch(setUsersRedux(users)));
        }
    }, []);
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
    );
}
