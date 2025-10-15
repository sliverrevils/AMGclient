import { AdministratorI, ChartI, OfficeI, SectionI, UserFullI } from "@/types/types";
import styles from "../../Screens/Org/org.module.scss";
import useOrg from "@/hooks/useOrg";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import AdministratorsList from "../AdministratorsList/AdministratorsList";
import { useSelector } from "react-redux";
import { StateReduxI } from "@/redux/store";
import usePatterns from "@/hooks/usePatterns";
import { celarPeriodStats, clearStatName } from "@/utils/funcs";
import Division from "../Division/Division";

export default function Section({
    sectionItem,
    users,
    userById,
    updateOrgScheme,
    office_id,
    department_id,
    charts,
    index,
    isAdmin,
}: {
    sectionItem: SectionI;
    users: Array<UserFullI>;
    userById: any;
    updateOrgScheme: any;
    office_id: number;
    department_id: number;
    charts: Array<ChartI>;
    index: number;
    isAdmin: boolean;
}) {
    //state
    const [inputAddAdmin, setInputAddAdmin] = useState("");
    const [addAdminField, setAddAdminField] = useState(false);
    const [adminsListOpen, setAdminsListOpen] = useState(!!!sectionItem.administrators.length);
    const [inputDescriptionsAddAdmin, setInputDescriptionsAddAdmin] = useState("");
    const [selectAddChart, setSelectAddChart] = useState(1);

    const [addSection, setAddSection] = useState(false);
    const [inputSectionName, setInputSectionName] = useState("");
    const [inputDescriptions, setInputDescriptions] = useState("");
    const [inputCkp, setInputCkp] = useState("");
    const [inputLeadership, setInputLeadership] = useState("");
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const [filterUser, setFilterUser] = useState("");
    //hooks
    const { addSectionAdministrator, deleteSectionAdministrator, deleteSection, updateSection } =
        useOrg();

    //hooks
    const { createDivision } = useOrg();

    //selectors

    const addSectionToggle = () =>
        setAddSection((state) => {
            if (state) {
                setInputSectionName("");
                setInputDescriptions("");
                setSectionsOpen(true);
            }
            return !state;
        });

    const creaetDepartmentHandle = (sectionId: number) => {
        createDivision(
            inputSectionName,
            inputDescriptions,
            office_id,
            department_id,
            inputCkp,
            +inputLeadership,
            sectionId
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

    //selectors
    const { tableStatisticsList } = useSelector((state: StateReduxI) => state.stats);

    const adminsListToggle = () => setAdminsListOpen((state) => !state);
    const addAdminFieldToggle = () => setAddAdminField((state) => !state);
    const delAdmin = (id: number) => {
        deleteSectionAdministrator(id, updateOrgScheme);
    };

    const addAdministrator = () => {
        addSectionAdministrator(
            sectionItem.id,
            office_id,
            department_id,
            +inputAddAdmin,
            inputDescriptionsAddAdmin,
            updateOrgScheme
        ).then(() => {
            setInputDescriptionsAddAdmin("");
            setInputAddAdmin("");
            setAddAdminField(false);
        });
    };

    const findChartById = (id: number): ChartI | undefined => {
        if (charts) return charts.find((chart) => chart.id === id);
    };

    //update

    const [updated, setUpdated] = useState(false);
    const [sectionName, setSectionName] = useState(sectionItem?.name || "");
    const [sectionLeadership, setSectionLeadership] = useState(sectionItem?.leadership || null);
    const [sectionDescriptions, setSectionDescriptions] = useState(sectionItem?.descriptions || "");
    const [sectionCkp, setSectionCkp] = useState(sectionItem?.ckp || "");

    const updateSetionHandle = () => {
        updateSection(
            sectionItem!.id,
            sectionName,
            sectionLeadership,
            sectionDescriptions,
            sectionCkp,
            () => {
                updateOrgScheme(), setUpdated(false);
            }
        );
    };

    useEffect(() => {
        if (
            sectionItem!.name !== sectionName ||
            sectionItem!.descriptions !== sectionDescriptions ||
            sectionItem!.ckp !== sectionCkp ||
            sectionItem?.leadership !== sectionLeadership
        )
            setUpdated(true);
        else setUpdated(false);
    }, [sectionName, sectionDescriptions, sectionCkp, sectionLeadership]);

    //update/

    //PATTERNS
    const { patterns } = useSelector((state: StateReduxI) => state.patterns);
    const { setSectionMainPatter, addSectionPatter, delSectionPatter } = usePatterns();
    const [patternSelect, setPatternSelect] = useState(sectionItem.mainPattern || 0);
    const [addPatternSelect, setAddPatternSelect] = useState(0);

    const onSelectPattern = (event) => {
        setPatternSelect(+event.target.value);
        setSectionMainPatter(sectionItem.id, +event.target.value);
    };

    const onAddPattern = () => addSectionPatter(sectionItem.id, addPatternSelect);

    useEffect(() => {
        console.log("➡️", sectionItem);
    }, []);

    //MEMO
    const filteredUsers = useMemo(() => {
        if (users && filterUser) {
            return users.filter((user) =>
                user.name.toLowerCase().includes(filterUser.toLowerCase())
            );
        }
        return users;
    }, [users, filterUser]);
    return (
        <div className={styles.sectionWrap}>
            <div key={sectionItem.id + "_section"} className={styles.sectionItem}>
                <div className={styles.sectionItemHead}>
                    <div className={styles.help}>секция {index + 1}</div>
                    {updated && isAdmin ? (
                        <div className={styles.update} onClick={updateSetionHandle}>
                            <img src="svg/org/update_white.svg" />
                        </div>
                    ) : (
                        <div className={styles.update}></div>
                    )}
                    <div className={styles.sectionName}>
                        {/* <input
                            value={sectionName}
                            onChange={(event) => setSectionName(event.target.value)}
                            disabled={!isAdmin}
                        /> */}
                        <textarea
                            value={sectionName}
                            onChange={(event) => setSectionName(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>
                    {isAdmin && (
                        <img
                            className={styles.delete}
                            onClick={() =>
                                confirm(`Вы точно хотите удалить секцию "${sectionItem.name}"`) &&
                                deleteSection(sectionItem.id, updateOrgScheme)
                            }
                            src="svg/org/delete_white.svg"
                        />
                    )}
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.propLine}>
                        <img src="svg/org/leadership.svg" />
                        <select
                            value={sectionLeadership || ""}
                            onChange={(event) => setSectionLeadership(+event.target.value)}
                            disabled={!isAdmin}
                        >
                            <option value={""}>администратор не назначен</option>
                            {users.map((user) => (
                                <option key={user.id + user.name} value={user.id}>
                                    id:{user.id} {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.propLine}>
                        <img src="svg/org/ckp.svg" />
                        <textarea
                            value={sectionCkp}
                            spellCheck="false"
                            onChange={(event) => setSectionCkp(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div className={`${styles.propLine} ${styles.hideFieldFlex}`}>
                        <img src="svg/org/description.svg" />
                        <textarea
                            value={sectionDescriptions}
                            spellCheck="false"
                            onChange={(event) => setSectionDescriptions(event.target.value)}
                            disabled={!isAdmin}
                        />
                    </div>

                    <div className={`${styles.patternsBlock} ${styles.hideField}`}>
                        <div className={styles.textInfo}>Главная статистика</div>
                        <div className={styles.mainStatText}>
                            {clearStatName(
                                tableStatisticsList.find(
                                    (stat) => stat.id == sectionItem.mainPattern
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
                                    {/* <span className={styles.textInfo}> Добавление дополнительной статистики </span> */}
                                    <div style={{ display: "flex" }}>
                                        <select
                                            value={addPatternSelect}
                                            onChange={(event) =>
                                                setAddPatternSelect(+event.target.value)
                                            }
                                        >
                                            <option value={0}>Выберите главный шаблон</option>
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
                                {sectionItem.patterns.map((id) => {
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
                                                        delSectionPatter(sectionItem.id, id)
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

                    <div className={`${styles.administratorsList} `}>
                        <div
                            className={styles.propLine}
                            onClick={adminsListToggle}
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <img src="svg/org/admins.svg" />
                                <span onClick={adminsListToggle}>
                                    сотрудники: {sectionItem.administrators.length}
                                </span>
                            </span>
                            {sectionItem.administrators.length ? (
                                <img
                                    className="open_list"
                                    style={{ width: 15 }}
                                    src={`svg/org/${
                                        adminsListOpen ? "arrow_dawn" : "arrow_up"
                                    }.svg`}
                                />
                            ) : (
                                <span> </span>
                            )}
                            <span></span>
                        </div>

                        {addAdminField ? (
                            <div className={styles.addAdmin}>
                                <input
                                    placeholder="фильтр сотрудников"
                                    value={filterUser}
                                    onChange={(e) => setFilterUser(e.target.value)}
                                />
                                <select
                                    value={inputAddAdmin}
                                    onChange={(event) => setInputAddAdmin(event.target.value)}
                                >
                                    <option value={""}>
                                        ({filteredUsers.length})👥выбор сотрудника{" "}
                                    </option>
                                    {filteredUsers.map((user) => (
                                        <option key={user.id + "_addAdmins"} value={user.id}>
                                            🆔{user.id}👤{user.name}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={inputDescriptionsAddAdmin}
                                    onChange={(event) =>
                                        setInputDescriptionsAddAdmin(event.target.value)
                                    }
                                    placeholder="описание сотрудника"
                                />
                                <div className={styles.addAdminBtns}>
                                    <button onClick={addAdministrator} disabled={!inputAddAdmin}>
                                        добавить
                                    </button>
                                    <button onClick={addAdminFieldToggle}>отмена</button>
                                    {/* <img onClick={addAdministrator} src="svg/org/admin_add.svg" />
                            <img onClick={addAdminFieldToggle} src="svg/org/close_field.svg" /> */}
                                </div>
                            </div>
                        ) : (
                            adminsListOpen &&
                            isAdmin && (
                                <div className={styles.addAdminBtn}>
                                    {" "}
                                    <img
                                        src="svg/org/admin_add.svg"
                                        onClick={addAdminFieldToggle}
                                    />
                                </div>
                            )
                        )}

                        {adminsListOpen &&
                            sectionItem.administrators.map((admin: AdministratorI, idx) => {
                                return (
                                    <AdministratorsList
                                        key={idx + "adminsList"}
                                        {...{
                                            admin,
                                            charts,
                                            findChartById,
                                            idx,
                                            updateOrgScheme,
                                            user_id: admin.user_id,
                                            userById,
                                            isAdmin,
                                        }}
                                    />
                                );
                            })}
                    </div>
                </div>
                {isAdmin && !addSection && (
                    <div
                        className={styles.addItemBtn}
                        onClick={addSectionToggle}
                        style={{ background: "#c9960b" }}
                    >
                        Добавить подразделение
                        <img src="svg/org/add_white.svg" />
                    </div>
                )}
                {addSection && (
                    <div className={styles.addSectionForm}>
                        <div className={styles.addForm}>
                            <h3 style={{ color: "#c9960b" }}>Новое подразделение</h3>
                            <span className={styles.addHelp}>
                                Название подразделения( число через пробел в начале для сортировки)
                            </span>
                            <input
                                type="text"
                                value={inputSectionName}
                                onChange={(event) => setInputSectionName(event.target.value)}
                                placeholder="1 название подразделения"
                            />
                            <span className={styles.addHelp}>Руководитель подразделения</span>
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
                            <span className={styles.addHelp}>КПЦ подразделения</span>
                            <textarea
                                value={inputCkp}
                                spellCheck="false"
                                onChange={(event) => setInputCkp(event.target.value)}
                                placeholder="ЦКП"
                            />
                            <span className={styles.addHelp}>Описание подразделения</span>
                            <textarea
                                value={inputDescriptions}
                                spellCheck="false"
                                onChange={(event) => setInputDescriptions(event.target.value)}
                                placeholder="Описание подразделения"
                            />
                            <button
                                onClick={() => creaetDepartmentHandle(sectionItem.id)}
                                style={{ background: "#c9960b" }}
                            >
                                Добавить подразделение
                            </button>
                            {/* <img src="svg/org/close_field_white.svg" onClick={addSectionToggle} className="close" /> */}
                            <img
                                src="svg/org/close_field.svg"
                                onClick={addSectionToggle}
                                className={styles.close}
                            />
                        </div>
                    </div>
                )}
                {sectionItem.divisions
                    .toSorted(
                        (a, b) =>
                            (parseInt(a.name.split(" ")[0]) || 999) -
                            (parseInt(b.name.split(" ")[0]) || 999)
                    )
                    .map((division, index: number) => (
                        <Division
                            key={division.id + "_divisionItem"}
                            sectionItem={division}
                            {...{
                                charts,
                                users,
                                userById,
                                updateOrgScheme,
                                office_id,
                                department_id: division.department_id,
                                index,
                                isAdmin,
                            }}
                        />
                    ))}
            </div>

            {/* <div className={styles.line}></div> */}
        </div>
    );
}
