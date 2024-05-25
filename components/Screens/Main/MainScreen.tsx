import styles from "./main.module.scss";

import CreateRaport2 from "@/components/modules/ReportTables/CreateRaport2/CreateRaport2";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

export default function MainScreen() {
    const { tablePatterns } = useSelector((state: StateReduxI) => state.patterns);
    return <div className={styles.mainWrap}>{!!tablePatterns.length && <CreateRaport2 getPie />}</div>;
}
