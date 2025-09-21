import { store } from "@/redux/store";
import { Html, Head, Main, NextScript } from "next/document";
import { Provider } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

export const notifyMsg = (text) => toast(text, { style: { zIndex: 9999 } });

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body>
                <ToastContainer />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
