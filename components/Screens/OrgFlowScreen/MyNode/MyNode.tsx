import { Handle, Position, useNodeId, useNodes } from 'reactflow';
import styles from './node.module.scss';
import { OfficeWithStatsI, OfficeWithStatsTypeI, SectionWithStatsI } from '@/types/types';
import useUsers from '@/hooks/useUsers';

enum BlockStyle {
    'off' = '#FF8056',
    'dep' = 'steelblue',
    'sec' = 'rgba(42, 153, 85, 0.8431372549)',
}

export default function MyNode({ data }: { data: OfficeWithStatsTypeI }) {
    const id = useNodeId();
    const currentNode = useNodes().find((node) => node.id === id);
    //console.log(currentNode);

    const { userByID } = useUsers();

    const onMenuOpen = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        data.setActiveItem({ x: event.clientX, y: event.clientY, data });
    };
    return (
        <div className={`${styles.mainWrap} ${data.selected ? styles.mainWrapSelected : ''}`} onClick={(e) => console.log(JSON.stringify(data, null, 2))} style={{ background: BlockStyle[data.type] }} onContextMenu={onMenuOpen}>
            <div className={styles.seleted}>➡️</div>
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
