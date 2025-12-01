"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface CleanLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onTouchStart?: (e: React.TouchEvent) => void;
    onTouchEnd?: () => void;
    onTouchCancel?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

export default function CleanLink({
    href,
    children,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onContextMenu
}: CleanLinkProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <div
            onClick={handleClick}
            className={`cursor-pointer ${className || ""}`}
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
            onContextMenu={onContextMenu}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(href);
                }
            }}
        >
            {children}
        </div>
    );
}
