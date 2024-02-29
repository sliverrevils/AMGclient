import { MenuI } from "@/types/types";
import React, { MouseEvent, useEffect, useState } from "react";

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

    const createMenu = ({onWindow=false,position='fixed'}:{onWindow?:boolean,position?:'fixed'|'absolute'}) => {
        const initMenuValue = { show: false, position: { x: 100, y: -1000 } }
        const [menuState, setMenuState] = useState<MenuI>(initMenuValue);
        const closeMenuFunc = () => setMenuState(state => initMenuValue);
        
        let styleForMenu: React.CSSProperties = {
            display: onWindow?'flex':menuState.show?'flex':'none',
            position,
            top: menuState.position.y,
            left: menuState.position.x,
        }


        const onMenuFunc = (event: React.MouseEvent, selector: string='') => { // selector is for calc position on window
            if (event) {
                event.preventDefault();
                let spaceY = 0;


                if (selector) {
                    const menuElement = document.querySelector('.' + selector);
                    let menuSizes = menuElement!.getBoundingClientRect();
                    spaceY = (window.innerHeight - event.clientY) - menuSizes.height < 0
                        ? Math.abs((window.innerHeight - event.clientY) - menuSizes.height) + 10
                        : 0
                }

                setMenuState({
                    show: true,
                    position: {
                        x: event.clientX + 10,
                        y: event.clientY-10 - spaceY
                    }
                })


            }

        }

        // const styleForMenu: React.CSSProperties = {
        //     display: menuState.show ? `flex` : `none`,
        //     position: 'fixed',
        //     top: menuState.position.y,
        //     left: menuState.position.x,
        // }



        const res: [
            menuState: MenuI,
            onMenuFunc: (event: React.MouseEvent,selector?:string) => void,
            closeMenuFunc: () => void,
            styleForMenu: React.CSSProperties
        ] = [menuState, onMenuFunc, closeMenuFunc, styleForMenu]




        return res;
    }

    return { createMenu }
}