import { Handle, Position, useNodeId, useNodes } from 'reactflow';
import styles from './node.module.scss';
import { OfficeWithStatsI, OfficeWithStatsTypeI, SectionWithStatsI } from '@/types/types';
import useUsers from '@/hooks/useUsers';

enum BlockStyle {
    'off' = 'tomato',
    'dep' = 'blue',
    'sec' = 'green',
}

export default function MyNode({ data }: { data: OfficeWithStatsTypeI }) {
    const id = useNodeId();
    const currentNode = useNodes().find((node) => node.id === id);
    //console.log(currentNode);

    const { userByID } = useUsers();

    const onItemMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        data.setActiveItem({ x: event.clientX, y: event.clientY, data });
    };
    return (
        <div
            className={styles.mainWrap}
            onClick={(e) => console.log(JSON.stringify(data, null, 2))}
            style={{ background: BlockStyle[data.type] }}
            onMouseEnter={onItemMouseEnter}
            //onMouseLeave={() => data.setActiveItem(null)}
        >
            {data.type == 'off' && <Handle id={String(Math.random())} type="source" position={Position.Bottom} />}

            {data.type == 'dep' && <Handle id={String(Math.random())} type="target" position={Position.Top} />}
            {data.type == 'dep' && <Handle id={String(Math.random())} type="source" position={Position.Left} />}

            {data.type == 'sec' && <Handle id={String(Math.random())} type="target" position={Position.Top} />}

            <div className={styles.content}>
                <div className={styles.name}>{data.name}</div>
                <div className={styles.leadership}>{userByID(data.leadership)?.name}</div>
                <div className={styles.ckp}>{data.ckp}</div>
                <div className={styles.description}>{data.descriptions}</div>
            </div>
        </div>
    );
}
