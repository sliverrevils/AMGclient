import { MenuI } from "@/types/types";
import React, { useState } from "react";

export default function useUI() {

    //create State for menu & funcs

    //ChartView.tsx - 149
    
    //context menu costum line
    // const [lineMenu,onOpenLineMenu,onCloseLineMenu,lineMenuStyle] = createMenu();
    // const [selectedLine,setSelectedLine]=useState(0);

    // const onContextLineMenu=(event: React.MouseEvent<HTMLDivElement, MouseEvent>,costumLine:CostumLineI)=>{
    //     onOpenLineMenu(event);
    //     setSelectedLine(state=>costumLine.key);

    // }
    
    const createMenu = () => {
        const initMenuValue = { show: false, position: { x: 10, y: 10 } }
        const [menuState, setMenuState] = useState<MenuI>(initMenuValue);
        const closeMenuFunc = () => setMenuState(state => initMenuValue)

        const onMenuFunc = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event) {
                event.preventDefault();
                //alert('MENU');   
                setMenuState({
                    show: true,
                    position: {
                        x: event.clientX,
                        y: event.clientY
                    }
                })
            }

        }
        const styleForMenu: React.CSSProperties = {
            display: menuState.show ? `flex` : `none`,
            position: 'fixed',
            top: menuState.position.y,
            left: menuState.position.x + 10,
        }



        const res: [
            menuState: MenuI,
            onMenuFunc: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
            closeMenuFunc: () => void,
            styleForMenu: React.CSSProperties
        ] = [menuState, onMenuFunc, closeMenuFunc, styleForMenu]


        return res;
    }

    return { createMenu }
}