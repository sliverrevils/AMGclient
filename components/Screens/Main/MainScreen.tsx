import styles from "./main.module.scss";

import CreateRaport2 from "@/components/modules/ReportTables/CreateRaport2/CreateRaport2";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import { UserFullI } from "@/types/types";
import Mission from "@/components/elements/Mission/Mission";
import MainMessage from "@/components/elements/MainMessage/MainMessage";

export default function MainScreen() {
    const { tablePatterns } = useSelector((state: StateReduxI) => state.patterns);
    const isAdmin = useSelector((state: any) => state.main.user.role === "admin");
    return (
        <div className={styles.mainWrap}>
            {/* <Mission /> */}
            <MainMessage />
            {isAdmin && !!tablePatterns.length && <CreateRaport2 getPie />}
        </div>
    );
}
