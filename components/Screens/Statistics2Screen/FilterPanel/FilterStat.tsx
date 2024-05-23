import { DepartmentI, SectionI } from "@/types/types";
import React, { useEffect, useState } from "react";
import styles from "./filterStat.module.scss";
import useUsers from "@/hooks/useUsers";
import useTableStatistics from "@/hooks/useTableStatistics";
import { clearStatName } from "@/utils/funcs";
import { nanoid } from "@reduxjs/toolkit";
import useOrg from "@/hooks/useOrg";
import { StateReduxI } from "@/redux/store";
import { useSelector } from "react-redux";

export default function FilterStat({ isGenDir, postItem, setTableSelect, clearTable }: { isGenDir: boolean; postItem: any; setTableSelect: React.Dispatch<React.SetStateAction<number>>; clearTable: () => void }) {
    //STATE
    const [currentTarget, setCurrentTarget] = useState(postItem);
    //offices
    const [officeSelect, setOfficeSelect] = useState(0);
    //depatments
    const [departmentsList, setDepatmentsList] = useState<DepartmentI[]>([]);
    const [departmentSelect, setDepatmentSelect] = useState(0);
    //sections
    const [sectionsList, setSectionsList] = useState<SectionI[]>([]);
    const [sectionSelect, setSectionSelect] = useState(0);
    //statistclist
    const [additionalStatsList, setAdditionalStatsList] = useState<number[]>([]);
    const [additionalStatsSelect, setAdditionalStatsSelect] = useState(0);

    //HOOKS
    const { userByID } = useUsers();
    const { statNameById } = useTableStatistics();
    const { offices } = useSelector((state: StateReduxI) => state.org);

    //FUNCS
    //create depatments list
    const createDepatmentsList = (departmentsProp: DepartmentI[] | undefined): boolean => {
        setDepatmentSelect(0);
        if (departmentsProp?.length) {
            setDepatmentsList(departmentsProp);
            return true;
        } else {
            setDepatmentsList([]);
            return false;
        }
    };

    //create sections list
    const createSectionsList = (sectionProp: SectionI[] | undefined): boolean => {
        //console.log("sectionProp", sectionProp);
        setSectionSelect(0);
        if (sectionProp?.length) {
            setSectionsList(sectionProp);
            return true;
        } else {
            setSectionsList([]);
            return false;
        }
    };

    //create statisctic html button
    const StatDiv = ({ statId }: { statId: number | null }) => {
        if (statId) {
            return (
                <div
                    onClick={() => {
                        setTableSelect(statId);
                        setAdditionalStatsSelect(0);
                    }}
                >
                    {clearStatName(statNameById(statId))} 📈
                </div>
            );
        } else {
            return <div>статистика не назначена</div>;
        }
    };

    //post Text
    const getCurrentPostText = (): string => {
        if (currentTarget) {
            if (currentTarget.departments) return `Руководитель отделения`;
            if (currentTarget.sections) return `Начальник отдела`;
            return `Администратор секции`;
        }
        return "";
    };
    //target type
    const getTargetType = () => {
        if (currentTarget) {
            if (currentTarget.departments) return `office`;
            if (currentTarget.sections) return `department`;
            return `section`;
        }
        return "";
    };

    //EFFECTS
    useEffect(() => {
        //ON CHANGE POST
        if (postItem) {
            if (postItem === "genDir") {
                //console.log("GENERAL DIRECTOR");
            }
            clearTable();
            setTableSelect(0);
            setCurrentTarget(postItem);
            createDepatmentsList(postItem?.departments);
            createSectionsList(postItem?.sections);
        }
        //console.log("FILTER UPDATE", postItem?.sections);
    }, [postItem]);
    // ON OFFICE SELECT
    useEffect(() => {
        if (officeSelect) {
            const currentOffice = offices.find((office) => office.id === officeSelect);
            setDepatmentsList(currentOffice!?.departments);
            setCurrentTarget(currentOffice);
        } else {
            setDepatmentsList([]);
        }
    }, [officeSelect]);

    useEffect(() => {
        // ON DEPATMENT SELECT
        clearTable();
        setTableSelect(0);

        if (departmentSelect) {
            const curretDepatment = departmentsList.find((dep) => dep.id == departmentSelect);
            createSectionsList(curretDepatment?.sections);
            setCurrentTarget(curretDepatment);
        } else {
            setCurrentTarget(postItem);
            setSectionsList([]);
        }
    }, [departmentSelect]);

    useEffect(() => {
        // ON SECTION SELECT
        clearTable();
        setTableSelect(0);

        if (sectionSelect) {
            const currentSection = sectionsList.find((sec) => sec.id == sectionSelect);
            setCurrentTarget(currentSection);
        } else {
            const curretDepatment = departmentsList.find((dep) => dep.id == departmentSelect);
            setCurrentTarget(curretDepatment || postItem);
        }
    }, [sectionSelect]);

    useEffect(() => {
        // ON CHANGE TARGET
        setAdditionalStatsSelect(0);
        if (currentTarget?.patterns?.length) {
            // FILL ADDITIONAL STATS LIST
            setAdditionalStatsList(currentTarget.patterns);
        } else {
            setAdditionalStatsList([]);
        }
    }, [currentTarget]);

    useEffect(() => {
        //ON ADDITIONAL STAT SELECT
        if (additionalStatsSelect) {
            setTableSelect(additionalStatsSelect);
        } else {
            setTableSelect(0);
            clearTable();
        }
    }, [additionalStatsSelect]);

    return (
        currentTarget && (
            <div className={styles.mainFilterWrap}>
                <div className={styles.filterBlock}>
                    {postItem === "genDir" && (
                        <div className={styles.filterItem}>
                            <select className={styles.offSelect} value={officeSelect} onChange={(event) => setOfficeSelect(Number(event.target.value))}>
                                {offices.map((office) => (
                                    <option key={nanoid()} value={office.id}>
                                        <option>Выбор отделения</option>
                                        {office.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {!!departmentsList.length && (
                        <div className={styles.filterItem}>
                            <select className={styles.depSelect} value={departmentSelect} onChange={(event) => setDepatmentSelect(+event.target.value)}>
                                <option value={0}>Выбор отдела</option>
                                {departmentsList.map((department) => (
                                    <option key={nanoid()} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                            {!!departmentSelect && (
                                <div className={styles.close} onClick={() => setDepatmentSelect(0)}>
                                    ❌
                                </div>
                            )}
                        </div>
                    )}
                    {!!sectionsList.length && (
                        <div className={styles.filterItem}>
                            <select className={styles.secSelect} value={sectionSelect} onChange={(event) => setSectionSelect(+event.target.value)}>
                                <option value={0}>Выбор секции</option>
                                {sectionsList.map((section) => (
                                    <option key={nanoid()} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                            {!!sectionSelect && (
                                <div
                                    className={styles.close}
                                    onClick={() => {
                                        setSectionSelect(0);
                                    }}
                                >
                                    ❌
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {currentTarget !== "genDir" && (
                    <div className={`${styles.targetWrap} ${styles[getTargetType()]}`}>
                        <div className={styles.statStatus}>
                            {currentTarget?.name == postItem?.name ? (
                                <div className={styles.fill}>
                                    <span>Заполняемая</span>
                                </div>
                            ) : (
                                <div className={styles.control}>Контролируемая</div>
                            )}
                        </div>

                        <div className={styles.targetName}>
                            <div>{currentTarget.name}</div>
                        </div>

                        <div className={styles.leadershipBlock}>
                            <span>{getCurrentPostText()} :</span> <div>{userByID(+currentTarget.leadership)?.name || "не назначен"}</div>
                        </div>

                        <div className={styles.statsBlock}>
                            <div className={styles.mainStat}>
                                <span>Главная статистика</span>
                                <StatDiv statId={currentTarget.mainPattern} />
                            </div>
                            <div className={styles.addStat}>
                                <span>Дополнительные статистики</span>
                                {!!additionalStatsList.length ? (
                                    <select value={additionalStatsSelect} onChange={(event) => setAdditionalStatsSelect(+event.target.value)}>
                                        <option value={0}>Дополнительные статистики</option>
                                        {additionalStatsList.map((statId) => (
                                            <option key={nanoid()} value={statId}>
                                                {clearStatName(statNameById(statId))} 📉
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div>Дополнительные статистики не назначены</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
}
