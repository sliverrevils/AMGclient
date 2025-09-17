import axiosClient, { axiosError } from "@/app/axiosClient";
import { setLoadingRedux } from "@/redux/appSlice";
import { setUserOnDirectRedux } from "@/redux/mainSlice";
import { setOfficesRedux } from "@/redux/orgSlice";
import {
    setAccessPatternsRedux,
    setPatternsRedux,
    setTableHeadersRedux,
} from "@/redux/patternsSlce";
import { setTableStatisticsListRedux } from "@/redux/statsSlice";
import { setUsersRedux } from "@/redux/usersSlice";
import { ChartI, ChartPatternI, LineI, OfficeI } from "@/types/types";
import { replaceFio } from "@/utils/funcs";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function useOrg() {
    const dispatch = useDispatch();

    // GET FULL ORG
    const getOrgFullScheme = ({
        setOrgScheme,
        setUsers,
        setCharts,
    }: { setOrgScheme?: any; setUsers?: any; setCharts?: any } = {}) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .get("info")
            .then(
                ({
                    data: {
                        offices,
                        users,
                        patterns,
                        patternAccesses,
                        tablePatterns,
                        tableStatistics,
                        userOnDirect,
                    },
                }) => {
                    //set on state
                    setOrgScheme && setOrgScheme(offices);
                    setOrgScheme && setUsers(users);
                    setCharts && setCharts(patterns);

                    //REDUX
                    //users
                    if (users) {
                        dispatch(
                            setUsersRedux(
                                users.map((user) => {
                                    return {
                                        ...user,
                                        name: replaceFio(user.name),
                                        post: JSON.parse(user.post || "[]"),
                                    };
                                })
                            )
                        );
                    }

                    //patterns
                    if (patterns?.length) {
                        const paternsParsed = (patterns as ChartI[]).map((pattern) => ({
                            ...pattern,
                            lines: JSON.parse(pattern.lines),
                            fields: JSON.parse(pattern.fields),
                            access: JSON.parse(pattern.access),
                        }));
                        //console.log('PATTERNS',paternsParsed)
                        dispatch(setPatternsRedux(paternsParsed as ChartPatternI[]));
                    }
                    //offices
                    if (offices?.length) {
                        dispatch(setOfficesRedux(offices as OfficeI[]));
                    }
                    //ACCESS
                    dispatch(setAccessPatternsRedux(patternAccesses));

                    if (tablePatterns?.length) {
                        const tablePatternsParsed = tablePatterns.map((pattern) => ({
                            ...pattern,
                            headers: JSON.parse(pattern.headers),
                        }));
                        // console.log('TABLE PATTERNS 📌📌📌📌',tablePatternsParsed);
                        dispatch(setTableHeadersRedux(tablePatternsParsed));
                    } else {
                        dispatch(setTableHeadersRedux([]));
                    }

                    if (tableStatistics) {
                        // console.log("TABELS📅", tableStatistics);
                        dispatch(setTableStatisticsListRedux(tableStatistics));
                    }
                    //USER ON DIRECT
                    dispatch(setUserOnDirectRedux(userOnDirect));
                }
            )
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    //GET REPORTS LIST
    const getReportList = (statIdArr: number[], setReportList: any) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post(`info/raport-list`, {
                statIdArr,
            })
            .then(({ data }) => {
                if (data.length) {
                    setReportList(data);
                }
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    //--------------------------Oficces
    const createOffice = async (
        name: string,
        leadership: null | number,
        descriptions: string,
        ckp: string
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("offices/create", {
                name,
                leadership,
                descriptions,
                ckp,
            });
            //console.log('CREATE DES', descriptions);
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Отделение "${created.name}" успешно содано`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const updateOffice = async (
        officeId: number,
        name: string,
        leadership: null | number,
        descriptions: string,
        ckp: string,
        updateFunc?: any
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("offices/update/" + officeId, {
                name,
                leadership,
                descriptions,
                ckp,
            });
            // console.log('CREATE DES', descriptions);
            dispatch(setLoadingRedux(false));
            if (created) {
                //console.log("CREATED OFFICE", created);
                toast.success(`Отделение "${created.data.name}" успешно обновлено`);
                updateFunc && updateFunc();
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const deleteOffice = async (id: number, update: () => {}) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.get(`offices/delete/${id}`);
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Отделение успешно удалёно`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //-------------------Departments
    const createDepartment = async (
        office_id: number,
        name: string,
        code: string,
        leadership: number,
        descriptions: string,
        ckp: string
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("departments/create", {
                office_id,
                name,
                code,
                leadership,
                descriptions,
                ckp,
            });
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Отдел "${created.data.name}" успешно содан`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const updateDepatment = async (
        depatmentId: number,
        name: string,
        leadership: null | number,
        code: string,
        descriptions: string,
        ckp: string,
        updateFunc?: any
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("departments/update/" + depatmentId, {
                name,
                leadership,
                code,
                descriptions,
                ckp,
            });
            // console.log('CREATE DES', descriptions);
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Отдел "${created.data.name}" успешно обновлён`);
                updateFunc && updateFunc();
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const deleteDepartment = async (id: number, update: () => {}) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.get(`departments/delete/${id}`);
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Отдел успешно удалён`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    //--------------------Sections
    const createSection = async (
        name: string,
        descriptions: string,
        office_id: number,
        department_id: number,
        ckp: string,
        leadership: number
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("sections/create", {
                name,
                descriptions,
                office_id,
                department_id,
                ckp,
                leadership,
            });
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Секция "${name}" успешно содана`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const createDivision = async (
        name: string,
        descriptions: string,
        office_id: number,
        department_id: number,
        ckp: string,
        leadership: number,
        division_for_sector_id: number
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("sections/create-division", {
                name,
                descriptions,
                office_id,
                department_id,
                ckp,
                leadership,
                division_for_sector_id,
            });
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Подразделение "${name}" успешно содано`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const updateSection = async (
        sectionId: number,
        name: string,
        leadership: null | number,
        descriptions: string,
        ckp: string,
        updateFunc?: any
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post("sections/update/" + sectionId, {
                name,
                leadership,
                descriptions,
                ckp,
            });
            // console.log('CREATE DES', descriptions);
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Секция "${created.data.name}" успешно обновлена`);
                updateFunc && updateFunc();
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const deleteSection = async (id: number, update: () => {}) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.get(`sections/delete/${id}`);
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Секция успешно удалёна`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //ADMINISTRATORS
    const addSectionAdministrator = async (
        section_id: number,
        office_id: number,
        department_id: number,
        user_id: number,
        descriptions: string,
        update: () => {}
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(`administrators/create`, {
                section_id,
                office_id,
                department_id,
                user_id,
                descriptions,
            });
            dispatch(setLoadingRedux(false));
            if (created) {
                update();
                console.log("ADD ADMINISTRATOR", created);
                !created.data.errorMessage && toast.success("В секцию добавлен сотрудник");
                toast.warning(created.data.errorMessage);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    const deleteSectionAdministrator = async (id: number, update: () => {}) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.get(`administrators/delete/${id}`);
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Сотрудник удалён из секции`);
                toast.warning(created.data.errorMessage);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    //CHARTS
    const addChartToAdministrator = async (
        administrator_id: number,
        chart_id: number,
        update: () => {}
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(
                `administrators/add_chart/${administrator_id}`,
                { chart_id }
            );
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Шаблон успешно добавлен администратору`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };
    const deleteChartFromAdministrator = async (
        administrator_id: number,
        chart_id: number,
        update: () => {}
    ) => {
        dispatch(setLoadingRedux(true));
        try {
            const created: any = await axiosClient.post(
                `administrators/delete_chart/${administrator_id}`,
                { chart_id }
            );
            update();
            dispatch(setLoadingRedux(false));
            if (created) {
                toast.success(`Шаблон удалён из списка`);
            }
            return true;
        } catch (err) {
            dispatch(setLoadingRedux(false));
            axiosError(err);
            return false;
        }
    };

    return {
        getOrgFullScheme,
        createOffice,
        deleteOffice,
        deleteDepartment,
        createDepartment,
        createSection,
        deleteSection,
        addSectionAdministrator,
        deleteSectionAdministrator,
        addChartToAdministrator,
        deleteChartFromAdministrator,
        updateOffice,
        updateDepatment,
        updateSection,
        getReportList,
        createDivision,
    };
}
