import { DepartmentI, OfficeI, UserFullI } from "@/types/types";
import styles from "../../Screens/Org/org.module.scss";
import Section from "../Section/Section";
import { useEffect, useState } from "react";
import useOrg from "@/hooks/useOrg";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import usePatterns from "@/hooks/usePatterns";
import { celarPeriodStats, clearStatName } from "@/utils/funcs";

export default function Depatment({
    departmentItem,
    users,
    userById,
    updateOrgScheme,
    office_id,
    charts,
    indexDep,
    isAdmin,
}: {
    departmentItem: DepartmentI;
    users: Array<UserFullI>;
    userById: any;
    updateOrgScheme: any;
    office_id: number;
    charts: any[];
    indexDep: number;
    isAdmin: boolean;
}) {
    //state
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const sectionsOpenToggle = () => setSectionsOpen((state) => !state);
    const { deleteDepartment } = useOrg();
    const [addSection, setAddSection] = useState(false);
    const [inputSectionName, setInputSectionName] = useState("");
    const [inputDescriptions, setInputDescriptions] = useState("");
    const [inputCkp, setInputCkp] = useState("");
    const [inputLeadership, setInputLeadership] = useState("");

    //hooks
    const { createSection, updateDepatment } = useOrg();

    //selectors
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    const addSectionToggle = () =>
        setAddSection((state) => {
            if (state) {
                setInputSectionName("");
                setInputDescriptions("");
                setSectionsOpen(true);
            }
            return !state;
        });

    const creaetDepartmentHandle = () => {
        createSection(
            inputSectionName,
            inputDescriptions,
            office_id,
            departmentItem.id,
            inputCkp,
            +inputLeadership
        ).then((data) => {
            if (data) {
                updateOrgScheme();
                setInputSectionName("");
                setInputDescriptions("");
                setAddSection(false);
                setInputCkp("");
                setInputDescriptions("");
                setInputLeadership("");
            }
        });
    };

    //update

    const [updated, setUpdated] = useState(false);
    const [departmentName, setDepartmentName] = useState(departmentItem?.name || "");
    const [departmentLeadership, setDepartmentLeadership] = useState(
        departmentItem?.leadership || null
    );
    const [departmentCode, setDepartmentCode] = useState(departmentItem?.code || "");
    const [departmentDescriptions, setDepartmentDescriptions] = useState(
        departmentItem?.descriptions || ""
    );
    const [departmentCkp, setDepartmentCkp] = useState(departmentItem?.ckp || "");

    const updateDepartmentHandle = () => {
        updateDepatment(
            departmentItem!.id,
            departmentName,
            departmentLeadership,
            departmentCode,
            departmentDescriptions,
            departmentCkp,
            () => {
                updateOrgScheme(), setUpdated(false);
            }
        );
    };

    useEffect(() => {
        if (
            departmentItem!.name !== departmentName ||
            departmentItem!.descriptions !== departmentDescriptions ||
            departmentItem!.ckp !== departmentCkp ||
            departmentItem?.leadership !== departmentLeadership ||
            departmentItem.code !== departmentCode
        )
            setUpdated(true);
        else setUpdated(false);
    }, [
        departmentName,
        departmentDescriptions,
        departmentCkp,
        departmentLeadership,
        departmentCode,
    ]);

    //update/

    //PATTERNS
    const { patterns } = useSelector((state: StateReduxI) => state.patterns);
    const { addDepartmentPattern, setDepartmentMainPattern, delDepartmentPattern } = usePatterns();
    const [patternSelect, setPatternSelect] = useState(departmentItem.mainPattern || 0);
    const [addPatternSelect, setAddPatternSelect] = useState(0);

    const onSelectPattern = (event) => {
        setPatternSelect(+event.target.value);
        setDepartmentMainPattern(departmentItem.id, +event.target.value);
    };

    const onAddPattern = () => addDepartmentPattern(departmentItem.id, addPatternSelect);

    return (
        <div className={styles.department}>
            <div className={styles.departmentItem}>
                <div className={styles.departmentHead}>
                    <div className={styles.help}>отдел {indexDep + 1}</div>
                    <div className={styles.departmentName}>
                        {updated && isAdmin ? (
                            <div className={styles.update} onClick={updateDepartmentHandle}>
                                <img src="svg/org/update_white.svg" />
                            </div>
                        ) : (
                            <div className={styles.update}></div>
                        )}
                        {/* <img src="svg/org/department.svg" /> */}
                        <textarea
                            value={departmentName}
                            onChange={(event) => setDepartmentName(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>
                    {isAdmin && (
                        <img
                            src="svg/org/delete_white.svg"
                            onClick={() =>
                                confirm(
                                    `Вы точно хотите удалить отдел "${departmentItem.name}" ?`
                                ) && deleteDepartment(departmentItem.id, updateOrgScheme)
                            }
                        />
                    )}
                </div>

                <div className={styles.depatmentBody}>
                    <div className={styles.propLine}>
                        {" "}
                        <img src="svg/org/leadership.svg" />
                        <select
                            value={departmentLeadership || ""}
                            onChange={(event) => setDepartmentLeadership(+event.target.value)}
                            disabled={!isAdmin}
                        >
                            <option value={""}>руководитель не назначен</option>
                            {users.map((user) => (
                                <option key={user.id + user.name} value={user.id}>
                                    id:{user.id} {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.propLine}>
                        <img src="svg/org/code.svg" />
                        <input
                            value={departmentCode}
                            spellCheck="false"
                            onChange={(event) => setDepartmentCode(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div className={styles.propLine}>
                        <img src="svg/org/ckp.svg" />
                        <textarea
                            value={departmentCkp}
                            spellCheck="false"
                            onChange={(event) => setDepartmentCkp(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div className={`${styles.propLine} ${styles.hideFieldFlex}`}>
                        <img src="svg/org/description.svg" />
                        <textarea
                            value={departmentDescriptions}
                            spellCheck="false"
                            onChange={(event) => setDepartmentDescriptions(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>

                    <div className={`${styles.patternsBlock} ${styles.hideField}`}>
                        <div className={styles.textInfo}>Главная статистика</div>
                        <div className={styles.mainStatText}>
                            {clearStatName(
                                tableStatisticsList.find(
                                    (stat) => stat.id == departmentItem.mainPattern
                                )?.name || "Главная статистика не назначена"
                            )}
                        </div>
                        {isAdmin && (
                            <select
                                value={patternSelect}
                                onChange={onSelectPattern}
                                disabled={!isAdmin}
                            >
                                <option value={0}>Выберите главную статистику</option>
                                {celarPeriodStats(tableStatisticsList).map((pattern) => (
                                    <option key={pattern.id + "_patternItem"} value={pattern.id}>
                                        {clearStatName(pattern.name)}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div>
                            <span className={styles.textInfo}>Дополнительные статистики</span>
                            {isAdmin && (
                                <div>
                                    <span className={styles.textInfo}>
                                        {" "}
                                        Добавление дополнительной статистики
                                    </span>
                                    <div style={{ display: "flex" }}>
                                        <select
                                            value={addPatternSelect}
                                            onChange={(event) =>
                                                setAddPatternSelect(+event.target.value)
                                            }
                                        >
                                            <option value={0}>
                                                Выберите дополнительную статистику
                                            </option>
                                            {celarPeriodStats(tableStatisticsList).map(
                                                (pattern) => (
                                                    <option
                                                        key={pattern.id + "_addpatternItem"}
                                                        value={pattern.id}
                                                    >
                                                        {clearStatName(pattern.name)}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        <span onClick={onAddPattern} style={{ cursor: "pointer" }}>
                                            ➕
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className={styles.patternsList}>
                                {departmentItem.patterns.map((id) => {
                                    const pattern = tableStatisticsList.find(
                                        (pattern) => pattern.id == id
                                    );
                                    return (
                                        <div>
                                            📉
                                            {clearStatName(pattern?.name || "статистика удалена")}
                                            {isAdmin && (
                                                <span
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() =>
                                                        delDepartmentPattern(departmentItem.id, id)
                                                    }
                                                >
                                                    ❌
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div
                            className={styles.addItemBtn}
                            onClick={addSectionToggle}
                            style={{ background: "#2a9955d7" }}
                        >
                            Добавить секцию
                            <img src="svg/org/add_white.svg" />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.sectionsList}>
                {addSection && (
                    <div className={styles.addSectionForm}>
                        <div className={styles.addForm}>
                            <h3>Новая секция</h3>
                            <span className={styles.addHelp}>
                                Название секции( число через пробел в начале для сортировки)
                            </span>
                            <input
                                type="text"
                                value={inputSectionName}
                                onChange={(event) => setInputSectionName(event.target.value)}
                                placeholder="1 название секции"
                            />
                            <span className={styles.addHelp}>Руководитель секции</span>
                            <select
                                value={inputLeadership}
                                onChange={(event) => setInputLeadership(event.target.value)}
                            >
                                <option>выбор руководителя</option>
                                {users.map((user) => (
                                    <option key={user.id + user.name + "_userItem"} value={user.id}>
                                        id:{user.id} {user.name}
                                    </option>
                                ))}
                            </select>
                            <span className={styles.addHelp}>КПЦ секции</span>
                            <textarea
                                value={inputCkp}
                                spellCheck="false"
                                onChange={(event) => setInputCkp(event.target.value)}
                                placeholder="ЦКП"
                            />
                            <span className={styles.addHelp}>Описание секции</span>
                            <textarea
                                value={inputDescriptions}
                                spellCheck="false"
                                onChange={(event) => setInputDescriptions(event.target.value)}
                                placeholder="Описание секции"
                            />
                            <button onClick={creaetDepartmentHandle}>Добавить секцию</button>
                            {/* <img src="svg/org/close_field_white.svg" onClick={addSectionToggle} className="close" /> */}
                            <img
                                src="svg/org/close_field.svg"
                                onClick={addSectionToggle}
                                className={styles.close}
                            />
                        </div>
                    </div>
                )}
                {departmentItem.sections
                    .toSorted(
                        (a, b) =>
                            (parseInt(a.name.split(" ")[0]) || 999) -
                            (parseInt(b.name.split(" ")[0]) || 999)
                    )
                    .map((section, index: number) => (
                        <Section
                            key={section.id + "_sectionItem"}
                            sectionItem={section}
                            {...{
                                charts,
                                users,
                                userById,
                                updateOrgScheme,
                                office_id,
                                department_id: departmentItem.id,
                                index,
                                isAdmin,
                            }}
                        />
                    ))}
            </div>
        </div>
    );
}
