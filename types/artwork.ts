import { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface ArtworkDefinition<P = any, R = any> {
    id: string;
    title: string;
    description: string;
    component: ForwardRefExoticComponent<{ params: P } & RefAttributes<R>>;
    controls: ComponentType<{
        params: P;
        onParamChange: (key: keyof P, value: any) => void;
        onColorChange?: (key: keyof P, value: string) => void;
        tokenInput: string;
        onTokenChange: (value: string) => void;
        onExportImage: () => void;
        onExportGif?: (duration: number, fps: number) => void;
        onExportWallpapers?: () => void;
        onToggleAnimation?: () => void;
        onRandomize: () => void;
        onRegenerate?: () => void;
    }>;
    generator: (token: string) => P;
    randomGenerator?: () => P;
    regenerator?: (currentParams: P) => P;
    defaultParams: P;
}
