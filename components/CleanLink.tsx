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
