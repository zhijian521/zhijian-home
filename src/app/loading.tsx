import styles from "./loading.module.css";

export default function Loading() {
    return (
        <div aria-live="polite" className={styles.root} role="status">
            <span className={styles.text}>加载中</span>
            <span aria-hidden="true" className={styles.dots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
        </div>
    );
}
