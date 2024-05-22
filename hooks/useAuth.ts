import axiosClient, { axiosError } from "@/app/axiosClient";
import { userLogOut } from "@/app/usersClent";
import { logInRedux, logOutRedux } from "@/redux/mainSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoadingRedux } from "@/redux/appSlice";
import { UserFullI } from "@/types/types";
import { contentCurrentClear } from "@/redux/contentSlice";

export const useAuth = () => {
    const dispatch = useDispatch();

    const logout = () => {
        dispatch(logOutRedux());
        dispatch(setLoadingRedux(true));
        userLogOut()
            .then((message) => {
                toast.warn(message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            })
            .finally(() => {
                dispatch(setLoadingRedux(false));
                dispatch(contentCurrentClear());
            });
    };

    const singIn = (loginEmail: string, loginPassword: string) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/login", {
                username: loginEmail,
                password: loginPassword,
            })
            .then(({ data }) => {
                console.log("LOGIN DATA", data);
                if (data.user) {
                    // notifyMsg(data.user.email);
                    // toast(data.message);
                    toast.success(data.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    dispatch(logInRedux(data.user));
                }
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    const singUp = async (name: string, post: string, loginEmail: string, loginPassword: string, toggleFunc: any) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/signup", {
                email: loginEmail,
                password: loginPassword,
                post: post,
                name,
            })
            .then(({ data }) => {
                console.log("SING UP DATA", data);
                if (data) {
                    // notifyMsg(data.user.email);
                    // toast(data.message);
                    if (data.warningMessage) {
                        toast.error(data.warningMessage);
                        return;
                    }
                    toggleFunc();

                    toast.success(`Поздравляем ! Вы успешно зарегистрировались! Дождитесь верификации администратора`, {
                        position: "top-right",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    dispatch(logInRedux(data.user));
                }
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    const createUser = async (name: string, post: string, loginEmail: string, loginPassword: string, toggleFunc: any) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/signup", {
                email: loginEmail,
                password: loginPassword,
                post: post,
                name,
            })
            .then(({ data }) => {
                console.log("SING UP DATA", data);
                if (data) {
                    if (data.warningMessage) {
                        toast.error(data.warningMessage);
                        return;
                    }
                    toggleFunc();

                    toast.success(`Пользователь ${loginEmail} успешно создан`, {
                        position: "top-right",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    // dispatch(logInRedux(data.user));
                }
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    const updateUser = async (id: number, name: string, login: string, updater?: () => void) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/update", {
                id,
                name,
                login,
            })
            .then(({ data }) => {
                if (data) {
                    toast.error(data.errorMessage);

                    toast.success(data.message, {
                        position: "top-left",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    updater && updater();
                }
                return;
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    const deleteUser = async (id: number, updater?: () => void) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .get(`users/delete/${id}`)
            .then(({ data }) => {
                if (data) {
                    toast.error(data.errorMessage);

                    toast.success(data.message, {
                        position: "top-left",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    updater && updater();
                }
                return;
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    const changeUserPass = async (id: number, password: string, updater: () => void, oldPassword: string = "") => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/change-pass", {
                id,
                password,
                oldPassword,
            })
            .then(({ data }) => {
                if (data) {
                    toast.error(data.errorMessage);

                    toast.success(data.message, {
                        position: "top-left",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    updater && updater();
                }
                return;
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    const allUsers = async (setUsersFunc: any) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .get("users/all-users")
            .then(({ data }: { data: UserFullI[] }) => {
                setUsersFunc(data);
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    const verificateUser = async (id: number, setUsersFunc: any = false) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/verificate-user", { id })
            .then(({ data }) => {
                toast.success(data.message, {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                if (setUsersFunc) allUsers(setUsersFunc);
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    const adminToggle = async (id: number, setUsersFunc: any = false) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/role_toggle", { id })
            .then(({ data }) => {
                toast.success(data.message, {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                if (setUsersFunc) allUsers(setUsersFunc);
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };

    const blockUserToggle = async (id: number, setUsersFunc: any = false) => {
        dispatch(setLoadingRedux(true));
        axiosClient
            .post("users/block-user", { id })
            .then(({ data }) => {
                toast.success(data.message, {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                if (setUsersFunc) allUsers(setUsersFunc);
            })
            .catch(axiosError)
            .finally(() => dispatch(setLoadingRedux(false)));
    };
    return { logout, singIn, singUp, allUsers, verificateUser, blockUserToggle, createUser, updateUser, changeUserPass, deleteUser, adminToggle };
};
