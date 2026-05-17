import { useState } from "react";


export function usePopup(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((prev) => !prev);

    return {
        isOpen,
        open,
        close,
        toggle,
    };
}

export default usePopup;