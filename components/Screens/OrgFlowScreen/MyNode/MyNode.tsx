import { Handle, Position, useNodeId, useNodes } from 'reactflow';
import styles from './node.module.scss';
import { OfficeWithStatsI, SectionWithStatsI } from '@/types/types';
import useUsers from '@/hooks/useUsers';

enum BlockStyle {
    'off' = 'tomato',
    'dep' = 'blue',
    'sec' = 'green',
}
interface OfficeWithStatsTypeI extends OfficeWithStatsI, SectionWithStatsI {
    type: string;
}

export default function MyNode({ data }: { data: OfficeWithStatsTypeI }) {
    const id = useNodeId();
    const currentNode = useNodes().find((node) => node.id === id);
    //console.log(currentNode);

    const { userByID } = useUsers();
    return (
        <div className={styles.mainWrap} onClick={() => alert(data.name)} style={{ background: BlockStyle[data.type] }}>
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
