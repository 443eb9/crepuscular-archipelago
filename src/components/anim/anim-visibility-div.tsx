import { HTMLMotionProps, motion } from "motion/react";

export default function AnimVisibilityDiv(props: HTMLMotionProps<"div">) {
    return (
        <motion.div
        {...props}
            initial={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 10 }}
        >
            {props.children}
        </motion.div>
    )
}
