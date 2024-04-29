import { BaseEdge, getStraightPath } from 'reactflow';

export default function MyEdge({ id, sourceX, sourceY, targetX, targetY }) {
    const [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} />
        </>
    );
}
