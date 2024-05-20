import { Handle, Position, useNodeId, useNodes } from "reactflow";
import styles from "./node.module.scss";
import { ActiveItemI, OfficeWithStatsI, OfficeWithStatsTypeI, SectionWithStatsI } from "@/types/types";
import useUsers from "@/hooks/useUsers";
import { useEffect } from "react";

export default function MyNode({ data }: { data: OfficeWithStatsTypeI }) {
    const id = useNodeId();
    const currentNode = useNodes().find((node) => node.id === id);
    //console.log(currentNode);

    const { userByID } = useUsers();

    const onMenuOpen = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //console.log(event.type);
        event.preventDefault();
        const { left, top, width } = event.currentTarget.getBoundingClientRect();
        data.setActiveItem({ x: left + width, y: top, width, data, eventType: event.type, type: data.type });
    };

    const leaderName = userByID(data.leadership)?.name;

    //clear name
    let itemName = data.name;
    let nameArr = data.name.split(" ");
    if (!Number.isNaN(Number(nameArr[0]))) {
        [, ...nameArr] = nameArr;
        itemName = nameArr.join();
    }

    return (
        <div className={`${styles.mainWrap} ${styles[`mainWrap_${data.type}`]} ${data.selected ? styles.mainWrapSelected : ""} ${data.type === "genDir" ? styles.genDir : ""}`} onContextMenu={onMenuOpen} onMouseEnter={onMenuOpen}>
            <div className={styles.seleted}>🚩</div>
            {data.type == "genDir" && <Handle id={String(Math.random())} type="source" position={Position.Bottom} />}

            {data.type == "off" && <Handle id={String(Math.random())} type="target" position={Position.Top} />}
            {data.type == "off" && <Handle id={String(Math.random())} type="source" position={Position.Bottom} />}

            {data.type == "dep" && <Handle id={String(Math.random())} type="target" position={Position.Top} />}
            {data.type == "dep" && <Handle id={String(Math.random())} type="source" position={Position.Left} />}

            {data.type == "sec" && <Handle id={String(Math.random())} type="target" position={Position.Top} />}

            <div className={styles.content}>
                <div className={styles.name}>{itemName}</div>
                {leaderName && <div className={`${styles.leadership} ${data.selectedUserId === data.leadership ? styles.leadershipSelected : ""}`}>{leaderName} </div>}
                {data.ckp && <div className={styles.ckp}>{data.ckp}</div>}
                <div className={styles.description}>{data.descriptions}</div>
            </div>
        </div>
    );
}
