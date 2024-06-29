import Head from "next/head";
import styles from "./auth.module.scss";
import AuthLayout from "@/components/layout/AuthLayout/AuthLayout";
import { useEffect, useState } from "react";
import Logo from "@/components/elements/loader/LogoLoading";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { clearSmiels } from "@/utils/funcs";

export default function AuthPage() {
    const [name, setName] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [post, setPost] = useState("");
    const { singIn, singUp } = useAuth();
    const { loading } = useSelector((state: any) => state.app);
    const [singInUp, setSeingInUp] = useState(true);

    const singInUpToggle = () =>
        setSeingInUp((state) => {
            setLoginEmail("");
            setLoginPassword("");
            setPost("");
            setName("");
            setConfirmPassword("");
            return !state;
        });

    const singUpHandle = () => {
        singUp(name, post, loginEmail, loginPassword, singInUpToggle);
    };

    return (
        <>
            <Head>
                <title>Авторизация</title>
            </Head>
            <h4>{process.env.NEXT_PUBLIC_SERVER_URL}</h4>
            <AuthLayout>
                <div className={styles.wrapper}>
                    <Logo loading={loading} />
                    {singInUp ? (
                        <div className={styles.singIn}>
                            <div className={styles.inputWrap}>
                                <h3>email</h3>
                                <input type="text" placeholder="email" value={loginEmail} onChange={(event) => setLoginEmail(clearSmiels(event.target.value))} />
                                <h3>пароль</h3>
                                <input type="password" placeholder="пароль" value={loginPassword} onChange={(event) => setLoginPassword(clearSmiels(event.target.value))} />
                                <button onClick={() => singIn(loginEmail, loginPassword)} disabled={loading}>
                                    Войти
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.singIn}>
                            <div className={styles.inputWrap}>
                                <h2>{singInUp ? "Авторизация" : "Регистрация"}</h2>
                                <h3>имя</h3>
                                <input type="text" placeholder="Ваше ФИО (полностью)" value={name} onChange={(event) => setName(event.target.value)} />

                                <h3>должность</h3>
                                <input type="text" placeholder="повторите пароль" value={post} onChange={(event) => setPost(event.target.value)} />

                                <h3>email</h3>
                                <input type="text" placeholder="ваш email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />

                                <h3>пароль</h3>
                                <input type="password" placeholder="введите пароль" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />

                                <h3>прдтверждение пароля</h3>
                                <input type="password" placeholder="повторите пароль" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />

                                <button onClick={singUpHandle} disabled={loading}>
                                    {singInUp ? "Войти" : "Зарегистрироваться"}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* <div className={styles.authChoose} onClick={singInUpToggle}>
                        <span>перейти на экран </span>
                        {singInUp ? <span className={styles.choose}>Регистрации</span> : <span className={styles.choose}>Авторизации</span>}
                    </div> */}
                </div>
            </AuthLayout>
        </>
    );
}

// "email":"test3@ya.ru",
// "password":"test3",
// "name":"User test 3",
// "post":"tester",
// "structure":"it"
