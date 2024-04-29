import { useState } from 'react';
import OrgFlowScreen from '../OrgFlowScreen/OrgFlowScreen';
import styles from './main.module.scss';

export default function MainScreen() {
    const [showOrg, setShowOrg] = useState(false);
    return (
        <div className={styles.mainWrap}>
            <h1 style={{ margin: 20, opacity: 0.2, textAlign: 'center' }}> AMG avtomarket statistics</h1>
            <div className={styles.fullOrgBtn} onClick={() => setShowOrg(true)}>
                Полная ОРГ-схема
            </div>
            {showOrg && <OrgFlowScreen closeFn={() => setShowOrg(false)} />}
        </div>
    );
}
