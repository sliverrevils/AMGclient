import { StateReduxI } from "@/redux/store";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./mainMess.module.scss";
import useMainSettings from "@/hooks/useMainSettings";

import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function MainMessage() {
    //STATE
    const [mainMessage, setMainMessage] = useState("");

    //SELECTORS
    const isAdmin = useSelector((state: any) => state.main.user?.role === "admin");

    //HOOKS
    const { getMainSettings, setMainSettings } = useMainSettings();

    //EFFECTS;
    useEffect(() => {
        getMainSettings().then((message) => setMainMessage(message));
    }, []);
    return (
        <div className={styles.mainBlockWrap}>
            <div className={styles.quillWrap}>
                {" "}
                <ReactQuill value={mainMessage} onChange={setMainMessage} readOnly={!isAdmin} theme={isAdmin ? "snow" : "bubble"} />
                {/* <ReactQuill value={mainMessage} onChange={setMainMessage} readOnly={isAdmin} theme={!isAdmin ? "snow" : "bubble"} /> */}
            </div>
            {isAdmin && (
                <div
                    className={styles.saveBtn}
                    onClick={() => {
                        // console.log(mainMessage);
                        setMainSettings({ message: mainMessage });
                    }}
                >
                    Сохранить изменения
                </div>
            )}
        </div>
    );
}
