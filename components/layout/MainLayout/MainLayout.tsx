import React from "react";
import stylesRow from "./main.module.scss";
import stylesColumn from "./mainColumn.module.scss";
import Aside from "@/components/modules/Aside/Aside";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";

export default function MainLayout({ children }) {
    const { mainStyle } = useSelector((state: StateReduxI) => state.app);
    const currentStyle = mainStyle === "row" ? stylesRow : stylesColumn;
    return (
        <div className={`container ${currentStyle.wrapper}`}>
            <Aside />
            <main className={currentStyle.content}>{children}</main>
        </div>
    );
}
